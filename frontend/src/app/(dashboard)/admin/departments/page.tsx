"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Building2, Users, GraduationCap, Plus, Loader2, School, UserCheck, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Department {
    name: string;
    facultyCount: number;
    studentCount: number;
    deoEmail: string | null;
}

export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);

    const [formData, setFormData] = useState({ name: "", deoEmail: "", deoPassword: "" });

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/departments");
            setDepartments(res.data);
        } catch (err) {
            console.error("Failed to fetch departments", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDepartments(); }, []);

    const handleCreate = async () => {
        setCreating(true);
        setMessage(null);
        try {
            await api.post("/admin/departments", formData);
            setMessage({ type: "success", text: `Department "${formData.name}" created successfully!` });
            setIsCreateOpen(false);
            setFormData({ name: "", deoEmail: "", deoPassword: "" });
            fetchDepartments();
        } catch (err: any) {
            setMessage({ type: "error", text: err?.response?.data || "Failed to create department." });
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedDept) return;
        setEditing(true);
        setMessage(null);
        try {
            await api.put(`/admin/departments/${encodeURIComponent(selectedDept.name)}`, formData);
            setMessage({ type: "success", text: `Department updated successfully!` });
            setIsEditOpen(false);
            fetchDepartments();
        } catch (err: any) {
            setMessage({ type: "error", text: err?.response?.data || "Failed to update department." });
        } finally {
            setEditing(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedDept) return;
        setDeleting(true);
        setMessage(null);
        try {
            await api.delete(`/admin/departments/${encodeURIComponent(selectedDept.name)}`);
            setMessage({ type: "success", text: `Department "${selectedDept.name}" deleted successfully!` });
            setIsDeleteOpen(false);
            fetchDepartments();
        } catch (err: any) {
            setMessage({ type: "error", text: err?.response?.data || "Failed to delete department." });
        } finally {
            setDeleting(false);
        }
    };

    const openEdit = (dept: Department) => {
        setSelectedDept(dept);
        setFormData({ name: dept.name, deoEmail: dept.deoEmail || "", deoPassword: "" });
        setIsEditOpen(true);
    };

    const openDelete = (dept: Department) => {
        setSelectedDept(dept);
        setIsDeleteOpen(true);
    };

    const totalStudents = departments.reduce((s, d) => s + d.studentCount, 0);
    const totalFaculty = departments.reduce((s, d) => s + d.facultyCount, 0);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Department Management</h1>
                    <p className="text-muted-foreground mt-1">Create, edit, and manage all academic departments.</p>
                </div>
                <Button onClick={() => { setFormData({ name: "", deoEmail: "", deoPassword: "" }); setIsCreateOpen(true); }} className="font-bold shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4 mr-2" /> New Department
                </Button>
            </div>

            {message && (
                <div className={cn("p-4 rounded-xl border text-sm font-medium", message.type === "success" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20")}>
                    {message.text}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center"><Building2 className="h-6 w-6 text-indigo-600" /></div>
                        <div><p className="text-2xl font-bold">{departments.length}</p><p className="text-xs text-muted-foreground font-medium">Total Departments</p></div>
                    </CardContent>
                </Card>
                <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center"><GraduationCap className="h-6 w-6 text-emerald-600" /></div>
                        <div><p className="text-2xl font-bold">{totalStudents}</p><p className="text-xs text-muted-foreground font-medium">Total Students</p></div>
                    </CardContent>
                </Card>
                <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center"><Users className="h-6 w-6 text-blue-600" /></div>
                        <div><p className="text-2xl font-bold">{totalFaculty}</p><p className="text-xs text-muted-foreground font-medium">Total Faculty</p></div>
                    </CardContent>
                </Card>
            </div>

            {/* Department Grid */}
            {loading ? (
                <div className="p-16 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading departments...</div>
            ) : departments.length === 0 ? (
                <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-16 text-center text-muted-foreground">
                        <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No departments yet</p>
                        <p className="text-sm mt-1">Create your first department to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {departments.map((dept, i) => (
                        <motion.div key={dept.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card className="border-border/60 shadow-md hover:shadow-lg transition-shadow h-full group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                                            <School className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(dept)} className="h-8 w-8 p-0">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openDelete(dept)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg mt-2">{dept.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xl font-bold text-foreground">{dept.studentCount}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase">Students</p>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xl font-bold text-foreground">{dept.facultyCount}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase">Faculty</p>
                                        </div>
                                    </div>
                                    {dept.deoEmail && (
                                        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
                                            <UserCheck className="h-4 w-4 text-purple-600" />
                                            <div>
                                                <p className="text-[10px] text-purple-500 font-semibold uppercase">DEO</p>
                                                <p className="text-xs font-medium text-purple-700 truncate">{dept.deoEmail}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Department Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Department</DialogTitle>
                        <DialogDescription>Create a department and optionally assign a DEO.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Department Name</Label>
                            <Input placeholder="e.g. CSE, ECE, MECH" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>DEO Email (optional)</Label>
                            <Input placeholder="deo@institution.edu" value={formData.deoEmail} onChange={e => setFormData({ ...formData, deoEmail: e.target.value })} />
                            <p className="text-xs text-muted-foreground">If the email doesn&apos;t exist, a new DEO account will be created.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>DEO Password (if creating new)</Label>
                            <Input type="password" placeholder="Leave empty for default (Welcome@123)" value={formData.deoPassword} onChange={e => setFormData({ ...formData, deoPassword: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating || !formData.name} className="font-bold">
                            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Department
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Department Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>Update department name or reassign the DEO for &ldquo;{selectedDept?.name}&rdquo;.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Department Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>DEO Email</Label>
                            <Input placeholder="deo@institution.edu" value={formData.deoEmail} onChange={e => setFormData({ ...formData, deoEmail: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>DEO Password (if creating new DEO)</Label>
                            <Input type="password" placeholder="Leave empty for default (Welcome@123)" value={formData.deoPassword} onChange={e => setFormData({ ...formData, deoPassword: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEdit} disabled={editing || !formData.name} className="font-bold">
                            {editing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Department Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Department</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedDept?.name}</strong>?
                            {(selectedDept?.studentCount || 0) > 0 || (selectedDept?.facultyCount || 0) > 0 ? (
                                <span className="block mt-2 text-destructive font-medium">
                                    This department has {selectedDept?.studentCount} student(s) and {selectedDept?.facultyCount} faculty member(s). You must remove them before deleting.
                                </span>
                            ) : (
                                <span className="block mt-2">This action cannot be undone.</span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="font-bold">
                            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Department
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
