"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, CheckCircle, Upload, Plus, Pencil, Calendar, Settings2, Clock, ArrowRight, List } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AllTimetablesView } from "@/components/AllTimetablesView";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function DEOTimetablePage() {
    const [activeTab, setActiveTab] = useState<"create" | "view">("view");
    const [step, setStep] = useState<"config" | "editor">("config");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [facultyList, setFacultyList] = useState<any[]>([]);

    // Configuration State
    const [config, setConfig] = useState({
        dept: "CSE",
        section: "A",
        year: 2,
        semester: 3,
        collegeStartTime: "08:30",
        periodDurationMinutes: 50,
        morningBreakAfter: 2,
        morningBreakMinutes: 10,
        lunchBreakAfter: 4,
        lunchBreakMinutes: 60
    });

    // Grid State
    const [gridData, setGridData] = useState<Record<string, Record<number, any>>>({
        "MONDAY": {}, "TUESDAY": {}, "WEDNESDAY": {}, "THURSDAY": {}, "FRIDAY": {}, "SATURDAY": {}
    });

    // Editor Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCell, setEditingCell] = useState<{ day: string, period: number } | null>(null);
    const [cellForm, setCellForm] = useState({
        subjectName: "",
        subjectCode: "",
        facultyEmail: ""
    });

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const res = await api.get("/deo/faculty-list");
                setFacultyList(res.data);
            } catch (e) {
                console.error("Failed to fetch faculty", e);
            }
        };
        fetchFaculty();
    }, []);

    const handleCreateGrid = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("editor");
    };

    const openEditModal = (day: string, period: number) => {
        const existing = gridData[day]?.[period] || {};
        setEditingCell({ day, period });
        setCellForm({
            subjectName: existing.subjectName || "",
            subjectCode: existing.subjectCode || "",
            facultyEmail: existing.facultyEmail || ""
        });
        setIsEditOpen(true);
    };

    const saveCell = () => {
        if (!editingCell) return;
        setGridData(prev => ({
            ...prev,
            [editingCell.day]: {
                ...prev[editingCell.day],
                [editingCell.period]: { ...cellForm }
            }
        }));
        setIsEditOpen(false);
    };

    const handlePublish = async () => {
        setLoading(true);
        setMessage(null);

        const daysPayload: any = {};
        DAYS.forEach(day => {
            const periodsData: any = {};
            for (let p = 1; p <= 7; p++) {
                const cell = gridData[day]?.[p];
                if (cell && cell.subjectName) {
                    periodsData[p] = cell;
                }
            }
            daysPayload[day] = { periods: periodsData };
        });

        const payload = { ...config, days: daysPayload };

        try {
            await api.post("/deo/post-timetable", payload);
            setMessage({ type: 'success', text: "Timetable Published Successfully!" });
            setTimeout(() => setStep("config"), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to publish timetable." });
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    if (step === "config") {
        return (
            <div className="space-y-6">
                {/* Tab Switcher */}
                <div className="flex items-center gap-3">
                    <Button variant={activeTab === "view" ? "default" : "outline"} onClick={() => setActiveTab("view")} className="font-semibold">
                        <List className="h-4 w-4 mr-2" /> All Timetables
                    </Button>
                    <Button variant={activeTab === "create" ? "default" : "outline"} onClick={() => setActiveTab("create")} className="font-semibold">
                        <Plus className="h-4 w-4 mr-2" /> Create Timetable
                    </Button>
                </div>

                {activeTab === "view" && (
                    <AllTimetablesView userRole="DEO" />
                )}

                {activeTab === "create" && (
            <motion.div key="config" variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
                <motion.div variants={item} className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Create Timetable<span className="text-primary">.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">Setup class scheduling and duration rules.</p>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-black/5">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Settings2 className="h-5 w-5 text-primary" />
                                <span className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Step 1 of 2</span>
                            </div>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Define target section and time parameters.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateGrid} className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm border-b pb-2 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        Target Batch
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>Dept</Label>
                                            <Input value={config.dept} onChange={e => setConfig({ ...config, dept: e.target.value })} className="bg-muted/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Section</Label>
                                            <Input value={config.section} onChange={e => setConfig({ ...config, section: e.target.value })} className="bg-muted/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Semester</Label>
                                            <Input type="number" value={config.semester} onChange={e => setConfig({ ...config, semester: parseInt(e.target.value) })} className="bg-muted/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Year</Label>
                                            <Input type="number" value={config.year} onChange={e => setConfig({ ...config, year: parseInt(e.target.value) })} className="bg-muted/50" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm border-b pb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        Timing Rules
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Time</Label>
                                            <Input type="time" value={config.collegeStartTime} onChange={e => setConfig({ ...config, collegeStartTime: e.target.value })} className="bg-muted/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Duration (min)</Label>
                                            <Input type="number" value={config.periodDurationMinutes} onChange={e => setConfig({ ...config, periodDurationMinutes: parseInt(e.target.value) })} className="bg-muted/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Break After</Label>
                                            <Input type="number" value={config.morningBreakAfter} onChange={e => setConfig({ ...config, morningBreakAfter: parseInt(e.target.value) })} className="bg-muted/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lunch After</Label>
                                            <Input type="number" value={config.lunchBreakAfter} onChange={e => setConfig({ ...config, lunchBreakAfter: parseInt(e.target.value) })} className="bg-muted/50" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" size="lg" className="font-bold shadow-lg shadow-primary/20">
                                        Proceed to Scheduler <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
                )}
            </div>
        );
    }

    // EDITOR VIEW
    return (
        <motion.div key="editor" variants={container} initial="hidden" animate="show" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div variants={item}>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Schedule</h1>
                    <p className="flex items-center gap-2 text-muted-foreground mt-1">
                        <span className="font-medium text-foreground bg-secondary px-2 py-0.5 rounded">{config.dept} - {config.section}</span>
                        <span>•</span>
                        <span>Semester {config.semester}</span>
                    </p>
                </motion.div>
                <motion.div variants={item} className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep("config")}>Back</Button>
                    <Button onClick={handlePublish} disabled={loading} className="font-bold shadow-lg shadow-primary/20">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Timetable
                    </Button>
                </motion.div>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}
                >
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">{message.text}</span>
                </motion.div>
            )}

            <motion.div variants={item} className="overflow-x-auto rounded-xl border border-border shadow-xl bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/50 text-left border-b border-border">
                            <th className="p-4 font-bold text-muted-foreground w-32 border-r border-border/50 sticky left-0 bg-muted/95 backdrop-blur">Day</th>
                            {[1, 2, 3, 4, 5, 6, 7].map(p => (
                                <th key={p} className="p-4 font-medium min-w-[160px] text-center">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Period {p}</div>
                                    {p === config.morningBreakAfter && <span className="block text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit mx-auto mt-1">Break After</span>}
                                    {p === config.lunchBreakAfter && <span className="block text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full w-fit mx-auto mt-1">Lunch After</span>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {DAYS.map(day => (
                            <tr key={day} className="group hover:bg-muted/10 transition-colors">
                                <td className="p-4 font-bold text-foreground border-r border-border/50 sticky left-0 bg-card group-hover:bg-muted/10 transition-colors z-10">
                                    {day.substring(0, 3)}
                                </td>
                                {[1, 2, 3, 4, 5, 6, 7].map(period => {
                                    const cell = gridData[day]?.[period];
                                    return (
                                        <td key={period} className="p-2 border-l border-border/30 first:border-0 relative">
                                            <div
                                                onClick={() => openEditModal(day, period)}
                                                className={`min-h-[90px] p-3 rounded-lg cursor-pointer transition-all border ${cell?.subjectName
                                                    ? "bg-primary/5 border-primary/20 hover:border-primary/50 hover:shadow-md"
                                                    : "bg-transparent border-transparent hover:bg-muted/30 hover:border-border/60 border-dashed"
                                                    }`}
                                            >
                                                {cell?.subjectName ? (
                                                    <div className="text-xs flex flex-col h-full justify-between">
                                                        <div>
                                                            <div className="font-bold text-foreground text-sm truncate mb-0.5" title={cell.subjectName}>{cell.subjectName}</div>
                                                            <div className="text-primary font-mono text-[10px] bg-primary/10 w-fit px-1.5 py-0.5 rounded">{cell.subjectCode}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground mt-2">
                                                            <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold">F</div>
                                                            <span className="truncate max-w-[100px]">{cell.facultyEmail?.split('@')[0]}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-muted-foreground/20 group-hover:text-primary/50 transition-colors">
                                                        <Plus className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Slot: {editingCell?.day} - Period {editingCell?.period}</DialogTitle>
                        <DialogDescription>Assign a subject and faculty to this period.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Subject Name</Label>
                            <Input placeholder="e.g. Data Structures" value={cellForm.subjectName} onChange={e => setCellForm({ ...cellForm, subjectName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Subject Code</Label>
                            <Input placeholder="e.g. CS301" value={cellForm.subjectCode} onChange={e => setCellForm({ ...cellForm, subjectCode: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Faculty</Label>
                            <Select value={cellForm.facultyEmail} onValueChange={(val) => setCellForm({ ...cellForm, facultyEmail: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Faculty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {facultyList.length > 0 ? facultyList.map((f: any) => (
                                        <SelectItem key={f.email} value={f.email}>{f.name} ({f.email})</SelectItem>
                                    )) : (
                                        <SelectItem value="manual">No Faculty Found (Type manually)</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {facultyList.length === 0 && (
                                <Input
                                    placeholder="Or type faculty email manually"
                                    value={cellForm.facultyEmail}
                                    onChange={e => setCellForm({ ...cellForm, facultyEmail: e.target.value })}
                                    className="mt-2"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={saveCell} className="font-bold">Save Slot</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
