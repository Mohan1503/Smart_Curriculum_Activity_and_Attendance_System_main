"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, BookOpen, AlertTriangle, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function StudentCurriculumPage() {
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLoad = async () => {
        setLoading(true);
        setError("");
        setPdfUrl(null);

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
            const res = await fetch(
                `${API_BASE_URL}/curriculum/view?year=${year}&semester=${semester}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) throw new Error("No curriculum found for the selected year and semester.");

            const blob = await res.blob();
            if (blob.size < 100) throw new Error("No curriculum document has been uploaded for this selection yet.");

            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (err: any) {
            setError(err?.message || "Failed to load curriculum.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            {/* ─── Header ─────────────────────────────────── */}
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Curriculum<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    View your semester curriculum documents uploaded by the department.
                </p>
            </motion.div>

            {/* ─── Selector & Viewer ──────────────────────── */}
            <motion.div variants={item}>
                <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-500" />
                            Curriculum Document
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</Label>
                                <Select value={year.toString()} onValueChange={v => setYear(parseInt(v))}>
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
                                <Select value={semester.toString()} onValueChange={v => setSemester(parseInt(v))}>
                                    <SelectTrigger className="w-[160px] bg-muted/50"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2].map(s => (
                                            <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleLoad} disabled={loading} className="font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
                                View Curriculum
                            </Button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3"
                            >
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {pdfUrl ? (
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
                            ) : !loading && !error ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground"
                                >
                                    <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                        <Layers className="h-8 w-8 opacity-40" />
                                    </div>
                                    <p className="text-base font-medium">Select year and semester, then click &quot;View Curriculum&quot;</p>
                                    <p className="text-sm mt-1 opacity-70">The PDF will be displayed here inline.</p>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
