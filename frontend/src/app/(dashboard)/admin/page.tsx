"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users, Upload, FileUp, GraduationCap, Shield, Building2,
    UserCheck, TrendingUp, ArrowRight, BarChart3, PieChart
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardStats {
    totalUsers: number;
    totalStudents: number;
    totalFaculty: number;
    totalDEOs: number;
    totalAdmins: number;
    totalDepartments: number;
    departments: string[];
    departmentBreakdown: { name: string; students: number; faculty: number }[];
    roleDistribution: { role: string; count: number }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/stats");
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };
    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    const roleColors: Record<string, string> = {
        STUDENT: "bg-emerald-500",
        FACULTY: "bg-blue-500",
        DEO: "bg-purple-500",
        ADMIN: "bg-rose-500",
    };
    const roleLabels: Record<string, string> = {
        STUDENT: "Students",
        FACULTY: "Faculty",
        DEO: "Dept Admins",
        ADMIN: "Admins",
    };

    const maxRoleCount = stats?.roleDistribution
        ? Math.max(...stats.roleDistribution.map(r => r.count), 1) : 1;
    const maxDeptCount = stats?.departmentBreakdown
        ? Math.max(...stats.departmentBreakdown.map(d => d.students + d.faculty), 1) : 1;

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-10">
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Admin Dashboard<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Institution overview and management at a glance.</p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10 group hover:border-blue-500/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Total Users</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100/50 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{loading ? "--" : stats?.totalUsers}</div>
                        <p className="text-xs font-medium text-blue-600 mt-1">Registered accounts</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10 group hover:border-emerald-500/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Students</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-100/50 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{loading ? "--" : stats?.totalStudents}</div>
                        <p className="text-xs font-medium text-emerald-600 mt-1">Enrolled students</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10 group hover:border-indigo-500/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Faculty</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-100/50 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{loading ? "--" : stats?.totalFaculty}</div>
                        <p className="text-xs font-medium text-indigo-600 mt-1">Teaching staff</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/10 group hover:border-purple-500/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Dept Admins</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100/50 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{loading ? "--" : stats?.totalDEOs}</div>
                        <p className="text-xs font-medium text-purple-600 mt-1">Department officers</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/10 group hover:border-orange-500/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Departments</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-100/50 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{loading ? "--" : stats?.totalDepartments}</div>
                        <p className="text-xs font-medium text-orange-600 mt-1">Active departments</p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Role Distribution Bar Chart */}
                <motion.div variants={item}>
                    <Card className="border-border/60 shadow-md h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                User Distribution by Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <div className="h-40 flex items-center justify-center text-muted-foreground">Loading...</div>
                            ) : (
                                stats?.roleDistribution?.map((r, i) => (
                                    <div key={r.role} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-foreground">{roleLabels[r.role] || r.role}</span>
                                            <span className="font-bold text-foreground">{r.count}</span>
                                        </div>
                                        <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                                            <motion.div
                                                className={cn("h-full rounded-full", roleColors[r.role] || "bg-gray-500")}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(r.count / maxRoleCount) * 100}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.15 }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Department Breakdown */}
                <motion.div variants={item}>
                    <Card className="border-border/60 shadow-md h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-orange-500" />
                                Department Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <div className="h-40 flex items-center justify-center text-muted-foreground">Loading...</div>
                            ) : stats?.departmentBreakdown?.length === 0 ? (
                                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                                    <Building2 className="h-8 w-8 mb-2 opacity-40" />
                                    <p className="font-medium">No departments yet</p>
                                    <Link href="/admin/departments" className="text-sm text-primary mt-1 hover:underline">Create one</Link>
                                </div>
                            ) : (
                                stats?.departmentBreakdown?.map((d, i) => {
                                    const total = d.students + d.faculty;
                                    return (
                                        <div key={d.name} className="rounded-xl border border-border/50 p-4 hover:bg-muted/20 transition-colors">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-foreground">{d.name}</span>
                                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-mono">{total} total</span>
                                            </div>
                                            <div className="flex gap-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                                    <span className="text-muted-foreground">Students:</span>
                                                    <span className="font-bold">{d.students}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                                    <span className="text-muted-foreground">Faculty:</span>
                                                    <span className="font-bold">{d.faculty}</span>
                                                </div>
                                            </div>
                                            <div className="mt-3 w-full bg-muted/50 rounded-full h-2 overflow-hidden flex">
                                                <motion.div
                                                    className="h-full bg-emerald-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: total > 0 ? `${(d.students / total) * 100}%` : '0%' }}
                                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                                />
                                                <motion.div
                                                    className="h-full bg-blue-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: total > 0 ? `${(d.faculty / total) * 100}%` : '0%' }}
                                                    transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={item}>
                <h2 className="text-xl font-bold tracking-tight mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link href="/admin/users" className="group">
                        <Card className="h-full border-border/60 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1">
                            <CardContent className="p-6 flex flex-col gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">User Management</h3>
                                    <p className="text-sm text-muted-foreground mt-1">CRUD operations, role filters, bulk upload</p>
                                </div>
                                <div className="mt-auto pt-2 flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Manage Users <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/admin/departments" className="group">
                        <Card className="h-full border-border/60 hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-1">
                            <CardContent className="p-6 flex flex-col gap-4">
                                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Departments</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Create departments, assign DEOs</p>
                                </div>
                                <div className="mt-auto pt-2 flex items-center text-sm font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Manage Depts <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/admin/curriculum" className="group">
                        <Card className="h-full border-border/60 hover:border-purple-500/50 transition-all hover:shadow-lg hover:-translate-y-1">
                            <CardContent className="p-6 flex flex-col gap-4">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                    <FileUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Curriculum</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Upload and view curriculum PDFs</p>
                                </div>
                                <div className="mt-auto pt-2 flex items-center text-sm font-medium text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Curriculum <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/admin/attendance" className="group">
                        <Card className="h-full border-border/60 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:-translate-y-1">
                            <CardContent className="p-6 flex flex-col gap-4">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Attendance</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Institution-wide attendance overview</p>
                                </div>
                                <div className="mt-auto pt-2 flex items-center text-sm font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Stats <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}
