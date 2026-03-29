"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { QrCode, ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";

export default function StudentScanPage() {
    const [token, setToken] = useState("");
    const [status, setStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const [message, setMessage] = useState("");
    const router = useRouter();

    // ✅ Scanner state
    const [showScanner, setShowScanner] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // ✅ Scanner logic (FIXED)
    useEffect(() => {
        if (showScanner) {
            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;

            scanner
                .start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: 250 },
                    async (decodedText) => {
                        setToken(decodedText);

                        await handleScanAuto(decodedText);

                        // ✅ SAFE STOP
                        if (scannerRef.current && isScanning) {
                            await scannerRef.current.stop().catch(() => { });
                            setIsScanning(false);
                        }

                        setShowScanner(false);
                    },
                    () => { }
                )
                .then(() => {
                    setIsScanning(true);
                })
                .catch(() => {
                    setIsScanning(false);
                });
        }

        return () => {
            // ✅ CLEANUP SAFE STOP
            if (scannerRef.current && isScanning) {
                scannerRef.current.stop().catch(() => { });
                setIsScanning(false);
            }
        };
    }, [showScanner]);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        await handleScanAuto(token);
    };

    // ✅ API logic
    const handleScanAuto = async (scanToken: string) => {
        setStatus("loading");
        setMessage("");

        try {
            const res = await api.post("/student/scan", { token: scanToken });
            setStatus("success");
            setMessage(res.data || "Attendance marked successfully!");

            setTimeout(() => {
                router.push("/student");
            }, 2000);
        } catch (err: any) {
            setStatus("error");
            setMessage(
                err.response?.data?.message ||
                err.response?.data ||
                "Invalid QR Code or Expired"
            );
        }
    };

    return (
        <div className="max-w-md mx-auto py-8">
            <Link
                href="/student"
                className="flex items-center text-sm text-gray-500 hover:text-primary mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Link>

            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <QrCode className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Scan Attendance</CardTitle>
                    <CardDescription>
                        Enter the code OR scan QR to mark your attendance.
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
                                className="text-center text-lg tracking-widest"
                                maxLength={40}
                                autoFocus
                            />
                        </div>

                        <Button
                            className="w-full"
                            type="submit"
                            disabled={status === "loading" || !token}
                        >
                            {status === "loading"
                                ? "Verifying..."
                                : "Mark Attendance"}
                        </Button>

                        {/* ✅ SCAN BUTTON */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full flex items-center gap-2"
                            onClick={() => setShowScanner(true)}
                        >
                            <Camera className="h-4 w-4" />
                            Scan QR with Camera
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        <p>Make sure you are connected to the campus Wi-Fi.</p>
                    </div>
                </CardContent>
            </Card>

            {/* ✅ SCANNER MODAL */}
            {showScanner && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-xl w-[320px] shadow-xl">
                        <h2 className="text-lg font-semibold mb-3 text-center">
                            Scan QR Code
                        </h2>

                        <div id="qr-reader" className="w-full" />

                        <Button
                            className="mt-4 w-full"
                            onClick={async () => {
                                // ✅ SAFE CLOSEs
                                if (scannerRef.current && isScanning) {
                                    await scannerRef.current
                                        .stop()
                                        .catch(() => { });
                                    setIsScanning(false);
                                }
                                setShowScanner(false);
                            }}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}