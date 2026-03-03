"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentScanPage() {
    const [token, setToken] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setStatus("loading");
        setMessage("");

        try {
            // Assuming backend endpoint is /student/scan with { token }
            const res = await api.post("/student/scan", { token });
            setStatus("success");
            setMessage(res.data || "Attendance marked successfully!");
            setTimeout(() => {
                router.push("/student");
            }, 2000);
        } catch (err: any) {
            setStatus("error");
            setMessage(err.response?.data?.message || err.response?.data || "Invalid QR Code or Expired");
        }
    };

    return (
        <div className="max-w-md mx-auto py-8">
            <Link href="/student" className="flex items-center text-sm text-gray-500 hover:text-primary mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Link>

            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <QrCode className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Scan Attendance</CardTitle>
                    <CardDescription>
                        Enter the code displayed on the projector to mark your attendance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleScan} className="space-y-4">
                        {status === "success" && (
                            <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm text-center">
                                {message}
                            </div>
                        )}
                        {status === "error" && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
                                {message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Input
                                placeholder="Enter QR Code / Token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="text-center text-lg tracking-widest "
                                maxLength={40}
                                autoFocus
                            />
                        </div>

                        <Button className="w-full" type="submit" disabled={status === "loading" || !token}>
                            {status === "loading" ? "Verifying..." : "Mark Attendance"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        <p>Make sure you are connected to the campus Wi-Fi.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
