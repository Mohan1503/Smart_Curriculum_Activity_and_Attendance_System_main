"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { TimetableGrid } from "@/components/TimetableGrid";
import { AllTimetablesView } from "@/components/AllTimetablesView";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, List } from "lucide-react";

export default function FacultyTimeTablePage() {
    const [timetable, setTimetable] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"my" | "all">("my");

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const res = await api.get("/faculty/timetable");
                setTimetable(res.data);
            } catch (err) {
                console.error("Failed to fetch timetable", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Teaching Schedule</h1>
                    <p className="text-emerald-100 max-w-xl text-lg">
                        Your weekly class assignments, section details, and time slots.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-3">
                <Button variant={activeTab === "my" ? "default" : "outline"} onClick={() => setActiveTab("my")} className="font-semibold">
                    <Calendar className="h-4 w-4 mr-2" /> My Schedule
                </Button>
                <Button variant={activeTab === "all" ? "default" : "outline"} onClick={() => setActiveTab("all")} className="font-semibold">
                    <List className="h-4 w-4 mr-2" /> All Timetables
                </Button>
            </div>

            {activeTab === "my" && (
                loading ? (
                    <div className="flex h-[30vh] items-center justify-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        Loading schedule...
                    </div>
                ) : timetable.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
                        No classes assigned yet.
                    </div>
                ) : (
                    <TimetableGrid data={timetable} userRole="FACULTY" />
                )
            )}

            {activeTab === "all" && (
                <AllTimetablesView userRole="FACULTY" />
            )}
        </div>
    );
}
