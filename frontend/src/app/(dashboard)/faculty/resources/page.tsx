"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Loader2,
    Upload,
    CheckCircle,
    FileText,
    Eye,
    AlertCircle,
    CloudUpload,
    File,
    X,
    Search,
    ExternalLink,
    Layers,
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
    dept?: string;
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
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    return new Date(dateInput).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export default function FacultyResourcesPage() {
    const [activeTab, setActiveTab] = useState<"upload" | "department">("upload");
    const [loading, setLoading] = useState(false);
    const [fetchingResources, setFetchingResources] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [myResources, setMyResources] = useState<ResourceMeta[]>([]);

    // Department resources state
    const [deptResources, setDeptResources] = useState<ResourceMeta[]>([]);
    const [filteredDeptResources, setFilteredDeptResources] = useState<ResourceMeta[]>([]);
    const [deptLoading, setDeptLoading] = useState(true);
    const [deptSearch, setDeptSearch] = useState("");

    // Form state
    const [subject, setSubject] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const fetchMyResources = useCallback(async () => {
        try {
            const res = await api.get("/faculty/resources/my-uploads");
            setMyResources(res.data);
        } catch (err) {
            console.error("Failed to fetch resources:", err);
        } finally {
            setFetchingResources(false);
        }
    }, []);

    const fetchDeptResources = useCallback(async () => {
        setDeptLoading(true);
        try {
            const res = await api.get("/faculty/resources/my-dept");
            if (Array.isArray(res.data)) {
                setDeptResources(res.data);
                setFilteredDeptResources(res.data);
            } else {
                setDeptResources([]);
                setFilteredDeptResources([]);
            }
        } catch (err) {
            console.error("Failed to fetch department resources:", err);
            setDeptResources([]);
            setFilteredDeptResources([]);
        } finally {
            setDeptLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyResources();
        fetchDeptResources();
    }, [fetchMyResources, fetchDeptResources]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== "application/pdf") {
                setMessage({ type: 'error', text: "Only PDF files are allowed." });
                return;
            }
            setSelectedFile(file);
            setMessage(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.type !== "application/pdf") {
                setMessage({ type: 'error', text: "Only PDF files are allowed." });
                return;
            }
            setSelectedFile(file);
            setMessage(null);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !subject.trim()) {
            setMessage({ type: 'error', text: "Please select a PDF file and enter a subject code." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("subject", subject.trim().toUpperCase());

            await api.post("/faculty/resources/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setMessage({ type: 'success', text: `"${selectedFile.name}" uploaded successfully!` });
            setSelectedFile(null);
            setSubject("");
            fetchMyResources();
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to upload resource. Please try again.";
            setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : "Upload failed." });
        } finally {
            setLoading(false);
        }
    };

    const handleViewPdf = async (id: number) => {
        try {
            const response = await api.get(`/faculty/resources/view/${id}`, {
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, "_blank");
        } catch (error) {
            console.error("Error viewing PDF:", error);
            setMessage({ type: 'error', text: "Failed to load PDF. Please try again." });
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    const handleDeptSearchChange = (value: string) => {
        setDeptSearch(value);
        if (!value.trim()) {
            setFilteredDeptResources(deptResources);
        } else {
            const q = value.trim().toLowerCase();
            setFilteredDeptResources(
                deptResources.filter(r =>
                    r.subject.toLowerCase().includes(q) ||
                    r.fileName.toLowerCase().includes(q) ||
                    r.uploadedBy.toLowerCase().includes(q)
                )
            );
        }
    };

    const handleViewPdfDept = async (id: number) => {
        try {
            const response = await api.get(`/faculty/resources/view/${id}`, {
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, "_blank");
        } catch (error) {
            console.error("Error viewing PDF:", error);
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-5xl mx-auto space-y-8 pb-10"
        >
            {/* Header */}
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Resources<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Upload materials or browse your department&apos;s shared resources.
                </p>
            </motion.div>

            {/* Tab Switcher */}
            <motion.div variants={item} className="flex gap-2 bg-muted/40 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("upload")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "upload"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Upload & My Resources
                </button>
                <button
                    onClick={() => setActiveTab("department")}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                        activeTab === "department"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Department Resources
                    {!deptLoading && deptResources.length > 0 && (
                        <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {deptResources.length}
                        </span>
                    )}
                </button>
            </motion.div>

            {/* Upload Form Card */}
            {activeTab === "upload" && (
            <>
            <motion.div variants={item}>
                <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-sm ring-1 ring-border/50">
                    <CardHeader className="pb-4 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Upload className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>Upload PDF Material</CardTitle>
                                <CardDescription>Select a PDF file and specify the subject code.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Message Display */}
                            <AnimatePresence mode="wait">
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${message.type === 'success'
                                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-600 border border-red-500/20'
                                            }`}
                                    >
                                        {message.type === 'success'
                                            ? <CheckCircle className="h-4 w-4 shrink-0" />
                                            : <AlertCircle className="h-4 w-4 shrink-0" />
                                        }
                                        {message.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Subject Code Input */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject Code</Label>
                                <Input
                                    id="subject"
                                    placeholder="e.g. CS302, MATH101"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    required
                                    className="bg-background/50 font-mono uppercase max-w-xs"
                                />
                            </div>

                            {/* Drag and Drop Upload Zone */}
                            <div className="space-y-2">
                                <Label>PDF File</Label>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer
                                        ${isDragOver
                                            ? 'border-primary bg-primary/5 scale-[1.02]'
                                            : selectedFile
                                                ? 'border-emerald-500/50 bg-emerald-50/50'
                                                : 'border-border/60 hover:border-primary/50 hover:bg-muted/30'
                                        }`}
                                    onClick={() => !selectedFile && document.getElementById('file-input')?.click()}
                                >
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    {selectedFile ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                                                    <File className="h-6 w-6 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{selectedFile.name}</p>
                                                    <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearFile();
                                                }}
                                                className="hover:bg-red-100 hover:text-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <CloudUpload className={`h-12 w-12 mx-auto mb-4 transition-colors ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <p className="font-semibold text-foreground mb-1">
                                                {isDragOver ? "Drop your PDF here" : "Drag and drop your PDF"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                or <span className="text-primary font-medium hover:underline">browse files</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                PDF files only, max 50MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                                disabled={loading || !selectedFile}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Resource
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* My Uploads Section */}
            <motion.div variants={item}>
                <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-sm ring-1 ring-border/50">
                    <CardHeader className="pb-4 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle>My Uploads</CardTitle>
                                <CardDescription>Resources you have shared with students.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {fetchingResources ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : myResources.length === 0 ? (
                            <div className="text-center py-12 opacity-60">
                                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-lg font-medium">No resources uploaded yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Upload your first PDF material using the form above.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myResources.map((resource, idx) => (
                                    <motion.div
                                        key={resource.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleViewPdf(resource.id)}
                                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                                <FileText className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-foreground truncate" title={resource.fileName}>
                                                    {resource.fileName}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                        {resource.subject}
                                                    </span>
                                                    <span>{formatFileSize(resource.fileSize)}</span>
                                                    <span>{formatDate(resource.uploadedAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewPdf(resource.id);
                                                }}
                                                className="hover:bg-blue-100 hover:text-blue-600"
                                                title="View PDF"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
            </>
            )}

            {/* Department Resources Tab */}
            {activeTab === "department" && (
            <>
            {/* Search Bar */}
            <motion.div variants={item}>
                <Card className="border-0 shadow-md bg-card/60 backdrop-blur-sm ring-1 ring-border/50">
                    <CardContent className="p-6">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <Label>Search Resources</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by subject code, file name, or faculty..."
                                        value={deptSearch}
                                        onChange={e => handleDeptSearchChange(e.target.value)}
                                        className="pl-9 font-mono uppercase"
                                    />
                                </div>
                            </div>
                            {deptSearch && (
                                <Button variant="outline" onClick={() => handleDeptSearchChange("")}>
                                    Clear
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={fetchDeptResources} title="Refresh List">
                                <RefreshCw className={deptLoading ? "animate-spin" : ""} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Department Resources Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                    {deptLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
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
                    ) : filteredDeptResources.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full text-center py-20 opacity-60"
                        >
                            <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-xl font-medium">No department resources found.</p>
                            <p className="text-muted-foreground">Try a different search or check back later.</p>
                        </motion.div>
                    ) : (
                        filteredDeptResources.map((res, idx) => (
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
                                                onClick={() => handleViewPdfDept(res.id)}
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
                                                <span className="font-medium text-foreground truncate max-w-[140px]">{res.uploadedBy}</span>
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
                                            onClick={() => handleViewPdfDept(res.id)}
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
            </>
            )}
        </motion.div>
    );
}
