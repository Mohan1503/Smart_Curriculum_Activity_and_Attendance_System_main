"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, UserPlus, Check, X, ShieldAlert, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function AttendanceMonitorContent() {
    const searchParams = useSearchParams();

    // State
    const [subjectCode, setSubjectCode] = useState(searchParams.get("subject") || "");
    const [date, setDate] = useState(searchParams.get("date") || new Date().toISOString().split("T")[0]);
    const [startTime, setStartTime] = useState(searchParams.get("start") || "");

    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [newEmail, setNewEmail] = useState("");

    // Fetch Attendance
    const fetchAttendance = useCallback(async () => {
        if (!subjectCode || !date || !startTime) return;

        // Only set global loading on first load or manual refresh, not auto-refresh
        if (!autoRefresh) setLoading(true);

        try {
            const res = await api.get(`/faculty/attendance/monitor?subjectCode=${subjectCode}&date=${date}&startTime=${startTime}`);
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            if (!autoRefresh) setLoading(false);
        }
    }, [subjectCode, date, startTime, autoRefresh]);

    // Initial Load & Auto Refresh Effect
    useEffect(() => {
        if (subjectCode && date && startTime) {
            fetchAttendance();
        }
    }, []); // Run once on mount if params exist

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchAttendance, 5000); // Poll every 5s
        }
        return () => clearInterval(interval);
    }, [autoRefresh, fetchAttendance]);

    // Actions
    const toggleAttendance = async (studentEmail: string, currentStatus: boolean) => {
        // Optimistic update
        setStudents(prev => prev.map(s =>
            s.studentEmail === studentEmail ? { ...s, present: !currentStatus } : s
        ));

        try {
            await api.post("/faculty/attendance/manual", {
                studentEmail,
                subjectCode,
                date,
                startTime,
                present: !currentStatus
            });
            // No need to refetch immediately if optimistic, but good for sync
        } catch (e) {
            // Revert on error
            setStudents(prev => prev.map(s =>
                s.studentEmail === studentEmail ? { ...s, present: currentStatus } : s
            ));
            console.error("Failed to update");
        }
    };

    const markNewStudent = async () => {
        if (!newEmail) return;
        try {
            await api.post("/faculty/attendance/manual", {
                studentEmail: newEmail,
                subjectCode,
                date,
                startTime,
                present: true
            });
            setNewEmail("");
            fetchAttendance();
        } catch (e) {
            console.error("Failed to add student");
        }
    };

    // Stats Calculation
    const total = students.length;
    const presentCount = students.filter(s => s.present).length;
    const absentCount = total - presentCount;
    const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

    // Animation Variants
    const statsVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Monitor</h1>
                    <p className="text-muted-foreground mt-1">Real-time attendance tracking and management.</p>
                </div>
                <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg shadow-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={cn("gap-2 text-xs font-medium transition-colors", autoRefresh && "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800")}
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", autoRefresh && "animate-spin")} />
                        {autoRefresh ? "Live Sync On" : "Live Sync Off"}
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button variant="ghost" size="sm" onClick={() => fetchAttendance()} disabled={loading || autoRefresh}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Controls & Stats Grid */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Control Panel */}
                <Card className="md:col-span-8 shadow-md border-border/60">
                    <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Session Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject Code</label>
                            <Input
                                value={subjectCode}
                                onChange={e => setSubjectCode(e.target.value)}
                                placeholder="e.g. CS101"
                                className="h-9 bg-background/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
                            <Input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="h-9 bg-background/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Time</label>
                            <div className="flex gap-2">
                                <Input
                                    type="time"
                                    step="1"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="h-9 bg-background/50"
                                />
                                <Button size="sm" onClick={() => fetchAttendance()} disabled={loading} className="px-3">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Widget */}
                <Card className="md:col-span-4 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-md border-indigo-100 dark:border-slate-700">
                    <CardContent className="p-6 flex items-center justify-between h-full">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                            <motion.div
                                key={percentage}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-black text-indigo-600 dark:text-indigo-400"
                            >
                                {total > 0 ? percentage : 0}%
                            </motion.div>
                            <p className="text-xs text-muted-foreground flex gap-2">
                                <span className="text-green-600 font-medium">{presentCount} Present</span>
                                <span>•</span>
                                <span className="text-red-500 font-medium">{absentCount} Absent</span>
                            </p>
                        </div>

                        {/* CSS Donut Chart */}
                        <div className="relative h-20 w-20 flex items-center justify-center">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                {/* Background Circle */}
                                <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                {/* Progress Circle */}
                                <motion.path
                                    className="text-indigo-600"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray={`${percentage}, 100`}
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-bold text-foreground">Total {total}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Student List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-8"
                >
                    <Card className="h-full border-border/60 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-lg">Marked Students</CardTitle>
                            <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {total} Records
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
                                {students.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                        <div className="bg-muted rounded-full p-4 mb-3">
                                            <Search className="h-6 w-6 opacity-40" />
                                        </div>
                                        <p>No attendance records found yet.</p>
                                        <p className="text-xs mt-1">Students will appear here as they scan.</p>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {students.map((att, i) => (
                                            <motion.div
                                                key={att.studentEmail} // Use email as key
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={cn(
                                                    "flex items-center justify-between p-4 hover:bg-muted/30 transition-colors",
                                                    att.present ? "bg-green-50/50 dark:bg-green-900/10" : "bg-red-50/50 dark:bg-red-900/10"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-offset-2 ring-offset-background",
                                                        att.present ? "bg-green-100 text-green-700 ring-green-500/20" : "bg-red-100 text-red-700 ring-red-500/20"
                                                    )}>
                                                        {att.studentEmail.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-foreground">{att.studentEmail}</p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            ID: <span className="font-mono">{att.id}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                        att.present
                                                            ? "bg-green-100 text-green-700 border-green-200"
                                                            : "bg-red-100 text-red-700 border-red-200"
                                                    )}>
                                                        {att.present ? "Present" : "Absent"}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                        onClick={() => toggleAttendance(att.studentEmail, att.present)}
                                                    >
                                                        <div className="sr-only">Toggle</div>
                                                        {att.present ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Manual Entry Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-4 space-y-6"
                >
                    <Card className="border-border/60 shadow-md">
                        <CardHeader className="pb-3 bg-muted/20 border-b border-border/50">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Manual Entry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-lg flex gap-3 text-sm text-amber-800">
                                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                                <p className="text-xs leading-relaxed">
                                    Only add students who are physically present but unable to scan due to technical issues.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student Email</label>
                                <Input
                                    placeholder="student@college.edu"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                onClick={markNewStudent}
                                disabled={!newEmail}
                            >
                                Mark Present
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="p-4 flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <RefreshCw className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-primary">Pro Tip</h4>
                                <p className="text-xs text-muted-foreground mt-1">Enable "Live Sync" during class to see student attendance update automatically as they scan.</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

export default function FacultyAttendancePage() {
    return (
        <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <AttendanceMonitorContent />
        </Suspense>
    );
}
