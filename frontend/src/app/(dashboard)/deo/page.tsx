"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Users, ArrowRight, Zap, GraduationCap, Layers, ArrowUpRight, CalendarCheck, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DEODashboard() {
    const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0 });
    const [attendance, setAttendance] = useState<{ totalStudents: number; presentToday: number; absentToday: number; attendanceRate: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, attRes] = await Promise.all([
                    api.get("/deo/stats"),
                    api.get("/deo/attendance-stats").catch(() => null),
                ]);
                setStats(statsRes.data);
                if (attRes) setAttendance(attRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Animation Variants (Same as Faculty/Student)
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
                    Dashboard<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Manage department operations and resources.</p>
            </motion.div>

            <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                {/* Stats Card: Students */}
                <Card className="glass-card bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10 group hover:border-indigo-500/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-indigo-600 transition-colors">Total Students</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-100/50 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{loading ? "--" : stats.totalStudents}</div>
                        <p className="text-xs font-medium text-indigo-600 mt-1">Enrolled in department</p>
                    </CardContent>
                </Card>

                {/* Stats Card: Faculty */}
                <Card className="glass-card bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/10 group hover:border-purple-500/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-purple-600 transition-colors">Faculty Members</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100/50 flex items-center justify-center">
                            <Users className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{loading ? "--" : stats.totalFaculty}</div>
                        <p className="text-xs font-medium text-purple-600 mt-1">Active teaching staff</p>
                    </CardContent>
                </Card>

                {/* Stats Card: Timetables */}
                <Card className="glass-card bg-gradient-to-br from-pink-500/5 to-transparent border-pink-500/10 group hover:border-pink-500/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-pink-600 transition-colors">Timetables</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-pink-100/50 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-pink-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">Active</div>
                        <p className="text-xs font-medium text-pink-600 mt-1">Synced with Faculty</p>
                    </CardContent>
                </Card>

                {/* Stats Card: Today's Attendance */}
                <Card className="glass-card bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10 group hover:border-emerald-500/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-emerald-600 transition-colors">Dept Attendance</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-100/50 flex items-center justify-center">
                            <CalendarCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold", attendance ? (attendance.attendanceRate >= 75 ? "text-emerald-600" : attendance.attendanceRate >= 50 ? "text-amber-600" : "text-red-600") : "text-foreground")}>
                            {loading ? "--" : attendance ? `${attendance.attendanceRate.toFixed(1)}%` : "N/A"}
                        </div>
                        <p className="text-xs font-medium text-emerald-600 mt-1">
                            {attendance ? `${attendance.presentToday}/${attendance.totalStudents} present today` : "No data"}
                        </p>
                    </CardContent>
                </Card>

                {/* Main Action Card (Styled like Faculty Generate QR) */}
                <Card className="col-span-1 border-0 shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-orange-600 text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                    <Link href="/deo/timetable" className="absolute inset-0 z-20" />
                    <div className="absolute -right-6 -top-6 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
                    <CardContent className="h-full flex flex-col justify-between p-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2 opacity-90">
                                <Zap className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Priority</span>
                            </div>
                            <h3 className="font-bold text-xl leading-snug mb-1">Post Timetable</h3>
                            <p className="text-white/80 text-xs font-medium">Update weekly schedules.</p>
                        </div>
                        <div className="mt-4 flex items-center text-sm font-bold bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-md group-hover:bg-white group-hover:text-primary transition-all">
                            Manage Now <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold tracking-tight">Department Management</h2>
                    <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground">
                        View All Operations
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/deo/students" className="group">
                        <Card className="h-full border-border/60 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6 flex flex-col gap-4">
                                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground group-hover:text-indigo-600 transition-colors">Assign Sections</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Organize students into batches and assign faculty mentors.</p>
                                </div>
                                <div className="mt-auto pt-2 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    Open Manager <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/deo/curriculum" className="group">
                        <Card className="h-full border-border/60 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6 flex flex-col gap-4">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground group-hover:text-amber-600 transition-colors">Curriculum</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Manage subjects, syllabus, and academic requirements.</p>
                                </div>
                                <div className="mt-auto pt-2 flex items-center text-sm font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    View Syllabus <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/deo/timetable" className="group">
                        <Card className="h-full border-border/60 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6 flex flex-col gap-4">
                                <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground group-hover:text-pink-600 transition-colors">Update Schedule</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Modify period slots and faculty allocations.</p>
                                </div>
                                <div className="mt-auto pt-2 flex items-center text-sm font-medium text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    Edit Timetable <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}