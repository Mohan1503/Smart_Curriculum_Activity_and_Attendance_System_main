"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Users, Building2, Loader2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DeptAttendance {
    department: string;
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    rate: number;
}

interface AttendanceOverview {
    date: string;
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    overallRate: number;
    departmentBreakdown: DeptAttendance[];
}

export default function AdminAttendancePage() {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [data, setData] = useState<AttendanceOverview | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async (d: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/attendance-overview?date=${d}`);
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch attendance overview", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(date); }, []);

    const handleDateChange = (d: string) => {
        setDate(d);
        fetchData(d);
    };

    const rateColor = (rate: number) => {
        if (rate >= 75) return "text-emerald-600";
        if (rate >= 50) return "text-amber-600";
        return "text-red-600";
    };
    const rateBg = (rate: number) => {
        if (rate >= 75) return "bg-emerald-500";
        if (rate >= 50) return "bg-amber-500";
        return "bg-red-500";
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Overview</h1>
                    <p className="text-muted-foreground mt-1">Institution-wide attendance analytics by department.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={date}
                        onChange={e => handleDateChange(e.target.value)}
                        className="rounded-lg border border-border px-3 py-2 text-sm bg-background"
                    />
                </div>
            </div>

            {loading ? (
                <div className="p-16 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading attendance data...</div>
            ) : !data ? (
                <Card className="border-border/60"><CardContent className="p-16 text-center text-muted-foreground">No attendance data available for this date.</CardContent></Card>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
                        <Card className="border-border/60 shadow-sm">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center"><Users className="h-6 w-6 text-blue-600" /></div>
                                <div><p className="text-2xl font-bold">{data.totalRecords}</p><p className="text-xs text-muted-foreground font-medium">Total Records</p></div>
                            </CardContent>
                        </Card>
                        <Card className="border-border/60 shadow-sm">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center"><CalendarCheck className="h-6 w-6 text-emerald-600" /></div>
                                <div><p className="text-2xl font-bold text-emerald-600">{data.presentCount}</p><p className="text-xs text-muted-foreground font-medium">Present</p></div>
                            </CardContent>
                        </Card>
                        <Card className="border-border/60 shadow-sm">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center"><TrendingDown className="h-6 w-6 text-red-600" /></div>
                                <div><p className="text-2xl font-bold text-red-600">{data.absentCount}</p><p className="text-xs text-muted-foreground font-medium">Absent</p></div>
                            </CardContent>
                        </Card>
                        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-primary/5 to-orange-500/5">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-6 w-6 text-primary" /></div>
                                <div><p className={cn("text-2xl font-bold", rateColor(data.overallRate))}>{data.overallRate.toFixed(1)}%</p><p className="text-xs text-muted-foreground font-medium">Overall Rate</p></div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Department Breakdown */}
                    <Card className="border-border/60 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Department Breakdown</CardTitle>
                            <CardDescription>Attendance rates by department for {date}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.departmentBreakdown.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No department data for this date.</p>
                            ) : (
                                <div className="space-y-4">
                                    {data.departmentBreakdown.map((dept, i) => (
                                        <motion.div key={dept.department} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/40 hover:border-border/80 transition-colors">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-sm text-foreground">{dept.department}</span>
                                                    <span className={cn("text-sm font-bold", rateColor(dept.rate))}>{dept.rate.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${dept.rate}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                                        className={cn("h-full rounded-full", rateBg(dept.rate))}
                                                    />
                                                </div>
                                                <div className="flex gap-4 mt-1.5 text-[10px] font-medium text-muted-foreground">
                                                    <span>Total: {dept.totalRecords}</span>
                                                    <span className="text-emerald-600">Present: {dept.presentCount}</span>
                                                    <span className="text-red-500">Absent: {dept.absentCount}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </motion.div>
    );
}
