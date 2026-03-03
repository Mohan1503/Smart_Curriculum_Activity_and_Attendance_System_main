"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Clock, QrCode, Users, ArrowRight, Zap, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function FacultyDashboard() {
    const [todayClasses, setTodayClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/faculty/today");
                setTodayClasses(res.data);
            } catch (err) {
                console.error("Error fetching faculty schedule", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper: Find current class index
    const getCurrentClassIndex = () => {
        const now = new Date();
        const currentTime = format(now, "HH:mm:ss");

        return todayClasses.findIndex(cls => {
            if (!cls.startTime || !cls.endTime) return false;
            return currentTime >= cls.startTime && currentTime <= cls.endTime;
        });
    };

    const currentClassIndex = getCurrentClassIndex();

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Faculty Portal<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Manage your academic schedule and student engagement.</p>
            </motion.div>

            <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Stats Card */}
                <Card className="glass-card bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10 hover:border-blue-500/20 transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-blue-600 transition-colors">Today's Load</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{loading ? "--" : todayClasses.length}</div>
                        <p className="text-xs font-medium text-blue-600 mt-1">Sessions Scheduled</p>
                    </CardContent>
                </Card>

                {/* Active Class Card (Dynamic) */}
                <Card className={cn(
                    "glass-card transition-all group",
                    currentClassIndex !== -1
                        ? "bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10 hover:border-emerald-500/20"
                        : "bg-gradient-to-br from-gray-500/5 to-transparent border-gray-500/10"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-sm font-semibold text-muted-foreground transition-colors", currentClassIndex !== -1 && "group-hover:text-emerald-600")}>
                            Current Status
                        </CardTitle>
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", currentClassIndex !== -1 ? "bg-emerald-100" : "bg-gray-100")}>
                            <Zap className={cn("h-5 w-5", currentClassIndex !== -1 ? "text-emerald-600 fill-emerald-600" : "text-gray-500")} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground truncate">
                            {currentClassIndex !== -1 ? "Class in Progress" : "Free Period"}
                        </div>
                        <p className={cn("text-xs font-medium mt-1", currentClassIndex !== -1 ? "text-emerald-600" : "text-muted-foreground")}>
                            {currentClassIndex !== -1 ? todayClasses[currentClassIndex].subjectName : "No active session"}
                        </p>
                    </CardContent>
                </Card>

                {/* Main Action Card */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary to-orange-600 border-0 shadow-lg shadow-primary/20 text-white relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-[200%] w-1/3 bg-white/10 skew-x-12 translate-x-12 group-hover:translate-x-6 transition-transform duration-700" />
                    <CardContent className="h-full flex flex-col justify-between p-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2 opacity-80">
                                <QrCode className="h-5 w-5" />
                                <span className="text-sm font-bold uppercase tracking-wider">Quick Action</span>
                            </div>
                            <h3 className="font-bold text-2xl leading-none mb-1">Generate QR</h3>
                            <p className="text-white/80 text-sm font-medium">Create attendance code for students.</p>
                        </div>
                        <Link href="/faculty/generate" className="mt-4">
                            <Button size="sm" className="w-full bg-white text-primary hover:bg-white/90 font-bold shadow-lg border-0">
                                Start Session <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold tracking-tight">Today's Schedule</h2>
                    <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground">
                        View Calendar
                    </Button>
                </div>

                <Card className="shadow-sm border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading schedule...</div>
                        ) : todayClasses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Calendar className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">No classes today</h3>
                                <p className="text-muted-foreground">Enjoy your free time!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {todayClasses.map((cls, i) => {
                                    const isCurrent = i === currentClassIndex;
                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                "flex flex-col sm:flex-row sm:items-center p-5 hover:bg-muted/40 transition-colors gap-4 group relative",
                                                isCurrent && "bg-primary/5 hover:bg-primary/10"
                                            )}
                                        >
                                            {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}

                                            <div className="flex items-center gap-4 sm:w-48 shrink-0">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-xl flex items-center justify-center font-bold text-sm border shadow-sm transition-transform group-hover:scale-105",
                                                    isCurrent ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"
                                                )}>
                                                    {cls.startTime.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-mono text-sm font-semibold text-foreground">
                                                        {cls.startTime.substring(0, 5)} - {cls.endTime.substring(0, 5)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{cls.subjectCode}</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className={cn("text-base font-bold truncate", isCurrent && "text-primary")}>
                                                        {cls.subjectName}
                                                    </p>
                                                    {isCurrent && (
                                                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse">
                                                            Live
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {cls.dept} • Sem {cls.semester} • Sec {cls.section}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="sm:ml-auto flex items-center gap-3 mt-2 sm:mt-0">
                                                <Link
                                                    href={`/faculty/attendance?subject=${cls.subjectCode}&date=${new Date().toISOString().split('T')[0]}&start=${cls.startTime}:00`}
                                                    className="w-full sm:w-auto"
                                                >
                                                    <Button
                                                        variant={isCurrent ? "default" : "outline"}
                                                        size="sm"
                                                        className={cn(
                                                            "w-full font-semibold transition-all",
                                                            isCurrent ? "shadow-md shadow-primary/20" : "border-primary/20 hover:bg-primary/5 hover:text-primary"
                                                        )}
                                                    >
                                                        {isCurrent ? "Monitor Live" : "View Details"}
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
