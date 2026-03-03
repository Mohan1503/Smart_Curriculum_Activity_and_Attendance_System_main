"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
    sub: string; // email (from JWT standard or custom payload)
    role: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string, role: string, email: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");
        const storedEmail = localStorage.getItem("email");

        if (storedToken && storedRole && storedEmail) {
            setToken(storedToken);
            setUser({ sub: storedEmail, role: storedRole });
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, role: string, email: string) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", role);
        localStorage.setItem("email", email);
        setToken(newToken);
        setUser({ sub: email, role });

        // Redirect based on role (handle both prefixed and unprefixed)
        const normalizedRole = role.replace("ROLE_", "");
        switch (normalizedRole) {
            case "ADMIN":
                router.push("/admin");
                break;
            case "FACULTY":
                router.push("/faculty");
                break;
            case "STUDENT":
                router.push("/student");
                break;
            case "DEPT_ADMIN":
            case "DEO":
                router.push("/deo");
                break;
            default:
                router.push("/");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
