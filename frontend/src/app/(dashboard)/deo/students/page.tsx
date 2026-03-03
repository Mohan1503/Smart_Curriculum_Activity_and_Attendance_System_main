"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, UserCheck, GraduationCap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function DEOStudentsPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [form, setForm] = useState({
        email: "",
        section: "A",
        dept: "CSE"
    });

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await api.post("/deo/assign-section", form);
            setMessage({ type: 'success', text: `Successfully assigned ${form.email} to ${form.section}` });
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to assign student. Verify email." });
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

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-5xl mx-auto space-y-8 pb-10"
        >
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Student Management<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Organize classes and assign faculty mentors.</p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2">
                <motion.div variants={item}>
                    <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm border-t border-l border-white/20">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <UserCheck className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle>Assign Section</CardTitle>
                                    <CardDescription>Allocate individual students.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAssign} className="space-y-6">
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}
                                    >
                                        <CheckCircle className="h-4 w-4 shrink-0" />
                                        {message.text}
                                    </motion.div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Email</Label>
                                        <Input
                                            type="email"
                                            placeholder="student@example.com"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="bg-background/50 border-border/60 focus:bg-background transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dept</Label>
                                            <Input
                                                value={form.dept}
                                                onChange={e => setForm({ ...form, dept: e.target.value })}
                                                className="bg-background/50 font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Section</Label>
                                            <Input
                                                value={form.section}
                                                onChange={e => setForm({ ...form, section: e.target.value })}
                                                className="bg-background/50 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Assign Section"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="space-y-6">
                    <Card className="border-border/60 bg-muted/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Bulk Actions</CardTitle>
                            <CardDescription>Advanced tools for batch management.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50 group hover:border-indigo-500/30 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold text-foreground">Promote Batch</p>
                                        <p className="text-muted-foreground">Move Sem 1 to Sem 2</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50 group hover:border-indigo-500/30 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <UserCheck className="h-5 w-5" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold text-foreground">Import CSV</p>
                                        <p className="text-muted-foreground">Bulk assign sections</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <h4 className="font-bold text-orange-600 text-sm mb-2">Note to Administrator</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Assigning a section will automatically update the student's dashboard to reflect the relevant timetable and curriculum for that section. Existing schedule data will be overwritten.
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
