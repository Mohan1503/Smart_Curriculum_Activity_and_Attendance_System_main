"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Copy } from "lucide-react";
// Removed QRCodeSVG import as it requires a package install, using API image fallback for now.

export default function GenerateQRPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassIndex, setSelectedClassIndex] = useState("");
    const [duration, setDuration] = useState("10"); // minutes
    const [qrToken, setQrToken] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load today's classes to easier select
        api.get("/faculty/today")
            .then(res => setClasses(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleGenerate = async () => {
        if (!selectedClassIndex) return;
        setLoading(true);
        const cls = classes[parseInt(selectedClassIndex)];

        try {
            const res = await api.post("/faculty/generate-qr", {
                subjectCode: cls.subjectCode,
                subjectName: cls.subjectName,
                dept: cls.dept,
                section: cls.section,
                semester: cls.semester,
                startTime: cls.startTime + ":00", // "09:00" -> "09:00:00"
                endTime: cls.endTime + ":00"
            });
            setQrToken(res.data); // Returns the token string
        } catch (err) {
            console.error("Failed to generate QR", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Attendance Session</h1>
                <p className="text-gray-500">Generate a QR code for students to scan.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Session Details</CardTitle>
                        <CardDescription>Select a class to start attendance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Class</Label>
                            <Select
                                value={selectedClassIndex}
                                onValueChange={(val) => {
                                    setSelectedClassIndex(val);
                                    setQrToken("");
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Choose Class --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls, idx) => (
                                        <SelectItem key={idx} value={String(idx)}>
                                            {cls.subjectName} ({cls.startTime} - {cls.section})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>QR Validity (Minutes)</Label>
                            <Input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                min="1"
                            />
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleGenerate}
                            disabled={!selectedClassIndex || loading}
                        >
                            {loading ? "Generating..." : "Generate Code"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="flex flex-col items-center justify-center min-h-[300px]">
                    {qrToken ? (
                        <div className="text-center space-y-4 p-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm border inline-block">
                                <div className="h-48 w-48 bg-slate-100 flex items-center justify-center">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrToken}`}
                                        alt="QR Code"
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-mono mb-2 break-all">{qrToken}</p>
                                <p className="font-medium text-lg text-primary">Scan to Mark Present</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-6">
                            <QrCode className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p>Select a class and generate code to see it here.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
