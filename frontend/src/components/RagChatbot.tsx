"use client";

import { useState, useRef, useEffect } from "react";
import { ragService } from "@/services/ragService";
import type { ChatMessage, RagSource } from "@/types/rag.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Send,
    Bot,
    User,
    Copy,
    CheckCheck,
    Sparkles,
    FileText,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function RagChatbot() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await ragService.sendChatQuery(input.trim());

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.answer,
                sources: response.sources,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error sending message:", error);

            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content:
                    "I apologize, but I encountered an error processing your request. Please ensure the RAG server is running and try again.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const exampleQuestions = [
        "What is attention mechanism?",
        "Explain neural networks",
        "What are transformers in AI?",
        "How does backpropagation work?",
    ];

    return (
        <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col h-[calc(100vh-16rem)]">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-8">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-8 w-8 text-primary" />
                            </div>

                            <div className="text-center space-y-3">
                                <h2 className="text-2xl font-bold text-foreground">
                                    Ask me anything
                                </h2>
                                <p className="text-muted-foreground max-w-md">
                                    I can help you understand concepts, explain topics, and answer questions based on uploaded documents.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                {exampleQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInput(question)}
                                        className="group p-4 text-left rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all duration-300 hover:shadow-md"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                                                {question}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
                                    message.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {message.role === "assistant" && (
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Bot className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>
                                )}

                                <div
                                    className={cn(
                                        "flex flex-col gap-2 max-w-[80%]",
                                        message.role === "user" && "items-end"
                                    )}
                                >
                                    <Card
                                        className={cn(
                                            "p-4 transition-all duration-300",
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground border-0 shadow-md"
                                                : "bg-card border-border hover:shadow-md"
                                        )}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                        </p>

                                        {message.role === "assistant" && (
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(message.content, message.id)}
                                                    className="h-7 text-xs hover:bg-primary/10 hover:text-primary"
                                                >
                                                    {copiedId === message.id ? (
                                                        <>
                                                            <CheckCheck className="h-3 w-3 mr-1" />
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3 w-3 mr-1" />
                                                            Copy
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </Card>

                                    {/* Sources */}
                                    {message.sources && message.sources.length > 0 && (
                                        <div className="space-y-2 w-full">
                                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                <FileText className="h-3 w-3" />
                                                Sources ({message.sources.length})
                                            </p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {message.sources.map((source, idx) => (
                                                    <Card
                                                        key={idx}
                                                        className="p-3 bg-muted/50 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-sm"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-foreground truncate">
                                                                    {source.source}
                                                                </p>
                                                                {source.page !== "N/A" && (
                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                        Page {source.page}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <div className="px-2 py-1 rounded-md bg-primary/10 text-primary">
                                                                    <p className="text-xs font-medium">
                                                                        {(source.similarityScore * 100).toFixed(0)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {message.role === "user" && (
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bot className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <Card className="p-4 bg-card border-border">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                </div>
                            </Card>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask a question about your study materials..."
                                disabled={isLoading}
                                rows={1}
                                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                style={{
                                    minHeight: "48px",
                                    maxHeight: "120px",
                                }}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isLoading}
                                size="icon"
                                className="absolute right-2 bottom-2 h-8 w-8 rounded-lg shadow-md disabled:opacity-50 disabled:shadow-none transition-all duration-300"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">Shift+Enter</kbd> for new line
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
