"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, TrendingUp, Calendar as CalendarIcon, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

// Types matching Backend DTOs
interface SemesterAttendanceDTO {
    semester: number;
    totalClasses: number;
    presentClasses: number;
    percentage: number;
}

interface MonthlyAttendanceDTO {
    date: string; // ISO date string from JSON
    subjectCode: string;
    present: boolean;
}

export default function StudentAttendancePage() {
    // State
    const [stats, setStats] = useState<SemesterAttendanceDTO | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyAttendanceDTO[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [semester, setSemester] = useState<number>(1); // Default, will fetch from profile
    const [error, setError] = useState("");

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Fetch Initial Data (Profile -> Semester -> Stats)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const profileRes = await api.get("/student/profile");
                const studentSem = profileRes.data.semester;
                setSemester(studentSem);

                const statsRes = await api.get(`/student/semester/${studentSem}/percentage`);
                setStats(statsRes.data);
                console.log(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch initial data", err);
                setError("Could not load attendance data.");
            }
        };
        fetchInitialData();
    }, []);

    // Fetch Monthly Data when month/year changes
    useEffect(() => {
        const fetchMonthlyData = async () => {
            if (!semester) return;
            setLoading(true);
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1; // Backend expects 1-12
                const res = await api.get(`/student/month-attendance?year=${year}&month=${month}`);
                setMonthlyData(res.data);
            } catch (err) {
                console.error("Failed to fetch monthly data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMonthlyData();
    }, [currentDate, semester]);

    // Calendar Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart); // 0 = Sunday

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    // Determine status for a specific day
    const getDayStatus = (day: Date) => {
        // Find all records for this day
        const records = monthlyData.filter(d => isSameDay(new Date(d.date), day));

        if (records.length === 0) return "none";

        // If present for all/most? simplified for now: if any absent, show mixed or red?
        // Let's simplified: 
        // If any record exists:
        // All present -> green
        // Any absent -> red/orange (partial)

        const allPresent = records.every(r => r.present);
        if (allPresent) return "present";
        const allAbsent = records.every(r => !r.present);
        if (allAbsent) return "absent";

        return "partial";
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Attendance Overview
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Track your academic presence and performance.
                    </p>
                </div>
                <div className="glass-card px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-600 font-medium text-sm flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    Live Updates
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-3"
            >
                {/* Stats Cards */}
                <motion.div variants={item}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-primary/20 group">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Overall Attendance</p>
                                <h3 className="text-4xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                    {stats ? `${stats.percentage.toFixed(1)}%` : "--"}
                                </h3>
                            </div>
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary/20 to-orange-100 flex items-center justify-center">
                                <PieChart className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                        {stats && (
                            <div className="h-1.5 w-full bg-secondary overflow-hidden rounded-b-xl">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.percentage}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        )}
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Classes Attended</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold">{stats?.presentClasses ?? "--"}</h3>
                                    <span className="text-sm text-muted-foreground">/ {stats?.totalClasses ?? "--"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Classes Missed</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold">
                                        {stats ? (stats.totalClasses - stats.presentClasses) : "--"}
                                    </h3>
                                    <span className="text-sm text-muted-foreground">sessions</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Calendar Section */}
                <motion.div variants={item} className="md:col-span-3">
                    <Card className="border-border shadow-md overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50 bg-muted/20">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg font-semibold">Monthly Breakdown</CardTitle>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Present</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Absent</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Partial</div>
                                </div>
                                <div className="flex items-center gap-1 bg-background rounded-md border shadow-sm p-1">
                                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="min-w-[100px] text-center font-medium text-sm">
                                        {format(currentDate, "MMMM yyyy")}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Days Header */}
                            <div className="grid grid-cols-7 mb-2 text-center">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {/* Empty slots for start of month */}
                                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-24 md:h-32 bg-muted/5 rounded-lg border border-transparent" />
                                ))}

                                {daysInMonth.map((day, i) => {
                                    const status = getDayStatus(day);
                                    const isToday = isSameDay(day, new Date());
                                    const dayRecords = monthlyData.filter(d => isSameDay(new Date(d.date), day));

                                    return (
                                        <motion.div
                                            key={day.toISOString()}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.01 }}
                                            className={cn(
                                                "relative h-24 md:h-32 rounded-lg border p-2 transition-all duration-200 hover:shadow-md flex flex-col justify-between group overflow-hidden",
                                                isToday ? "ring-2 ring-primary ring-offset-2 border-primary/50" : "border-border/40 bg-card hover:border-border",
                                                status === 'present' && "bg-green-500/5 hover:bg-green-500/10 border-green-200/50",
                                                status === 'absent' && "bg-red-500/5 hover:bg-red-500/10 border-red-200/50",
                                                status === 'partial' && "bg-yellow-500/5 hover:bg-yellow-500/10 border-yellow-200/50"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                                isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground group-hover:bg-background/80"
                                            )}>
                                                {format(day, "d")}
                                            </span>

                                            {/* Status Indicators */}
                                            <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[calc(100%-2rem)] text-[10px] sm:text-xs">
                                                {status !== 'none' && dayRecords.map((rec, idx) => (
                                                    <div key={idx} className={cn(
                                                        "flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm truncate",
                                                        rec.present ? "bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                            : "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", rec.present ? "bg-green-500" : "bg-red-500")} />
                                                        <span className="truncate">{rec.subjectCode}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Overall Status Bar for Day (if mixed) */}
                                            <div className={cn(
                                                "absolute bottom-0 left-0 h-1 w-full",
                                                status === 'present' && "bg-green-500",
                                                status === 'absent' && "bg-red-500",
                                                status === 'partial' && "bg-yellow-500"
                                            )} />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
