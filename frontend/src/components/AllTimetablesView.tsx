"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TimetableGrid } from "@/components/TimetableGrid";
import { Loader2, Calendar, Search, ArrowLeft, Building2, BookOpen, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionInfo {
    dept: string;
    section: string;
    semester: number;
    year: number;
}

interface AllTimetablesViewProps {
    userRole: "ADMIN" | "FACULTY" | "STUDENT" | "DEO";
}

export function AllTimetablesView({ userRole }: AllTimetablesViewProps) {
    const [sections, setSections] = useState<SectionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedSection, setSelectedSection] = useState<SectionInfo | null>(null);
    const [timetableData, setTimetableData] = useState<any[]>([]);
    const [loadingTimetable, setLoadingTimetable] = useState(false);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await api.get("/timetable/all-sections");
                setSections(res.data);
            } catch (err) {
                console.error("Failed to fetch timetable sections", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSections();
    }, []);

    const viewTimetable = async (sec: SectionInfo) => {
        setSelectedSection(sec);
        setLoadingTimetable(true);
        try {
            const res = await api.get(`/timetable/view?dept=${sec.dept}&section=${sec.section}&semester=${sec.semester}`);
            setTimetableData(res.data);
        } catch (err) {
            console.error("Failed to fetch timetable", err);
            setTimetableData([]);
        } finally {
            setLoadingTimetable(false);
        }
    };

    const goBack = () => {
        setSelectedSection(null);
        setTimetableData([]);
    };

    const filteredSections = sections.filter(s =>
        `${s.dept} ${s.section} ${s.semester} ${s.year}`.toLowerCase().includes(search.toLowerCase())
    );

    // Group sections by department
    const grouped = filteredSections.reduce<Record<string, SectionInfo[]>>((acc, s) => {
        if (!acc[s.dept]) acc[s.dept] = [];
        acc[s.dept].push(s);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex h-[40vh] items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading timetables...
            </div>
        );
    }

    // Detail view — showing a specific timetable
    if (selectedSection) {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={goBack} className="font-medium">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            {selectedSection.dept} — Section {selectedSection.section}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Year {selectedSection.year} • Semester {selectedSection.semester}
                        </p>
                    </div>
                </div>

                {loadingTimetable ? (
                    <div className="flex h-[30vh] items-center justify-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        Loading schedule...
                    </div>
                ) : timetableData.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                        No timetable data found.
                    </div>
                ) : (
                    <TimetableGrid data={timetableData} userRole={userRole} />
                )}
            </motion.div>
        );
    }

    // List view — showing all available timetables
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by department, section..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 bg-muted/50"
                />
            </div>

            {sections.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium text-lg">No timetables published yet</p>
                    <p className="text-sm mt-1">Timetables will appear here once a DEO publishes them.</p>
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No results match your search.</div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([dept, secs]) => (
                        <div key={dept}>
                            <div className="flex items-center gap-2 mb-4">
                                <Building2 className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-bold text-foreground">{dept}</h3>
                                <Badge variant="secondary" className="text-xs">{secs.length} timetable{secs.length > 1 ? "s" : ""}</Badge>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {secs
                                    .sort((a, b) => a.section.localeCompare(b.section) || a.semester - b.semester)
                                    .map((sec, i) => (
                                        <Card
                                            key={`${sec.dept}-${sec.section}-${sec.semester}`}
                                            className="border-border/60 hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer group"
                                            onClick={() => viewTimetable(sec)}
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                        {sec.section}
                                                    </div>
                                                    <Badge variant="outline" className="text-xs font-mono">
                                                        Year {sec.year}
                                                    </Badge>
                                                </div>
                                                <h4 className="font-bold text-foreground mb-1">Section {sec.section}</h4>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="h-3.5 w-3.5" />
                                                        Sem {sec.semester}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <GraduationCap className="h-3.5 w-3.5" />
                                                        Year {sec.year}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
