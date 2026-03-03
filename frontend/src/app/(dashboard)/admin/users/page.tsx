"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
    Upload, Loader2, CheckCircle, AlertCircle, FileSpreadsheet,
    Users, GraduationCap, School, Search, Pencil, Trash2, Plus,
    Shield, Info, Download, Table
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface User {
    id: number;
    email: string;
    role: string;
    firstlogin: boolean;
}

const STUDENT_HEADERS = ["email", "role", "rollno", "name", "section", "dept", "year", "semester", "mobile", "address", "bloodgroup", "mothername", "fathername"];
const FACULTY_HEADERS = ["email", "role", "name", "dept", "position", "qualification"];

const STUDENT_SAMPLE = [
    ["john@college.edu", "STUDENT", "21CS101", "John Doe", "A", "CSE", "2", "3", "9876543210", "123 Main St", "O+", "Jane Doe", "Jim Doe"],
    ["sara@college.edu", "STUDENT", "21CS102", "Sara Lee", "B", "CSE", "2", "3", "9876543211", "456 Oak Ave", "A+", "Mary Lee", "Tom Lee"],
];
const FACULTY_SAMPLE = [
    ["prof.smith@college.edu", "FACULTY", "Dr. Smith", "CSE", "Professor", "Ph.D Computer Science"],
    ["deo.cse@college.edu", "DEO", "Ms. Johnson", "CSE", "Department Executive Officer", "M.Tech"],
];

export default function AdminUsersPage() {
    // Bulk upload state
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // User list state
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [filterRole, setFilterRole] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    // CRUD dialog state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ email: "", role: "STUDENT", password: "" });
    const [crudLoading, setCrudLoading] = useState(false);
    const [crudMessage, setCrudMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Active tab
    const [activeTab, setActiveTab] = useState<"list" | "upload">("list");
    // Format guide visibility
    const [showFormatGuide, setShowFormatGuide] = useState(true);

    // Fetch users
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Filter users
    useEffect(() => {
        let result = users;
        if (filterRole !== "ALL") result = result.filter((u) => u.role === filterRole);
        if (searchTerm) result = result.filter((u) => u.email.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredUsers(result);
    }, [users, filterRole, searchTerm]);

    // Drag-and-drop handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        setUploadMessage(null);
        const fd = new FormData();
        fd.append("file", file);
        try {
            const res = await api.post("/admin/upload-users", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setUploadMessage({ type: "success", text: res.data });
            setFile(null);
            if (inputRef.current) inputRef.current.value = "";
            fetchUsers();
        } catch (err: any) {
            setUploadMessage({ type: "error", text: err?.response?.data || "Failed to upload. Check file format and columns." });
        } finally {
            setUploading(false);
        }
    };

    const downloadSampleCSV = (type: "student" | "faculty") => {
        const headers = type === "student" ? STUDENT_HEADERS : FACULTY_HEADERS;
        const samples = type === "student" ? STUDENT_SAMPLE : FACULTY_SAMPLE;
        const csvContent = [headers.join(","), ...samples.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sample_${type}_upload.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // CRUD handlers
    const handleCreateUser = async () => {
        setCrudLoading(true);
        try {
            await api.post("/admin/users", formData);
            setCrudMessage({ type: "success", text: "User created successfully" });
            setIsCreateOpen(false);
            setFormData({ email: "", role: "STUDENT", password: "" });
            fetchUsers();
        } catch (err: any) {
            setCrudMessage({ type: "error", text: err?.response?.data || "Failed to create user" });
        } finally {
            setCrudLoading(false);
        }
    };
    const handleEditUser = async () => {
        if (!selectedUser) return;
        setCrudLoading(true);
        try {
            await api.put(`/admin/users/${selectedUser.id}`, formData);
            setIsEditOpen(false);
            fetchUsers();
        } catch {
            console.error("Failed to update user");
        } finally {
            setCrudLoading(false);
        }
    };
    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setCrudLoading(true);
        try {
            await api.delete(`/admin/users/${selectedUser.id}`);
            setIsDeleteOpen(false);
            fetchUsers();
        } catch {
            console.error("Failed to delete user");
        } finally {
            setCrudLoading(false);
        }
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({ email: user.email, role: user.role, password: "" });
        setIsEditOpen(true);
    };
    const openDelete = (user: User) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    const roleColor = (role: string) => {
        switch (role) {
            case "STUDENT": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "FACULTY": return "bg-blue-100 text-blue-700 border-blue-200";
            case "DEO": return "bg-purple-100 text-purple-700 border-purple-200";
            case "ADMIN": return "bg-rose-100 text-rose-700 border-rose-200";
            default: return "bg-muted text-muted-foreground";
        }
    };

    const roleCounts = {
        ALL: users.length,
        STUDENT: users.filter((u) => u.role === "STUDENT").length,
        FACULTY: users.filter((u) => u.role === "FACULTY").length,
        DEO: users.filter((u) => u.role === "DEO").length,
        ADMIN: users.filter((u) => u.role === "ADMIN").length,
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
                    <p className="text-muted-foreground mt-1">Manage all platform users and bulk onboarding.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={activeTab === "list" ? "default" : "outline"} onClick={() => setActiveTab("list")} className="font-semibold">
                        <Users className="h-4 w-4 mr-2" /> User List
                    </Button>
                    <Button variant={activeTab === "upload" ? "default" : "outline"} onClick={() => setActiveTab("upload")} className="font-semibold">
                        <Upload className="h-4 w-4 mr-2" /> Bulk Upload
                    </Button>
                </div>
            </div>

            {crudMessage && (
                <div className={cn("p-4 rounded-xl border text-sm font-medium", crudMessage.type === "success" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20")}>
                    {crudMessage.text}
                </div>
            )}

            <AnimatePresence mode="wait">
                {activeTab === "list" && (
                    <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                        {/* Filters */}
                        <Card className="border-border/60 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="flex items-center gap-2 flex-1">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search by email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm bg-background/50" />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(["ALL", "STUDENT", "FACULTY", "DEO", "ADMIN"] as const).map((role) => (
                                            <Button key={role} variant={filterRole === role ? "default" : "outline"} size="sm" onClick={() => setFilterRole(role)} className={cn("font-medium text-xs", filterRole === role && "shadow-md")}>
                                                {role === "ALL" ? "All" : role}
                                                <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{roleCounts[role]}</span>
                                            </Button>
                                        ))}
                                    </div>
                                    <Button onClick={() => { setFormData({ email: "", role: "STUDENT", password: "" }); setIsCreateOpen(true); }} className="font-bold shadow-lg shadow-primary/20">
                                        <Plus className="h-4 w-4 mr-2" /> Add User
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Table */}
                        <Card className="border-border/60 shadow-md overflow-hidden">
                            <CardContent className="p-0">
                                {loadingUsers ? (
                                    <div className="p-16 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading users...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-16 text-center text-muted-foreground"><Users className="h-8 w-8 mx-auto mb-2 opacity-40" /><p className="font-medium">No users found</p></div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-muted/30 border-b border-border">
                                                    <th className="text-left p-4 font-semibold text-muted-foreground">ID</th>
                                                    <th className="text-left p-4 font-semibold text-muted-foreground">Email</th>
                                                    <th className="text-left p-4 font-semibold text-muted-foreground">Role</th>
                                                    <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                                                    <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {filteredUsers.map((user) => (
                                                    <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                                                        <td className="p-4 font-mono text-xs text-muted-foreground">#{user.id}</td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{user.email.charAt(0).toUpperCase()}</div>
                                                                <span className="font-medium text-foreground">{user.email}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4"><span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border", roleColor(user.role))}>{user.role}</span></td>
                                                        <td className="p-4">
                                                            <span className={cn("text-xs font-medium", user.firstlogin ? "text-amber-600" : "text-emerald-600")}>{user.firstlogin ? "First Login Pending" : "Active"}</span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="sm" onClick={() => openEdit(user)} className="h-8 w-8 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                                                                <Button variant="ghost" size="sm" onClick={() => openDelete(user)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {activeTab === "upload" && (
                    <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        {/* Format Guide */}
                        <Card className="border-border/60 shadow-lg bg-card/50 backdrop-blur-sm">
                            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                            <CardHeader className="cursor-pointer" onClick={() => setShowFormatGuide(!showFormatGuide)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-blue-600" />
                                        <CardTitle className="text-lg">File Format Guide</CardTitle>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">{showFormatGuide ? "Click to collapse" : "Click to expand"}</span>
                                </div>
                                <CardDescription>Your file must include a <strong>role</strong> column. The role determines the account type and which columns are used.</CardDescription>
                            </CardHeader>
                            {showFormatGuide && (
                                <CardContent className="space-y-6">
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <p className="text-sm font-semibold text-amber-800 mb-2">Important Rules</p>
                                        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                                            <li>Supported formats: <strong>.csv</strong>, <strong>.xlsx</strong>, <strong>.xls</strong></li>
                                            <li>The first row <strong>must be headers</strong> (column names)</li>
                                            <li>Required columns: <strong>email</strong> and <strong>role</strong></li>
                                            <li>Valid roles: <strong>STUDENT</strong>, <strong>FACULTY</strong>, <strong>DEO</strong>, <strong>ADMIN</strong></li>
                                            <li>Default password for all accounts: <strong>Welcome@123</strong></li>
                                            <li>Duplicate emails are automatically skipped</li>
                                            <li>You can mix roles in the same file</li>
                                        </ul>
                                    </div>

                                    {/* Student Format */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-sm flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-emerald-600" />
                                                Student Format
                                            </h3>
                                            <Button variant="outline" size="sm" onClick={() => downloadSampleCSV("student")} className="text-xs">
                                                <Download className="h-3.5 w-3.5 mr-1" /> Download Sample
                                            </Button>
                                        </div>
                                        <div className="overflow-x-auto rounded-lg border border-border">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-emerald-50 border-b border-border">
                                                        {STUDENT_HEADERS.map(h => (
                                                            <th key={h} className={cn("p-2 text-left font-bold whitespace-nowrap", (h === "email" || h === "role") ? "text-emerald-800 bg-emerald-100" : "text-muted-foreground")}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {STUDENT_SAMPLE.map((row, i) => (
                                                        <tr key={i} className="border-b border-border/50 last:border-0">
                                                            {row.map((cell, j) => (
                                                                <td key={j} className="p-2 whitespace-nowrap text-muted-foreground">{cell}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Faculty/DEO Format */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-sm flex items-center gap-2">
                                                <Users className="h-4 w-4 text-blue-600" />
                                                Faculty / DEO Format
                                            </h3>
                                            <Button variant="outline" size="sm" onClick={() => downloadSampleCSV("faculty")} className="text-xs">
                                                <Download className="h-3.5 w-3.5 mr-1" /> Download Sample
                                            </Button>
                                        </div>
                                        <div className="overflow-x-auto rounded-lg border border-border">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-blue-50 border-b border-border">
                                                        {FACULTY_HEADERS.map(h => (
                                                            <th key={h} className={cn("p-2 text-left font-bold whitespace-nowrap", (h === "email" || h === "role") ? "text-blue-800 bg-blue-100" : "text-muted-foreground")}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {FACULTY_SAMPLE.map((row, i) => (
                                                        <tr key={i} className="border-b border-border/50 last:border-0">
                                                            {row.map((cell, j) => (
                                                                <td key={j} className="p-2 whitespace-nowrap text-muted-foreground">{cell}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                                        <p className="text-xs text-muted-foreground">
                                            <strong>Tip:</strong> You can include students, faculty, and DEOs in a single file. The <strong>role</strong> column in each row determines which profile fields are read.
                                            Columns that don&apos;t apply to a role are simply ignored.
                                        </p>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* Upload Area */}
                        <Card className="border-border/60 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-primary to-orange-500" />
                            <CardHeader>
                                <CardTitle>Upload Users</CardTitle>
                                <CardDescription>Upload a CSV or Excel file with user data. The role is determined by the &ldquo;role&rdquo; column in each row.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpload} className="space-y-6">
                                    {uploadMessage && (
                                        <div className="space-y-3">
                                            <div className={cn("p-4 rounded-xl flex items-start gap-3 border", uploadMessage.type === "success" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20")}>
                                                {uploadMessage.type === "success" ? <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                                                <p className="font-medium text-sm whitespace-pre-wrap">{uploadMessage.text}</p>
                                            </div>
                                            {uploadMessage.type === "success" && (
                                                <div className="p-4 rounded-xl bg-blue-500/10 text-blue-700 border border-blue-500/20 flex items-start gap-3">
                                                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                                    <div className="text-sm">
                                                        <p className="font-bold">Default Password: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-blue-900">Welcome@123</span></p>
                                                        <p className="text-xs mt-1 text-blue-600">All newly created users can log in with this password. They will be prompted to change it on first login.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => inputRef.current?.click()} className={cn("border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group", dragActive ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/50", file ? "bg-green-50/50 border-green-500/30" : "")}>
                                        <Input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
                                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", file ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary")}>{file ? <FileSpreadsheet className="h-7 w-7" /> : <Upload className="h-7 w-7" />}</div>
                                        {file ? (
                                            <div className="text-center">
                                                <p className="font-bold text-foreground">{file.name}</p>
                                                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <p className="font-bold text-foreground">Click to upload or drag and drop</p>
                                                <p className="text-sm text-muted-foreground">Supports .csv, .xlsx, and .xls files</p>
                                            </div>
                                        )}
                                    </div>
                                    <Button type="submit" size="lg" className="w-full font-bold shadow-lg" disabled={!file || uploading}>
                                        {uploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
                                        {uploading ? "Processing..." : "Upload & Create Accounts"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create User Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create New User</DialogTitle><DialogDescription>Add a single user to the platform.</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Email</Label><Input placeholder="user@institution.edu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="STUDENT">Student</SelectItem><SelectItem value="FACULTY">Faculty</SelectItem><SelectItem value="DEO">Department Admin</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="Leave empty for default (Welcome@123)" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateUser} disabled={crudLoading || !formData.email} className="font-bold">{crudLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit User</DialogTitle><DialogDescription>Update user details for {selectedUser?.email}</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Email</Label><Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="STUDENT">Student</SelectItem><SelectItem value="FACULTY">Faculty</SelectItem><SelectItem value="DEO">Department Admin</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>New Password (optional)</Label><Input type="password" placeholder="Leave empty to keep current" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditUser} disabled={crudLoading} className="font-bold">{crudLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete User</DialogTitle><DialogDescription>Are you sure you want to delete <strong>{selectedUser?.email}</strong>? This will also remove their profile data. This action cannot be undone.</DialogDescription></DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteUser} disabled={crudLoading} className="font-bold">{crudLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
