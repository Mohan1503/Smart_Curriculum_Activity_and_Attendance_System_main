"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Slot {
    id: number;
    day: string;
    startTime: string;
    endTime: string;
    subjectName: string;
    subjectCode: string;
    facultyEmail: string;
    dept: string;
    section: string;
    break: boolean;
}

interface TimetableGridProps {
    data: Slot[];
    userRole?: "STUDENT" | "FACULTY" | "ADMIN" | "DEO";
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function TimetableGrid({ data, userRole = "STUDENT" }: TimetableGridProps) {
    // 1. Extract unique start times to define columns (Periods)
    // We assume the schedule is consistent across days for column headers
    // or we just render day-by-day rows.
    // A true grid needs common columns. Let's try to derive them.

    // Sort data first
    const sortedData = [...data].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Get all unique start times to use as column headers (if we want a strict grid)
    // However, breaks might differ?? Usually breaks are standard.
    // Let's stick to a robust Row-based layout (Flexbox/Grid) per day first, 
    // but styled to LOOK like a table.

    const groupedByDay = DAYS.map(day => ({
        day,
        slots: sortedData.filter(s => s.day === day)
    }));

    // Determine standard columns from the first day that has data?
    // Or just iterate.

    return (
        <div className="space-y-6">
            {/* Header / Legend */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground p-4 bg-muted/20 rounded-xl border border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/40 ring-2 ring-primary/20" />
                    <span className="text-foreground">Theory Class</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40 ring-2 ring-emerald-500/20" />
                    <span className="text-foreground">Lab / Practical</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                    <span>Break / Lunch</span>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/60 bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground uppercase text-xs tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-5 w-32 border-b border-border/60">Day</th>
                            {/* We can't easily predict dynamic columns if days differ, 
                    so we will render the timeline horizontally in the body */}
                            <th className="px-6 py-5 border-b border-border/60">Schedule</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                        {groupedByDay.map((group) => {
                            if (group.slots.length === 0) return null;

                            return (
                                <tr key={group.day} className="group hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-8 font-semibold text-foreground/80 align-top bg-muted/5 group-hover:bg-muted/20 transition-colors border-r border-border/40">
                                        {group.day.substring(0, 3)}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                            {group.slots.map((slot, index) => {
                                                const isBreak = slot.break;
                                                const isLab = slot.subjectName?.toLowerCase().includes("lab");

                                                return (
                                                    <div
                                                        key={slot.id}
                                                        className={cn(
                                                            "flex-shrink-0 flex flex-col justify-between p-3.5 rounded-xl border min-h-[110px] w-44 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                                                            isBreak
                                                                ? "bg-muted/30 border-transparent text-muted-foreground items-center justify-center w-28 min-h-[110px] hover:shadow-none hover:-translate-y-0"
                                                                : "bg-white",
                                                            isLab && !isBreak
                                                                ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:shadow-emerald-500/10"
                                                                : "",
                                                            !isLab && !isBreak
                                                                ? "border-orange-100 bg-orange-50/30 hover:border-primary/30 hover:shadow-primary/10"
                                                                : ""
                                                        )}
                                                    >
                                                        {isBreak ? (
                                                            <div className="text-center">
                                                                <span className="text-[10px] font-mono mb-1.5 block opacity-60">
                                                                    {slot.startTime.substring(0, 5)}
                                                                </span>
                                                                <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/70">
                                                                    {slot.subjectName || "Break"}
                                                                </span>
                                                                <span className="text-[10px] font-mono mt-1.5 block opacity-60">
                                                                    {slot.endTime.substring(0, 5)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex justify-between items-start mb-2.5">
                                                                    <span className="text-[11px] font-mono text-muted-foreground font-medium bg-white/50 px-1.5 py-0.5 rounded-md">
                                                                        {slot.startTime.substring(0, 5)}
                                                                    </span>
                                                                    <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-bold shadow-none", isLab ? "border-emerald-200 bg-emerald-100/50 text-emerald-700" : "border-orange-200 bg-orange-100/50 text-orange-700")}>
                                                                        {slot.subjectCode || "LEC"}
                                                                    </Badge>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h4 className="font-bold text-sm line-clamp-2 leading-snug text-foreground/90" title={slot.subjectName}>
                                                                        {slot.subjectName}
                                                                    </h4>
                                                                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                                                        <span className={cn("w-1.5 h-1.5 rounded-full", isLab ? "bg-emerald-400" : "bg-orange-400")} />
                                                                        {userRole === "STUDENT" ? slot.facultyEmail : `${slot.dept}-${slot.section}`}
                                                                    </p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
