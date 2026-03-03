export interface RagChatRequest {
    query: string;
    topK?: number;
}

export interface RagSource {
    source: string;
    page: string;
    similarityScore: number;
}

export interface RagChatResponse {
    query: string;
    answer: string;
    sources: RagSource[];
    sourceCount: number;
}

export interface RagStatusResponse {
    status: string;
    documentsInStore: number;
    collectionName: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: RagSource[];
    timestamp: Date;
}
