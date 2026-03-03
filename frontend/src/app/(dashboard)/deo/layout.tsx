"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    Calendar,
    Users,
    BookOpen,
    FileText,
    UserCog,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/deo" },
    { icon: Calendar, label: "Timetable Mgmt", href: "/deo/timetable" },
    { icon: BookOpen, label: "Curriculum Mgmt", href: "/deo/curriculum" },
    { icon: UserCog, label: "User Management", href: "/deo/users" },
    { icon: FileText, label: "Resources", href: "/deo/resources" },
];

export default function DEOLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border/60 transition-transform duration-300 lg:translate-x-0 lg:static shadow-sm",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center px-6 border-b border-border/40">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary to-orange-400 rounded-lg shadow-sm mr-3" />
                    <span className="font-bold text-lg text-foreground tracking-tight">SmartTrack</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-col h-[calc(100vh-64px)] justify-between py-6 px-4">
                    <nav className="space-y-1.5">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    pathname === item.href
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 translate-x-1"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:translate-x-1"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div>
                        <div className="mb-4 px-4 py-3 bg-muted/30 rounded-xl border border-border/50 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {user?.sub?.charAt(0) || "D"}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate text-foreground">{user?.sub || "DEO"}</p>
                                <p className="text-xs text-muted-foreground font-medium">Administrator</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={logout}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 flex items-center border-b border-border bg-card px-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <span className="ml-4 font-bold text-foreground">SmartTrack</span>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}