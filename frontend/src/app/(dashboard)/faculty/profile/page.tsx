"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User, Mail, Phone, MapPin,
    Briefcase, Award, GraduationCap,
    PenSquare, Loader2, Save, X
} from "lucide-react";
import { motion } from "framer-motion";

interface FacultyProfile {
    name: string;
    email: string;
    department: string;
    mobile: number;
    designation: string;
    qualification: string;
    experience: number;
}

export default function FacultyProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<FacultyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<FacultyProfile | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/faculty/profile");
            setProfile(res.data);
            setFormData(res.data);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData) return;
        setSaving(true);
        try {
            const res = await api.put("/faculty/profile", formData);
            setProfile(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return <div className="p-8 text-center text-muted-foreground">Profile not found.</div>;
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Faculty Profile</h1>
                    <p className="text-muted-foreground">Manage your detailed professional profile.</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <PenSquare className="h-4 w-4" /> Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(profile); }}>
                            <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* ID Card / Main Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-1 space-y-6"
                >
                    <Card className="overflow-hidden border-border/60 shadow-lg">
                        <div className="h-32 bg-gradient-to-br from-blue-500/20 to-indigo-500/20" />
                        <CardContent className="pt-0 relative">
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full border-4 border-background bg-zinc-100 flex items-center justify-center">
                                <User className="h-16 w-16 text-zinc-300" />
                            </div>
                            <div className="mt-20 text-center space-y-1">
                                <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                                <p className="text-sm text-muted-foreground font-medium">{profile.designation || "Faculty Member"}</p>
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                        {profile.department}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Experience & Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">Experience</span>
                                </div>
                                <span className="font-bold">{profile.experience} Years</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Award className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">Qualification</span>
                                </div>
                                <span className="font-bold truncate max-w-[120px]" title={profile.qualification}>{profile.qualification}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Editable Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-2 space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                            <CardDescription>
                                Update your contact and academic information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData?.name}
                                            onChange={e => setFormData(prev => ({ ...prev!, name: e.target.value }))}
                                            disabled={!isEditing}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData?.designation}
                                            onChange={e => setFormData(prev => ({ ...prev!, designation: e.target.value }))}
                                            disabled={!isEditing}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email (Read Only)</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input value={user?.sub || ""} disabled className="pl-9 bg-muted/50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData?.mobile}
                                            onChange={e => setFormData(prev => ({ ...prev!, mobile: Number(e.target.value) }))}
                                            disabled={!isEditing}
                                            className="pl-9"
                                            type="tel"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Qualification</Label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData?.qualification}
                                            onChange={e => setFormData(prev => ({ ...prev!, qualification: e.target.value }))}
                                            disabled={!isEditing}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Years of Experience</Label>
                                    <Input
                                        type="number"
                                        value={formData?.experience}
                                        onChange={e => setFormData(prev => ({ ...prev!, experience: Number(e.target.value) }))}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
