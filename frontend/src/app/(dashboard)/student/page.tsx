"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, Clock, BookOpen, AlertCircle, QrCode, ArrowRight, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, parse, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
    const [todayClasses, setTodayClasses] = useState<any[]>([]);
    const [stats, setStats] = useState({
        attendancePercentage: 0,
        classesAttended: 0,
        totalClasses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch basic data
                const [todayRes, profileRes] = await Promise.all([
                    api.get("/student/today"),
                    api.get("/student/profile")
                ]);
                setTodayClasses(todayRes.data);

                // Try to fetch real stats if available
                try {
                    const sem = profileRes.data.semester;
                    const statsRes = await api.get(`/student/semester/${sem}/percentage`);
                    setStats({
                        attendancePercentage: statsRes.data.percentage,
                        classesAttended: statsRes.data.presentClasses,
                        totalClasses: statsRes.data.totalClasses
                    });
                } catch (e) {
                    // Fallback mock if stats fail or endpoint 404
                    setStats({
                        attendancePercentage: 85.5,
                        classesAttended: 34,
                        totalClasses: 40
                    });
                }

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    // Helper to find current class
    const getCurrentClassIndex = () => {
        const now = new Date();
        const currentTime = format(now, "HH:mm:ss");

        return todayClasses.findIndex(cls => {
            if (!cls.startTime || !cls.endTime) return false;
            return currentTime >= cls.startTime && currentTime <= cls.endTime;
        });
    };

    const currentClassIndex = getCurrentClassIndex();
    const nextClass = todayClasses.find(cls => {
        const now = new Date();
        const currentTime = format(now, "HH:mm:ss");
        return cls.startTime > currentTime;
    });

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Dashboard<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Welcome back, get ready for a productive day.</p>
            </motion.div>

            <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Stats Cards with Glassmorphism */}
                <Card className="glass-card border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-transparent hover:border-emerald-500/20 transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-emerald-600 transition-colors">Overall Attendance</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-100/50 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats.attendancePercentage.toFixed(1)}%</div>
                        <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {stats.classesAttended} / {stats.totalClasses} sessions
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-blue-500/10 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-blue-500/20 transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-blue-600 transition-colors">Today's Classes</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100/50 flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{todayClasses.length}</div>
                        <p className="text-xs font-medium text-blue-600 mt-1">Scheduled sessions</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-orange-500/10 bg-gradient-to-br from-orange-500/5 to-transparent hover:border-orange-500/20 transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-orange-600 transition-colors">Up Next</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-100/50 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold truncate text-foreground">
                            {nextClass ? nextClass.subjectName : "All Done"}
                        </div>
                        <p className="text-xs font-medium text-orange-600 mt-1">
                            {nextClass ? nextClass.startTime.substring(0, 5) : "Relax & Recharge"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-orange-600 text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                    <Link href="/student/scan" className="absolute inset-0 z-20" />
                    <CardContent className="pt-6 h-full flex flex-col justify-center relative z-10">
                        <div className="absolute -top-10 -right-10 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                            <QrCode className="h-40 w-40" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <QrCode className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Scan Attendance</h3>
                                <p className="text-white/80 text-sm">Mark your presence instantly</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <motion.div variants={item} className="col-span-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold tracking-tight">Today's Schedule</h2>
                        <Link href="/student/timetable" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                            Full Timetable <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <Card className="border-border/60 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {todayClasses.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20">
                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <CalendarDays className="h-8 w-8 text-muted-foreground/60" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">No classes scheduled for today.</p>
                                    </div>
                                ) : (
                                    todayClasses.map((cls, i) => {
                                        const isCurrent = i === currentClassIndex;
                                        const isPast = nextClass && cls.endTime < nextClass.startTime && !isCurrent; // Rough logic

                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "flex items-center p-5 transition-all hover:bg-muted/40 group relative lg:gap-6 gap-3",
                                                    isCurrent && "bg-primary/5 hover:bg-primary/10"
                                                )}
                                            >
                                                {isCurrent && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                                )}

                                                <div className="flex flex-col items-center min-w-[4rem]">
                                                    <span className="text-sm font-bold text-foreground">{cls.startTime.substring(0, 5)}</span>
                                                    <div className="h-8 w-px bg-border my-1 group-last:hidden" />
                                                    <span className="text-xs text-muted-foreground">{cls.endTime.substring(0, 5)}</span>
                                                </div>

                                                <div className={cn(
                                                    "h-12 w-12 rounded-xl flex items-center justify-center border transition-all shadow-sm",
                                                    isCurrent ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border group-hover:border-primary/30 group-hover:text-primary"
                                                )}>
                                                    <BookOpen className="h-5 w-5" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className={cn("text-base font-bold truncate", isCurrent ? "text-primary" : "text-foreground")}>
                                                            {cls.subjectName}
                                                        </p>
                                                        {isCurrent && (
                                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary animate-pulse">
                                                                Live
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1 font-medium bg-muted/50 px-2 py-0.5 rounded text-xs">
                                                            {cls.subjectCode}
                                                        </span>
                                                        {cls.room && (
                                                            <span className="flex items-center gap-1">
                                                                Room {cls.room}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                                                    View Details
                                                </Button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="col-span-3 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight mb-4">Notifications</h2>
                        <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/50">
                                    <div className="p-4 flex gap-3 hover:bg-muted/40 transition-colors">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Mid-Sem Exams Schedule</p>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                Exam timetable has been released. Check the academic calendar for your slots.
                                            </p>
                                            <span className="text-[10px] text-muted-foreground/60 mt-2 block">2 hours ago</span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex gap-3 hover:bg-muted/40 transition-colors">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">New Assignment: DBMS</p>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                Submission deadline is Friday, 12th Aug.
                                            </p>
                                            <span className="text-[10px] text-muted-foreground/60 mt-2 block">Yesterday</span>
                                        </div>
                                    </div>
                                    <Link href="/notifications" className="block text-center p-3 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-muted/20 transition-colors">
                                        View All
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-0 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                            <Zap className="h-32 w-32 rotate-12" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <h3 className="text-lg font-bold mb-2">Study Streak 🔥</h3>
                            <p className="text-white/80 text-sm mb-4">You've attended classes for 12 days in a row! Keep it up.</p>
                            <div className="w-full bg-black/20 rounded-full h-1.5 mb-2 overflow-hidden">
                                <div className="bg-white h-full rounded-full w-[80%] shadow-lg" />
                            </div>
                            <p className="text-xs text-right opacity-80">80% to next badge</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
