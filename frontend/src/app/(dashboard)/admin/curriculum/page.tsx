"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Loader2, Upload, FileText, BookOpen, Brain, Sparkles,
    CheckCircle2, AlertTriangle, TrendingUp, Lightbulb, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CurriculumInsight {
    topics_covered: string[];
    missing_industry_skills: string[];
    alignment_score: number;
    strengths: string[];
    recommendations: string[];
    industry_trends: string[];
    summary: string;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AdminCurriculumPage() {
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const [viewYear, setViewYear] = useState(1);
    const [viewSemester, setViewSemester] = useState(1);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState("");

    const [insights, setInsights] = useState<CurriculumInsight | null>(null);
    const [analyzingInsights, setAnalyzingInsights] = useState(false);
    const [insightError, setInsightError] = useState("");

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        setUploadMsg("");
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("year", year.toString());
            fd.append("semester", semester.toString());
            await api.post("/curriculum/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setUploadMsg("Curriculum uploaded successfully!");
            setFile(null);
            if (fileRef.current) fileRef.current.value = "";
        } catch (err: any) {
            setUploadMsg(err?.response?.data || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleViewPdf = async () => {
        setLoadingPdf(true);
        setPdfError("");
        setPdfUrl(null);
        setInsights(null);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
            const res = await fetch(`${API_BASE_URL}/curriculum/view?year=${viewYear}&semester=${viewSemester}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("No curriculum found for selected year & semester.");
            const blob = await res.blob();
            setPdfUrl(URL.createObjectURL(blob));
        } catch (err: any) {
            setPdfError(err?.message || "Failed to fetch curriculum PDF.");
        } finally {
            setLoadingPdf(false);
        }
    };

    const handleAnalyze = async () => {
        setAnalyzingInsights(true);
        setInsightError("");
        setInsights(null);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
            const res = await fetch(`${API_BASE_URL}/curriculum/view?year=${viewYear}&semester=${viewSemester}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Could not fetch the curriculum file.");
            const blob = await res.blob();
            const pdfFile = new File([blob], "curriculum.pdf", { type: "application/pdf" });
            const fd = new FormData();
            fd.append("file", pdfFile);
            const analysisRes = await fetch("http://localhost:8000/curriculum/analyze", { method: "POST", body: fd });
            if (!analysisRes.ok) throw new Error("Analysis failed.");
            setInsights(await analysisRes.json());
        } catch (err: any) {
            setInsightError(err?.message || "Failed to analyze curriculum.");
        } finally {
            setAnalyzingInsights(false);
        }
    };

    const scoreColor = (s: number) => s >= 75 ? "text-emerald-600" : s >= 50 ? "text-amber-500" : "text-red-500";
    const scoreBg = (s: number) => s >= 75 ? "bg-emerald-50 border-emerald-200" : s >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-10">
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Curriculum Management</h1>
                <p className="text-muted-foreground mt-1">Upload, preview, and get AI-powered insights on curriculum documents.</p>
            </motion.div>

            {/* Upload */}
            <motion.div variants={item}>
                <Card className="border-border/60 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-500/5 to-violet-500/5">
                        <CardTitle className="text-lg flex items-center gap-2"><Upload className="h-5 w-5 text-indigo-500" />Upload Curriculum PDF</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleUpload} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</Label>
                                    <Select value={year.toString()} onValueChange={v => setYear(parseInt(v))}><SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4].map(y => <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Semester</Label>
                                    <Select value={semester.toString()} onValueChange={v => setSemester(parseInt(v))}><SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger><SelectContent>{[1,2].map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">PDF File</Label>
                                    <Input ref={fileRef} type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="bg-muted/50 cursor-pointer file:font-semibold file:text-primary file:mr-3" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={!file || uploading} className="font-bold shadow-lg shadow-primary/20">
                                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                                    {uploading ? "Uploading..." : "Upload Curriculum"}
                                </Button>
                                {uploadMsg && <p className={cn("text-sm font-medium flex items-center gap-1.5", uploadMsg.includes("success") ? "text-emerald-600" : "text-destructive")}>{uploadMsg.includes("success") ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{uploadMsg}</p>}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* View */}
            <motion.div variants={item}>
                <Card className="border-border/60 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                        <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-blue-500" />Preview Curriculum</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</Label>
                                <Select value={viewYear.toString()} onValueChange={v => setViewYear(parseInt(v))}><SelectTrigger className="w-[140px] bg-muted/50"><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4].map(y => <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>)}</SelectContent></Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Semester</Label>
                                <Select value={viewSemester.toString()} onValueChange={v => setViewSemester(parseInt(v))}><SelectTrigger className="w-[160px] bg-muted/50"><SelectValue /></SelectTrigger><SelectContent>{[1,2].map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}</SelectContent></Select>
                            </div>
                            <Button onClick={handleViewPdf} disabled={loadingPdf} className="font-bold">{loadingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}Load PDF</Button>
                            {pdfUrl && <Button variant="outline" onClick={handleAnalyze} disabled={analyzingInsights} className="font-bold border-violet-300 text-violet-600 hover:bg-violet-50">{analyzingInsights ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}{analyzingInsights ? "Analyzing..." : "AI Insights"}</Button>}
                        </div>
                        {pdfError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3"><AlertTriangle className="h-4 w-4" />{pdfError}</div>}
                        <AnimatePresence>{pdfUrl && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl overflow-hidden border border-border/60 shadow-inner bg-muted/20"><iframe src={pdfUrl} title="Curriculum PDF" className="w-full border-0" style={{ height: "70vh", minHeight: "500px" }} /></motion.div>}</AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* AI Insights */}
            <AnimatePresence>
                {insightError && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3"><AlertTriangle className="h-4 w-4" />{insightError}</motion.div>}
                {analyzingInsights && !insights && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50/80 to-indigo-50/80">
                            <CardContent className="py-16 flex flex-col items-center gap-4">
                                <Brain className="h-10 w-10 text-violet-500 animate-pulse" />
                                <p className="text-lg font-semibold text-violet-700">Analyzing curriculum with AI...</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
                {insights && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50/80 to-indigo-50/80 overflow-hidden">
                            <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-500" />AI Curriculum Insights</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className={cn("flex items-center gap-6 rounded-xl border p-5", scoreBg(insights.alignment_score))}>
                                    <div className="flex flex-col items-center min-w-[100px]">
                                        <span className={cn("text-5xl font-black tabular-nums", scoreColor(insights.alignment_score))}>{insights.alignment_score}</span>
                                        <span className="text-xs font-semibold uppercase text-muted-foreground mt-1">/ 100</span>
                                    </div>
                                    <div><h3 className="font-bold text-lg">Industry Alignment Score</h3><p className="text-sm text-muted-foreground mt-1">{insights.summary}</p></div>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <InsightCard icon={<BookOpen className="h-5 w-5 text-blue-500" />} title="Topics Covered" items={insights.topics_covered} color="bg-blue-50 text-blue-700 border-blue-200" />
                                    <InsightCard icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} title="Missing Skills" items={insights.missing_industry_skills} color="bg-amber-50 text-amber-700 border-amber-200" />
                                    <InsightCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} title="Strengths" items={insights.strengths} color="bg-emerald-50 text-emerald-700 border-emerald-200" />
                                    <InsightCard icon={<TrendingUp className="h-5 w-5 text-indigo-500" />} title="Industry Trends" items={insights.industry_trends} color="bg-indigo-50 text-indigo-700 border-indigo-200" />
                                </div>
                                <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-5 space-y-3">
                                    <div className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-violet-500" /><h3 className="font-bold">Recommendations</h3></div>
                                    <ul className="space-y-2">{insights.recommendations.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm"><ArrowRight className="h-4 w-4 mt-0.5 text-violet-400 shrink-0" /><span>{r}</span></li>)}</ul>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function InsightCard({ icon, title, items, color }: { icon: React.ReactNode; title: string; items: string[]; color: string }) {
    return (
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">{icon}<h3 className="font-bold text-base">{title}</h3><span className="ml-auto text-xs font-mono text-muted-foreground">{items.length}</span></div>
            <div className="flex flex-wrap gap-2">
                {items.length === 0 ? <span className="text-sm text-muted-foreground">None identified</span> : items.map((t, i) => <span key={i} className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium", color)}>{t}</span>)}
            </div>
        </div>
    );
}
