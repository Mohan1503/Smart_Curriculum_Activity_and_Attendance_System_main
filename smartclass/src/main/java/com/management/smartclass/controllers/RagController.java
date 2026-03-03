package com.management.smartclass.controllers;

import com.management.smartclass.payload.RagChatRequest;
import com.management.smartclass.payload.RagChatResponse;
import com.management.smartclass.payload.RagStatusResponse;
import com.management.smartclass.services.RagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    @Autowired
    private RagService ragService;

    /**
     * Send a chat query to the RAG system
     * Accessible to all authenticated users
     */
    @PostMapping("/chat")
    public ResponseEntity<RagChatResponse> chat(@RequestBody RagChatRequest request) {
        if (request.getQuery() == null || request.getQuery().trim().isEmpty()) {
            RagChatResponse errorResponse = new RagChatResponse();
            errorResponse.setQuery("");
            errorResponse.setAnswer("Please provide a valid query.");
            errorResponse.setSources(java.util.Collections.emptyList());
            errorResponse.setSourceCount(0);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        RagChatResponse response = ragService.chatQuery(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get the status of the RAG system
     * Accessible to all authenticated users
     */
    @GetMapping("/status")
    public ResponseEntity<RagStatusResponse> getStatus() {
        RagStatusResponse status = ragService.getStatus();
        return ResponseEntity.ok(status);
    }
}
