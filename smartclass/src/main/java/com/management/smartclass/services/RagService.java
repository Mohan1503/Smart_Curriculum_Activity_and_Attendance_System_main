package com.management.smartclass.services;

import com.management.smartclass.payload.RagChatRequest;
import com.management.smartclass.payload.RagChatResponse;
import com.management.smartclass.payload.RagStatusResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class RagService {

    @Value("${rag.server.url:http://localhost:8000}")
    private String ragServerUrl;

    @Value("${rag.server.enabled:true}")
    private boolean ragEnabled;

    private final RestTemplate restTemplate;

    public RagService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Asynchronously ingest a document into the RAG vector database
     */
    @Async
    public CompletableFuture<Boolean> ingestDocumentAsync(String filePath) {
        if (!ragEnabled) {
            System.out.println("⚠️ RAG server is disabled. Skipping ingestion for: " + filePath);
            return CompletableFuture.completedFuture(false);
        }

        try {
            String url = ragServerUrl + "/ingest";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("path", filePath);
            requestBody.put("chunk_size", 1000);
            requestBody.put("chunk_overlap", 200);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate
                    .postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                System.out.println("✅ RAG Ingestion successful for: " + filePath);
                System.out.println("   Response: " + response.getBody());
                return CompletableFuture.completedFuture(true);
            } else {
                System.err.println("❌ RAG Ingestion failed for: " + filePath);
                System.err.println("   Status: " + response.getStatusCode());
                return CompletableFuture.completedFuture(false);
            }
        } catch (Exception e) {
            System.err.println("❌ RAG Ingestion error for: " + filePath);
            System.err.println("   Error: " + e.getMessage());
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Send a chat query to the RAG system and get an AI-generated response
     */
    public RagChatResponse chatQuery(RagChatRequest request) {
        if (!ragEnabled) {
            return createErrorResponse(request.getQuery(), "RAG server is currently disabled.");
        }

        try {
            String url = ragServerUrl + "/rag";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", request.getQuery());
            requestBody.put("top_k", request.getTopK());
            requestBody.put("score_threshold", 0.0);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> httpRequest = new HttpEntity<>(requestBody, headers);

            ResponseEntity<RagChatResponse> response = restTemplate.postForEntity(
                    url,
                    httpRequest,
                    RagChatResponse.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            } else {
                return createErrorResponse(request.getQuery(), "Failed to get response from RAG server.");
            }
        } catch (Exception e) {
            System.err.println("❌ RAG Chat query error: " + e.getMessage());
            return createErrorResponse(
                    request.getQuery(),
                    "An error occurred while processing your query. Please try again later.");
        }
    }

    /**
     * Get the status of the RAG system
     */
    public RagStatusResponse getStatus() {
        if (!ragEnabled) {
            RagStatusResponse response = new RagStatusResponse();
            response.setStatus("disabled");
            response.setDocumentsInStore(0);
            response.setCollectionName("N/A");
            return response;
        }

        try {
            String url = ragServerUrl + "/status";

            ResponseEntity<RagStatusResponse> response = restTemplate.getForEntity(
                    url,
                    RagStatusResponse.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            } else {
                return createErrorStatus();
            }
        } catch (Exception e) {
            System.err.println("❌ RAG Status check error: " + e.getMessage());
            return createErrorStatus();
        }
    }

    private RagChatResponse createErrorResponse(String query, String errorMessage) {
        RagChatResponse response = new RagChatResponse();
        response.setQuery(query);
        response.setAnswer(errorMessage);
        response.setSources(java.util.Collections.emptyList());
        response.setSourceCount(0);
        return response;
    }

    private RagStatusResponse createErrorStatus() {
        RagStatusResponse response = new RagStatusResponse();
        response.setStatus("error");
        response.setDocumentsInStore(0);
        response.setCollectionName("N/A");
        return response;
    }
}
