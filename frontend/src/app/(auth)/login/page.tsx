"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", { email, password });
            const token = response.data;

            const payload = JSON.parse(atob(token.split('.')[1]));
            const rawRole = payload.roles || payload.role || payload.authorities?.[0]?.authority || "STUDENT";
            // Normalize: always store with ROLE_ prefix
            const role = rawRole.startsWith("ROLE_") ? rawRole : `ROLE_${rawRole}`;
            console.log("User role:", role);
            login(token, role, email);
        } catch (err: any) {
            console.error("Login error:", err);
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
                    <p className="text-muted-foreground">
                        Sign in to your account to continue
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="h-12 bg-white/50 focus:bg-white transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign in"}
                            </Button>
                        </CardContent>
                        <CardFooter className="justify-center border-t border-border/50 pt-6 pb-6 bg-muted/20 rounded-b-xl">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                                    Create one
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
