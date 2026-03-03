"use client";

import { RagChatbot } from "@/components/RagChatbot";

export default function FacultyAIAssistantPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    AI Assistant<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Query your uploaded educational materials with AI-powered search and get detailed answers.
                </p>
            </div>

            <RagChatbot />
        </div>
    );
}
