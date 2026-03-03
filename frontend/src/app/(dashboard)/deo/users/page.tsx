"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2, Search, Users, GraduationCap, Briefcase, Mail, Phone,
    MapPin, BookOpen, Hash, ChevronDown, ChevronUp, RefreshCw,
    UserCircle, Building2, Award, Droplets
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Types ──────────────────────────────────────────────── */
interface FacultyMember {
    id: number;
    email: string;
    name: string;
    dept: string;
    position: string;
    qualification: string;
}

interface StudentMember {
    id: number;
    email: string;
    rollno: string;
    name: string;
    section: string;
    dept: string;
    year: number;
    semester: number;
    mobile: number | null;
    address: string;
    bloodGroup: string;
    mothername: string;
    fathername: string;
}

/* ── Animation Variants ─────────────────────────────────── */
const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DEOUsersPage() {
    const [activeTab, setActiveTab] = useState<"faculty" | "students">("faculty");

    // Faculty state
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);
    const [filteredFaculty, setFilteredFaculty] = useState<FacultyMember[]>([]);
    const [facultyLoading, setFacultyLoading] = useState(true);
    const [facultySearch, setFacultySearch] = useState("");

    // Students state
    const [students, setStudents] = useState<StudentMember[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<StudentMember[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(true);
    const [studentSearch, setStudentSearch] = useState("");

    // Expanded student card
    const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

    /* ── Fetch functions ────────────────────────────────── */
    const fetchFaculty = useCallback(async () => {
        setFacultyLoading(true);
        try {
            const res = await api.get("/deo/faculty-list");
            if (Array.isArray(res.data)) {
                setFaculty(res.data);
                setFilteredFaculty(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch faculty:", err);
        } finally {
            setFacultyLoading(false);
        }
    }, []);

    const fetchStudents = useCallback(async () => {
        setStudentsLoading(true);
        try {
            const res = await api.get("/deo/students-list");
            if (Array.isArray(res.data)) {
                setStudents(res.data);
                setFilteredStudents(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch students:", err);
        } finally {
            setStudentsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFaculty();
        fetchStudents();
    }, [fetchFaculty, fetchStudents]);

    /* ── Search handlers ────────────────────────────────── */
    const handleFacultySearch = (value: string) => {
        setFacultySearch(value);
        if (!value.trim()) {
            setFilteredFaculty(faculty);
        } else {
            const q = value.trim().toLowerCase();
            setFilteredFaculty(
                faculty.filter(f =>
                    f.name?.toLowerCase().includes(q) ||
                    f.email?.toLowerCase().includes(q) ||
                    f.position?.toLowerCase().includes(q) ||
                    f.qualification?.toLowerCase().includes(q)
                )
            );
        }
    };

    const handleStudentSearch = (value: string) => {
        setStudentSearch(value);
        if (!value.trim()) {
            setFilteredStudents(students);
        } else {
            const q = value.trim().toLowerCase();
            setFilteredStudents(
                students.filter(s =>
                    s.name?.toLowerCase().includes(q) ||
                    s.email?.toLowerCase().includes(q) ||
                    s.rollno?.toLowerCase().includes(q) ||
                    s.section?.toLowerCase().includes(q)
                )
            );
        }
    };

    /* ── Computed stats ──────────────────────────────────── */
    const uniqueSections = [...new Set(students.map(s => s.section).filter(Boolean))].sort();
    const uniqueYears = [...new Set(students.map(s => s.year).filter(Boolean))].sort();

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-7xl mx-auto space-y-8 pb-10"
        >
            {/* Header */}
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    User Management<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Overview of all faculty and students in your department.
                </p>
            </motion.div>

            {/* Summary Stats */}
            <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50 ring-1 ring-blue-200/40">
                    <CardContent className="pt-5 pb-4 text-center">
                        <Briefcase className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-3xl font-black text-blue-700 tabular-nums">{faculty.length}</p>
                        <p className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider mt-1">Faculty</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100/50 ring-1 ring-emerald-200/40">
                    <CardContent className="pt-5 pb-4 text-center">
                        <GraduationCap className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-3xl font-black text-emerald-700 tabular-nums">{students.length}</p>
                        <p className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider mt-1">Students</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-violet-100/50 ring-1 ring-violet-200/40">
                    <CardContent className="pt-5 pb-4 text-center">
                        <BookOpen className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                        <p className="text-3xl font-black text-violet-700 tabular-nums">{uniqueSections.length}</p>
                        <p className="text-xs font-semibold text-violet-600/70 uppercase tracking-wider mt-1">Sections</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100/50 ring-1 ring-amber-200/40">
                    <CardContent className="pt-5 pb-4 text-center">
                        <Hash className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                        <p className="text-3xl font-black text-amber-700 tabular-nums">{uniqueYears.length}</p>
                        <p className="text-xs font-semibold text-amber-600/70 uppercase tracking-wider mt-1">Year Groups</p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tab Switcher */}
            <motion.div variants={item} className="flex gap-2 bg-muted/40 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("faculty")}
                    className={cn(
                        "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                        activeTab === "faculty"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Briefcase className="h-4 w-4" />
                    Faculty
                    <span className="font-mono text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{faculty.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab("students")}
                    className={cn(
                        "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                        activeTab === "students"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <GraduationCap className="h-4 w-4" />
                    Students
                    <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{students.length}</span>
                </button>
            </motion.div>

            {/* ─── Faculty Tab ────────────────────────────── */}
            {activeTab === "faculty" && (
                <motion.div
                    key="faculty-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Search */}
                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, position…"
                                value={facultySearch}
                                onChange={e => handleFacultySearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="ghost" size="icon" onClick={fetchFaculty} title="Refresh">
                            <RefreshCw className={cn("h-4 w-4", facultyLoading && "animate-spin")} />
                        </Button>
                    </div>

                    {/* Faculty List */}
                    {facultyLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="animate-pulse h-20 bg-muted rounded-xl" />
                            ))}
                        </div>
                    ) : filteredFaculty.length === 0 ? (
                        <div className="text-center py-16 opacity-60">
                            <Users className="h-14 w-14 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-lg font-medium">No faculty found</p>
                            <p className="text-sm text-muted-foreground">Try a different search term.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredFaculty.map((f, idx) => (
                                <motion.div
                                    key={f.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                >
                                    <Card className="border-border/50 hover:border-blue-300/60 hover:shadow-md transition-all group">
                                        <CardContent className="py-4 px-5 flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 shadow-sm">
                                                <span className="text-blue-700 font-bold text-lg">
                                                    {f.name?.charAt(0)?.toUpperCase() || "F"}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-foreground truncate">{f.name || "—"}</p>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3" />{f.email}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-3 shrink-0">
                                                {f.position && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                        <Briefcase className="h-3 w-3" />{f.position}
                                                    </span>
                                                )}
                                                {f.qualification && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                                                        <Award className="h-3 w-3" />{f.qualification}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* ─── Students Tab ───────────────────────────── */}
            {activeTab === "students" && (
                <motion.div
                    key="students-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Search + Section Chips */}
                    <div className="space-y-3">
                        <div className="flex gap-3 items-center">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, roll no, section…"
                                    value={studentSearch}
                                    onChange={e => handleStudentSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={fetchStudents} title="Refresh">
                                <RefreshCw className={cn("h-4 w-4", studentsLoading && "animate-spin")} />
                            </Button>
                        </div>
                        {/* Section quick-filter chips */}
                        {uniqueSections.length > 1 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-muted-foreground mr-1">Sections:</span>
                                <button
                                    onClick={() => { setStudentSearch(""); setFilteredStudents(students); }}
                                    className={cn(
                                        "text-xs font-semibold px-2.5 py-1 rounded-full border transition-all",
                                        !studentSearch ? "bg-foreground text-background border-foreground" : "bg-muted/50 text-muted-foreground border-border hover:border-foreground/30"
                                    )}
                                >
                                    All
                                </button>
                                {uniqueSections.map(sec => (
                                    <button
                                        key={sec}
                                        onClick={() => handleStudentSearch(sec)}
                                        className={cn(
                                            "text-xs font-semibold px-2.5 py-1 rounded-full border transition-all",
                                            studentSearch === sec ? "bg-foreground text-background border-foreground" : "bg-muted/50 text-muted-foreground border-border hover:border-foreground/30"
                                        )}
                                    >
                                        Section {sec}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Students List */}
                    {studentsLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse h-20 bg-muted rounded-xl" />
                            ))}
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-16 opacity-60">
                            <GraduationCap className="h-14 w-14 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-lg font-medium">No students found</p>
                            <p className="text-sm text-muted-foreground">Try a different search term.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredStudents.map((s, idx) => {
                                const isExpanded = expandedStudent === s.id;
                                return (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                    >
                                        <Card className={cn(
                                            "border-border/50 hover:border-emerald-300/60 transition-all cursor-pointer",
                                            isExpanded && "border-emerald-300 shadow-md ring-1 ring-emerald-200/50"
                                        )}>
                                            <CardContent className="py-0 px-0">
                                                {/* Main row */}
                                                <div
                                                    className="flex items-center gap-4 py-4 px-5"
                                                    onClick={() => setExpandedStudent(isExpanded ? null : s.id)}
                                                >
                                                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shrink-0 shadow-sm">
                                                        <span className="text-emerald-700 font-bold text-base">
                                                            {s.name?.charAt(0)?.toUpperCase() || "S"}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-foreground truncate">{s.name || "—"}</p>
                                                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                                            <span className="text-xs text-muted-foreground font-mono">{s.rollno || "—"}</span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />{s.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                                                        {s.section && (
                                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                Sec {s.section}
                                                            </span>
                                                        )}
                                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                            Y{s.year} S{s.semester}
                                                        </span>
                                                    </div>
                                                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </button>
                                                </div>

                                                {/* Expanded details */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.25 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-5 pb-4 pt-1 border-t border-border/40">
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
                                                                    <DetailItem icon={<Building2 className="h-3.5 w-3.5" />} label="Department" value={s.dept} />
                                                                    <DetailItem icon={<BookOpen className="h-3.5 w-3.5" />} label="Section" value={s.section || "—"} />
                                                                    <DetailItem icon={<Hash className="h-3.5 w-3.5" />} label="Year / Sem" value={`Year ${s.year}, Sem ${s.semester}`} />
                                                                    <DetailItem icon={<Phone className="h-3.5 w-3.5" />} label="Mobile" value={s.mobile ? String(s.mobile) : "—"} />
                                                                    <DetailItem icon={<MapPin className="h-3.5 w-3.5" />} label="Address" value={s.address || "—"} />
                                                                    <DetailItem icon={<Droplets className="h-3.5 w-3.5" />} label="Blood Group" value={s.bloodGroup || "—"} />
                                                                    <DetailItem icon={<UserCircle className="h-3.5 w-3.5" />} label="Father" value={s.fathername || "—"} />
                                                                    <DetailItem icon={<UserCircle className="h-3.5 w-3.5" />} label="Mother" value={s.mothername || "—"} />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}

/* ── Detail item helper ─────────────────────────────────── */
function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                {icon}{label}
            </p>
            <p className="text-sm font-medium text-foreground truncate" title={value}>{value}</p>
        </div>
    );
}
