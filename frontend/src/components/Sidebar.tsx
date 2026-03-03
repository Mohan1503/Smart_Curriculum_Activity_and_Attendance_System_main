"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    Calendar,
    BookOpen,
    FileText,
    Bell,
    Settings,
    LogOut,
    Shield,
    Layers,
    Upload,
    Bot
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const role = user?.role;

    const routes = [
        // Student Routes
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/student",
            color: "text-emerald-500",
            roles: ["ROLE_STUDENT", "ROLE_USER"],
        },
        {
            label: "Resources",
            icon: FileText,
            href: "/student/resources",
            color: "text-emerald-500",
            roles: ["ROLE_STUDENT", "ROLE_USER"],
        },
        {
            label: "AI Assistant",
            icon: Bot,
            href: "/student/ai-assistant",
            color: "text-violet-500",
            roles: ["ROLE_STUDENT", "ROLE_USER"],
        },
        {
            label: "Curriculum",
            icon: Layers,
            href: "/student/curriculum",
            color: "text-emerald-500",
            roles: ["ROLE_STUDENT", "ROLE_USER"],
        },
        {
            label: "My Timetable",
            icon: Calendar,
            href: "/student/timetable",
            color: "text-emerald-500",
            roles: ["ROLE_STUDENT", "ROLE_USER"],
        },

        // Faculty Routes
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/faculty",
            color: "text-blue-500",
            roles: ["ROLE_FACULTY"],
        },
        {
            label: "Attendance",
            icon: Users,
            href: "/faculty/attendance", // Monitor page
            color: "text-blue-500",
            roles: ["ROLE_FACULTY"],
        },
        {
            label: "Resources",
            icon: Upload,
            href: "/faculty/resources",
            color: "text-blue-500",
            roles: ["ROLE_FACULTY"],
        },
        {
            label: "AI Assistant",
            icon: Bot,
            href: "/faculty/ai-assistant",
            color: "text-violet-500",
            roles: ["ROLE_FACULTY"],
        },
        {
            label: "Curriculum",
            icon: BookOpen,
            href: "/faculty/curriculum",
            color: "text-blue-500",
            roles: ["ROLE_FACULTY"],
        },
        {
            label: "Timetable",
            icon: Calendar,
            href: "/faculty/timetable",
            color: "text-blue-500",
            roles: ["ROLE_FACULTY"],
        },

        // DEO Routes (Using ROLE_DEPT_ADMIN as standardized)
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/deo",
            color: "text-indigo-500",
            roles: ["ROLE_DEPT_ADMIN", "ROLE_DEO"],
        },
        {
            label: "Timetable Mgmt",
            icon: Calendar,
            href: "/deo/timetable",
            color: "text-indigo-500",
            roles: ["ROLE_DEPT_ADMIN", "ROLE_DEO"],
        },
        {
            label: "Curriculum Mgmt",
            icon: BookOpen,
            href: "/deo/curriculum",
            color: "text-indigo-500",
            roles: ["ROLE_DEPT_ADMIN", "ROLE_DEO"],
        },
        {
            label: "Student Mgmt",
            icon: Users,
            href: "/deo/students",
            color: "text-indigo-500",
            roles: ["ROLE_DEPT_ADMIN", "ROLE_DEO"],
        },

        // Admin Routes
        {
            label: "Dashboard",
            icon: Shield,
            href: "/admin",
            color: "text-rose-500",
            roles: ["ROLE_ADMIN"],
        },
        {
            label: "User Management",
            icon: Users,
            href: "/admin/users",
            color: "text-rose-500",
            roles: ["ROLE_ADMIN"],
        },
    ];

    // Filter routes based on role
    const filteredRoutes = routes.filter(route => route.roles.includes(role || ""));

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-card border-r border-border">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <div className="relative h-8 w-8 mr-4 bg-primary/10 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Smart<span className="text-primary">Class</span>
                    </h1>
                </Link>
                <div className="space-y-1">
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition",
                                pathname === route.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                    {/* Common Notifications Link */}
                    <Link
                        href="/notifications"
                        className={cn(
                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition",
                            pathname === "/notifications"
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <div className="flex items-center flex-1">
                            <Bell className="h-5 w-5 mr-3 text-amber-500" />
                            Notifications
                        </div>
                    </Link>
                </div>
            </div>
            <div className="px-3 py-2">
                <Button variant="ghost" onClick={logout} className="w-full justify-start pl-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
}


