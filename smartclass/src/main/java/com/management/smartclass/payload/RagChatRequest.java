package com.management.smartclass.payload;

public class RagChatRequest {
    private String query;
    private int topK = 5;

    public RagChatRequest() {
    }

    public RagChatRequest(String query, int topK) {
        this.query = query;
        this.topK = topK;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public int getTopK() {
        return topK;
    }

    public void setTopK(int topK) {
        this.topK = topK;
    }
}
