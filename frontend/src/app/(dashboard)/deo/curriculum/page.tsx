"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Loader2, Upload, FileText, BookOpen, Brain, Sparkles,
    CheckCircle2, AlertTriangle, TrendingUp, Target, Lightbulb,
    BarChart3, ArrowRight, Globe, GraduationCap, Award, FlaskConical,
    Wrench, Zap, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */
interface CurriculumInsight {
    topics_covered: string[];
    missing_industry_skills: string[];
    alignment_score: number;
    strengths: string[];
    recommendations: string[];
    industry_trends: string[];
    summary: string;
}

interface TrendingTech {
    name: string;
    description: string;
    demand_level: string;
}

interface SuggestedSubject {
    name: string;
    type: string;
    semester_fit: string;
    reason: string;
}

interface SuggestedLab {
    name: string;
    tools: string[];
    description: string;
}

interface IndustryCert {
    name: string;
    provider: string;
    relevance: string;
}

interface IndustryInsights {
    trending_technologies: TrendingTech[];
    suggested_subjects: SuggestedSubject[];
    suggested_labs: SuggestedLab[];
    industry_certifications: IndustryCert[];
    summary: string;
}

/* ──────────────────────────────────────────────────────────
   Animation Variants
   ────────────────────────────────────────────────────────── */
const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ──────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────── */
export default function DEOCurriculumPage() {
    // Upload state
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    // View state
    const [viewYear, setViewYear] = useState(1);
    const [viewSemester, setViewSemester] = useState(1);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState("");

    // Insights state (per-PDF analysis)
    const [insights, setInsights] = useState<CurriculumInsight | null>(null);
    const [analyzingInsights, setAnalyzingInsights] = useState(false);
    const [insightError, setInsightError] = useState("");

    // Industry AI insights state (standalone, uses Groq compound-beta with web search)
    const [department, setDepartment] = useState<string>("");
    const [industryInsights, setIndustryInsights] = useState<IndustryInsights | null>(null);
    const [fetchingIndustry, setFetchingIndustry] = useState(false);
    const [industryError, setIndustryError] = useState("");

    // Fetch DEO's department on mount
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/deo/my-dept");
                if (res.data?.department) setDepartment(res.data.department);
            } catch {
                // Fallback: leave empty, user can type
            }
        })();
    }, []);

    /* ── Industry AI Insights handler ───────────────────── */
    const handleFetchIndustryInsights = useCallback(async () => {
        if (!department.trim()) return;
        setFetchingIndustry(true);
        setIndustryError("");
        setIndustryInsights(null);

        try {
            const res = await fetch("http://localhost:8000/curriculum/industry-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ department: department.trim() }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.detail || "Failed to fetch industry insights.");
            }

            const data: IndustryInsights = await res.json();
            setIndustryInsights(data);
        } catch (err: any) {
            console.error(err);
            setIndustryError(err?.message || "Failed to fetch industry insights.");
        } finally {
            setFetchingIndustry(false);
        }
    }, [department]);

    /* ── Upload handler ─────────────────────────────────── */
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

            await api.post("/curriculum/add", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadMsg("Curriculum uploaded successfully!");
            setFile(null);
            if (fileRef.current) fileRef.current.value = "";
        } catch (err: any) {
            console.error(err);
            setUploadMsg(err?.response?.data || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    /* ── View PDF handler ───────────────────────────────── */
    const handleViewPdf = async () => {
        setLoadingPdf(true);
        setPdfError("");
        setPdfUrl(null);
        setInsights(null);
        setInsightError("");

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
            const res = await fetch(
                `${API_BASE_URL}/curriculum/view?year=${viewYear}&semester=${viewSemester}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) throw new Error("No curriculum found for the selected year & semester.");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (err: any) {
            setPdfError(err?.message || "Failed to fetch curriculum PDF.");
        } finally {
            setLoadingPdf(false);
        }
    };

    /* ── AI Insights handler ────────────────────────────── */
    const handleAnalyze = async () => {
        setAnalyzingInsights(true);
        setInsightError("");
        setInsights(null);

        try {
            // Re-download the PDF as a blob and send to RAG server
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
            const res = await fetch(
                `${API_BASE_URL}/curriculum/view?year=${viewYear}&semester=${viewSemester}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error("Could not fetch the curriculum file.");

            const blob = await res.blob();
            const pdfFile = new File([blob], "curriculum.pdf", { type: "application/pdf" });

            const fd = new FormData();
            fd.append("file", pdfFile);

            const analysisRes = await fetch("http://localhost:8000/curriculum/analyze", {
                method: "POST",
                body: fd,
            });

            if (!analysisRes.ok) {
                const errorData = await analysisRes.json().catch(() => null);
                throw new Error(errorData?.detail || "Analysis failed.");
            }

            const data: CurriculumInsight = await analysisRes.json();
            setInsights(data);
        } catch (err: any) {
            console.error(err);
            setInsightError(err?.message || "Failed to analyze curriculum.");
        } finally {
            setAnalyzingInsights(false);
        }
    };

    /* ── Alignment colour helper ────────────────────────── */
    const scoreColor = (score: number) => {
        if (score >= 75) return "text-emerald-600";
        if (score >= 50) return "text-amber-500";
        return "text-red-500";
    };
    const scoreBg = (score: number) => {
        if (score >= 75) return "bg-emerald-50 border-emerald-200";
        if (score >= 50) return "bg-amber-50 border-amber-200";
        return "bg-red-50 border-red-200";
    };

    /* ── Render ──────────────────────────────────────────── */
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            {/* ─── Hero Header ─────────────────────────────── */}
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Curriculum<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Upload, preview, and get AI-powered insights on your curriculum documents.
                </p>
            </motion.div>

            {/* ─── AI Industry Insights Section ────────────── */}
            <motion.div variants={item}>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50/60 to-indigo-50/60 dark:from-violet-950/20 dark:to-indigo-950/20 ring-1 ring-violet-200/50 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-b border-violet-200/30">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="h-5 w-5 text-violet-500" />
                            AI Industry Insights
                            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 border border-violet-200">
                                Powered by Groq
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <p className="text-sm text-muted-foreground">
                            Get real-time insights on trending technologies, suggested subjects & labs to make your <strong>{department || "department"}</strong> curriculum industry-ready.
                        </p>

                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2 flex-1 min-w-[200px] max-w-xs">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</Label>
                                <Input
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                    placeholder="e.g. CSE, ECE, IT"
                                    className="bg-white/80 font-semibold"
                                />
                            </div>
                            <Button
                                onClick={handleFetchIndustryInsights}
                                disabled={fetchingIndustry || !department.trim()}
                                className="font-bold shadow-lg shadow-violet-500/20 transition-all hover:scale-105 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            >
                                {fetchingIndustry
                                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing Industry…</>
                                    : <><Zap className="h-4 w-4 mr-2" />Get Industry Insights</>
                                }
                            </Button>
                            {industryInsights && (
                                <Button variant="ghost" size="icon" onClick={handleFetchIndustryInsights} title="Refresh">
                                    <RefreshCw className={cn("h-4 w-4", fetchingIndustry && "animate-spin")} />
                                </Button>
                            )}
                        </div>

                        {industryError && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3"
                            >
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {industryError}
                            </motion.div>
                        )}

                        {/* Loading state */}
                        {fetchingIndustry && !industryInsights && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-12 flex flex-col items-center gap-4"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
                                    <Globe className="h-10 w-10 text-violet-500 animate-pulse relative" />
                                </div>
                                <p className="text-lg font-semibold text-violet-700 dark:text-violet-300">
                                    Searching the web for industry trends…
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Using Groq compound model with real-time web search
                                </p>
                            </motion.div>
                        )}

                        {/* Industry Insights Results */}
                        <AnimatePresence>
                            {industryInsights && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-6"
                                >
                                    {/* Summary */}
                                    <div className="rounded-xl border border-violet-200 bg-white/70 p-5">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                                            <p className="text-sm leading-relaxed text-foreground/90">{industryInsights.summary}</p>
                                        </div>
                                    </div>

                                    {/* Trending Technologies */}
                                    {industryInsights.trending_technologies?.length > 0 && (
                                        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-orange-500" />
                                                <h3 className="font-bold text-base">Trending Technologies</h3>
                                                <span className="ml-auto text-xs font-mono text-muted-foreground">{industryInsights.trending_technologies.length}</span>
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {industryInsights.trending_technologies.map((tech, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors">
                                                        <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                                                            <Zap className="h-4 w-4 text-orange-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-semibold text-sm">{tech.name}</span>
                                                                <span className={cn(
                                                                    "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border",
                                                                    tech.demand_level === "High"
                                                                        ? "bg-red-50 text-red-600 border-red-200"
                                                                        : tech.demand_level === "Rising"
                                                                            ? "bg-amber-50 text-amber-600 border-amber-200"
                                                                            : "bg-blue-50 text-blue-600 border-blue-200"
                                                                )}>{tech.demand_level}</span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{tech.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Suggested Subjects */}
                                        {industryInsights.suggested_subjects?.length > 0 && (
                                            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-5 w-5 text-blue-500" />
                                                    <h3 className="font-bold text-base">Suggested Subjects</h3>
                                                    <span className="ml-auto text-xs font-mono text-muted-foreground">{industryInsights.suggested_subjects.length}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {industryInsights.suggested_subjects.map((sub, i) => (
                                                        <div key={i} className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-semibold text-sm">{sub.name}</span>
                                                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">{sub.type}</span>
                                                                {sub.semester_fit && (
                                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{sub.semester_fit} sem</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{sub.reason}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggested Labs */}
                                        {industryInsights.suggested_labs?.length > 0 && (
                                            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <FlaskConical className="h-5 w-5 text-emerald-500" />
                                                    <h3 className="font-bold text-base">Suggested Labs</h3>
                                                    <span className="ml-auto text-xs font-mono text-muted-foreground">{industryInsights.suggested_labs.length}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {industryInsights.suggested_labs.map((lab, i) => (
                                                        <div key={i} className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-2">
                                                            <span className="font-semibold text-sm">{lab.name}</span>
                                                            <p className="text-xs text-muted-foreground">{lab.description}</p>
                                                            {lab.tools?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {lab.tools.map((tool, j) => (
                                                                        <span key={j} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                            <Wrench className="h-2.5 w-2.5" />{tool}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Industry Certifications */}
                                    {industryInsights.industry_certifications?.length > 0 && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Award className="h-5 w-5 text-amber-500" />
                                                <h3 className="font-bold text-base">Recommended Certifications</h3>
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {industryInsights.industry_certifications.map((cert, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-amber-200/60 bg-white/60">
                                                        <Award className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                                        <div className="min-w-0">
                                                            <span className="font-semibold text-sm">{cert.name}</span>
                                                            <p className="text-xs text-muted-foreground">{cert.provider}</p>
                                                            <p className="text-xs text-amber-700 mt-0.5">{cert.relevance}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ─── Upload Section ──────────────────────────── */}
            <motion.div variants={item}>
                <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-500/5 to-violet-500/5">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Upload className="h-5 w-5 text-indigo-500" />
                            Upload Curriculum PDF
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleUpload} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</Label>
                                    <Select value={year.toString()} onValueChange={v => setYear(parseInt(v))}>
                                        <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4].map(y => (
                                                <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Semester</Label>
                                    <Select value={semester.toString()} onValueChange={v => setSemester(parseInt(v))}>
                                        <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {[1, 2].map(s => (
                                                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">PDF File</Label>
                                    <Input
                                        ref={fileRef}
                                        type="file"
                                        accept="application/pdf"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                        className="bg-muted/50 cursor-pointer file:font-semibold file:text-primary file:mr-3"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={!file || uploading} className="font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                                    {uploading ? "Uploading…" : "Upload Curriculum"}
                                </Button>
                                <AnimatePresence>
                                    {uploadMsg && (
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className={cn(
                                                "text-sm font-medium flex items-center gap-1.5",
                                                uploadMsg.includes("success") ? "text-emerald-600" : "text-destructive"
                                            )}
                                        >
                                            {uploadMsg.includes("success") ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                            {uploadMsg}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ─── View Section ────────────────────────────── */}
            <motion.div variants={item}>
                <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Preview Curriculum
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</Label>
                                <Select value={viewYear.toString()} onValueChange={v => setViewYear(parseInt(v))}>
                                    <SelectTrigger className="w-[140px] bg-muted/50"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4].map(y => (
                                            <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Semester</Label>
                                <Select value={viewSemester.toString()} onValueChange={v => setViewSemester(parseInt(v))}>
                                    <SelectTrigger className="w-[160px] bg-muted/50"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2].map(s => (
                                            <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleViewPdf} disabled={loadingPdf} className="font-bold">
                                {loadingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
                                Load PDF
                            </Button>
                            {pdfUrl && (
                                <Button
                                    variant="outline"
                                    onClick={handleAnalyze}
                                    disabled={analyzingInsights}
                                    className="font-bold border-violet-300 text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                                >
                                    {analyzingInsights
                                        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        : <Brain className="h-4 w-4 mr-2" />
                                    }
                                    {analyzingInsights ? "Analyzing…" : "AI Curriculum Insights"}
                                </Button>
                            )}
                        </div>

                        {pdfError && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3"
                            >
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {pdfError}
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {pdfUrl && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="rounded-xl overflow-hidden border border-border/60 shadow-inner bg-muted/20"
                                >
                                    <iframe
                                        src={pdfUrl}
                                        title="Curriculum PDF"
                                        className="w-full border-0"
                                        style={{ height: "75vh", minHeight: "500px" }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ─── AI Insights Section ─────────────────────── */}
            <AnimatePresence>
                {insightError && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3"
                    >
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {insightError}
                    </motion.div>
                )}

                {analyzingInsights && !insights && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50/80 to-indigo-50/80 dark:from-violet-950/20 dark:to-indigo-950/20 ring-1 ring-violet-200/50">
                            <CardContent className="py-16 flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
                                    <Brain className="h-10 w-10 text-violet-500 animate-pulse relative" />
                                </div>
                                <p className="text-lg font-semibold text-violet-700 dark:text-violet-300">Analyzing curriculum with AI…</p>
                                <p className="text-sm text-muted-foreground">Comparing against modern industry skill requirements</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {insights && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        {/* Hero summary card */}
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50/80 to-indigo-50/80 dark:from-violet-950/20 dark:to-indigo-950/20 ring-1 ring-violet-200/50 overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-violet-500" />
                                    AI Curriculum Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Alignment Score */}
                                <div className={cn(
                                    "flex items-center gap-6 rounded-xl border p-5",
                                    scoreBg(insights.alignment_score)
                                )}>
                                    <div className="flex flex-col items-center justify-center min-w-[100px]">
                                        <span className={cn("text-5xl font-black tabular-nums", scoreColor(insights.alignment_score))}>
                                            {insights.alignment_score}
                                        </span>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">/ 100</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Industry Alignment Score</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{insights.summary}</p>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Topics Covered */}
                                    <InsightCard
                                        icon={<BookOpen className="h-5 w-5 text-blue-500" />}
                                        title="Topics Covered"
                                        items={insights.topics_covered}
                                        badgeColor="bg-blue-50 text-blue-700 border-blue-200"
                                    />

                                    {/* Missing Skills */}
                                    <InsightCard
                                        icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
                                        title="Missing Industry Skills"
                                        items={insights.missing_industry_skills}
                                        badgeColor="bg-amber-50 text-amber-700 border-amber-200"
                                    />

                                    {/* Strengths */}
                                    <InsightCard
                                        icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                        title="Strengths"
                                        items={insights.strengths}
                                        badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
                                    />

                                    {/* Industry Trends */}
                                    <InsightCard
                                        icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
                                        title="Industry Trends"
                                        items={insights.industry_trends}
                                        badgeColor="bg-indigo-50 text-indigo-700 border-indigo-200"
                                    />
                                </div>

                                {/* Recommendations */}
                                <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-violet-500" />
                                        <h3 className="font-bold text-base">Recommendations</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {insights.recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <ArrowRight className="h-4 w-4 mt-0.5 text-violet-400 shrink-0" />
                                                <span className="text-foreground/90">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ──────────────────────────────────────────────────────────
   Helper: Insight Card
   ────────────────────────────────────────────────────────── */
function InsightCard({
    icon,
    title,
    items,
    badgeColor,
}: {
    icon: React.ReactNode;
    title: string;
    items: string[];
    badgeColor: string;
}) {
    return (
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
                {icon}
                <h3 className="font-bold text-base">{title}</h3>
                <span className="ml-auto text-xs font-mono text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {items.length === 0 ? (
                    <span className="text-sm text-muted-foreground">None identified</span>
                ) : (
                    items.map((t, i) => (
                        <span
                            key={i}
                            className={cn(
                                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                                badgeColor
                            )}
                        >
                            {t}
                        </span>
                    ))
                )}
            </div>
        </div>
    );
}
