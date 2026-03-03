"use client";

import { RagChatbot } from "@/components/RagChatbot";

export default function StudentAIAssistantPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    AI Assistant<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Ask questions about your study materials and get instant AI-powered answers.
                </p>
            </div>

            <RagChatbot />
        </div>
    );
}
