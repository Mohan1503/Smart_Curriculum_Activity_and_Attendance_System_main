"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send, Megaphone, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationPage() {
    const { user } = useAuth();
    const isFacultyOrAdmin = user?.role === "ROLE_FACULTY" || user?.role === "ROLE_DEPT_ADMIN" || user?.role === "ROLE_ADMIN";

    const [form, setForm] = useState({ title: "", message: "", targetEmail: "" });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState("");

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await api.post("/notifications/send", form);
            setSuccess("Notification sent successfully!");
            setForm({ title: "", message: "", targetEmail: "" });
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Notifications<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Stay updated with important announcements.</p>
            </div>

            <Tabs defaultValue="inbox" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="inbox" className="gap-2"><Bell className="h-4 w-4" /> Inbox</TabsTrigger>
                    {isFacultyOrAdmin && <TabsTrigger value="compose" className="gap-2"><Send className="h-4 w-4" /> Compose</TabsTrigger>}
                </TabsList>

                <TabsContent value="inbox">
                    <div className="space-y-4">
                        {/* Mock Notifications for visual fullness */}
                        <NotificationCard
                            title="Welcome to Smart Classroom"
                            message="Your account has been successfully set up. Please update your profile."
                            time="2 days ago"
                            icon={Megaphone}
                            color="blue"
                        />
                        <NotificationCard
                            title="Exam Schedule Released"
                            message="The enhanced schedule for Mid-Term exams is now available in the curriculum section."
                            time="Yesterday"
                            icon={Bell}
                            color="amber"
                        />
                        <NotificationCard
                            title="Library Due Date"
                            message="Reminder: Return 'Introduction to Algorithms' by Friday."
                            time="5 hours ago"
                            icon={User}
                            color="purple"
                        />
                    </div>
                </TabsContent>

                {isFacultyOrAdmin && (
                    <TabsContent value="compose">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send Announcement</CardTitle>
                                <CardDescription>Send a notification to a specific student or group (leave email empty for general).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSend} className="space-y-4 max-w-lg">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input placeholder="e.g. Class Rescheduled" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Message</label>
                                        <Textarea placeholder="Type your message here..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Target Email (Optional)</label>
                                        <Input placeholder="student@example.com" value={form.targetEmail} onChange={e => setForm({ ...form, targetEmail: e.target.value })} />
                                    </div>
                                    <Button disabled={sending} className="w-full">
                                        {sending ? "Sending..." : "Send Notification"}
                                    </Button>
                                    {success && <p className="text-green-600 text-sm text-center">{success}</p>}
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function NotificationCard({ title, message, time, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600",
        amber: "bg-amber-100 text-amber-600",
        purple: "bg-purple-100 text-purple-600"
    };

    return (
        <Card className="hover:bg-muted/40 transition-colors">
            <CardContent className="p-4 flex gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colors[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        <span className="text-xs text-muted-foreground">{time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{message}</p>
                </div>
            </CardContent>
        </Card>
    );
}
