import api from '@/lib/api';
import type { RagChatRequest, RagChatResponse, RagStatusResponse } from '@/types/rag.types';

export const ragService = {
    /**
     * Send a chat query to the RAG system
     */
    async sendChatQuery(query: string, topK: number = 5): Promise<RagChatResponse> {
        const request: RagChatRequest = {
            query,
            topK,
        };

        const response = await api.post<RagChatResponse>('/api/rag/chat', request);
        return response.data;
    },

    /**
     * Get the status of the RAG system
     */
    async getRagStatus(): Promise<RagStatusResponse> {
        const response = await api.get<RagStatusResponse>('/api/rag/status');
        return response.data;
    },
};
