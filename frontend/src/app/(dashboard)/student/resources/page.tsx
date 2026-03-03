"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Loader2,
    Search,
    ExternalLink,
    FileText,
    Layers,
    Eye,
    Calendar,
    User,
    RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResourceMeta {
    id: number;
    fileName: string;
    subject: string;
    fileSize: number;
    uploadedAt: string | number[];
    uploadedBy: string;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateInput: string | number[]): string {
    if (!dateInput) return "Unknown Date";

    if (Array.isArray(dateInput)) {
        const [year, month, day, hour = 0, minute = 0] = dateInput;
        // Month is 0-indexed in JS Date
        return new Date(year, month - 1, day, hour, minute).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    return new Date(dateInput).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

export default function StudentResourcesPage() {
    const [loading, setLoading] = useState(true);
    const [searchCode, setSearchCode] = useState("");
    const [resources, setResources] = useState<ResourceMeta[]>([]);
    const [filteredResources, setFilteredResources] = useState<ResourceMeta[]>([]);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/faculty/resources/my-dept");
            if (Array.isArray(res.data)) {
                setResources(res.data);
                setFilteredResources(res.data);
            } else {
                setResources([]);
                setFilteredResources([]);
            }
        } catch (err) {
            console.error("Failed to fetch department resources:", err);
            setResources([]);
            setFilteredResources([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    // Handle client-side filtering as user types for instant results
    const handleSearchChange = (value: string) => {
        setSearchCode(value);
        if (!value.trim()) {
            setFilteredResources(resources);
        } else {
            const q = value.trim().toLowerCase();
            setFilteredResources(
                resources.filter(r =>
                    r.subject.toLowerCase().includes(q) ||
                    r.fileName.toLowerCase().includes(q) ||
                    r.uploadedBy.toLowerCase().includes(q)
                )
            );
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchCode.trim()) {
            setFilteredResources(resources);
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(`/faculty/resources/subject/${searchCode.trim()}`);
            if (Array.isArray(res.data)) {
                setFilteredResources(res.data);
            } else {
                setFilteredResources([]);
            }
        } catch (err) {
            console.error(err);
            setFilteredResources([]);
        } finally {
            setLoading(false);
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchCode("");
        setFilteredResources(resources);
    };

    const handleViewPdf = async (id: number) => {
        try {
            setLoading(true);
            const response = await api.get(`/faculty/resources/view/${id}`, {
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, "_blank");
        } catch (error) {
            console.error("Error viewing PDF:", error);
        } finally {
            setLoading(false);
        }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Department Resources<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Browse and download study materials shared by your department faculty.
                    {!loading && resources.length > 0 && (
                        <span className="ml-2 inline-flex items-center font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {resources.length} resource{resources.length !== 1 ? "s" : ""} available
                        </span>
                    )}
                </p>
            </div>

            {/* Search Bar */}
            <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label>Search by Subject</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by subject code, file name, or faculty..."
                                    value={searchCode}
                                    onChange={e => handleSearchChange(e.target.value)}
                                    className="pl-9 font-mono uppercase"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="font-bold min-w-[120px]" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                        {searchCode && (
                            <Button type="button" variant="outline" onClick={clearSearch}>
                                Clear
                            </Button>
                        )}
                        <Button type="button" variant="ghost" size="icon" onClick={fetchResources} title="Refresh List">
                            <RefreshCw className={loading ? "animate-spin" : ""} />
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Resources Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        // Loading skeleton cards
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={`skel-${i}`} className="animate-pulse">
                                <Card className="h-full border-border/40">
                                    <CardHeader className="pb-3">
                                        <div className="h-12 w-12 rounded-xl bg-muted mb-3" />
                                        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-muted rounded w-1/3" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 border-t border-border/50 pt-4 mb-4">
                                            <div className="h-3 bg-muted rounded w-full" />
                                            <div className="h-3 bg-muted rounded w-2/3" />
                                            <div className="h-3 bg-muted rounded w-1/2" />
                                        </div>
                                        <div className="h-9 bg-muted rounded w-full" />
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    ) : filteredResources.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full text-center py-20 opacity-60"
                        >
                            <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-xl font-medium">No resources found.</p>
                            <p className="text-muted-foreground">Try a different subject code or check back later.</p>
                        </motion.div>
                    ) : (
                        filteredResources.map((res, idx) => (
                            <motion.div
                                key={res.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: idx * 0.05 }}
                            >
                                <Card className="h-full hover:shadow-xl transition-all border-border/60 hover:border-primary/40 group flex flex-col bg-card/50 backdrop-blur-sm">
                                    <CardHeader className="pb-3 relative">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => handleViewPdf(res.id)}
                                                className="h-8 w-8 rounded-full shadow-sm"
                                                title="Open PDF"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center text-red-600 shadow-sm border border-red-200/50 mb-3">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="leading-snug line-clamp-2 text-lg" title={res.fileName}>
                                            {res.fileName}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                {res.subject}
                                            </span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="mt-auto pt-0">
                                        <div className="space-y-2 text-sm text-muted-foreground mb-4 border-t border-border/50 pt-4">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> Faculty</span>
                                                <span className="font-medium text-foreground truncate max-w-[100px]">{res.uploadedBy}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Date</span>
                                                <span>{formatDate(res.uploadedAt)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> Size</span>
                                                <span>{formatFileSize(res.fileSize)}</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleViewPdf(res.id)}
                                            className="w-full font-semibold shadow-sm"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Document
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
