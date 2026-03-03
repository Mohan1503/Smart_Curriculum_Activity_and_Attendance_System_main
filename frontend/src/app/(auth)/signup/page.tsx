"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/auth/signup", { email, password, role });
            // Redirect to login after generic success
            router.push("/login?registered=true");
        } catch (err: any) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
                    <p className="text-muted-foreground">
                        Get started with SmartTrack today
                    </p>
                </div>

                <Card className="border-border/60 shadow-xl shadow-primary/5 bg-card/80 backdrop-blur-sm">
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5 pt-8 px-8">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-sm font-medium text-destructive border border-destructive/20 flex items-center gap-2">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@institution.edu"
                                    className="h-12 bg-white/50 focus:bg-white transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Create a strong password"
                                    className="h-12 bg-white/50 focus:bg-white transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">I am a</Label>
                                <div className="relative">
                                    <select
                                        id="role"
                                        className="flex h-12 w-full rounded-lg border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all cursor-pointer hover:bg-white"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="STUDENT">Student</option>
                                        <option value="FACULTY">Faculty</option>
                                        <option value="DEO">Department Admin</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none opacity-50">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create account"}
                            </Button>
                        </CardContent>
                        <CardFooter className="justify-center border-t border-border/50 pt-6 pb-6 bg-muted/20 rounded-b-xl">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
