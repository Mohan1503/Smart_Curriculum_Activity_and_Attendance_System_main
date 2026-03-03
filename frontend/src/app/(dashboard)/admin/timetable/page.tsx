"use client";

import { AllTimetablesView } from "@/components/AllTimetablesView";
import { motion } from "framer-motion";

export default function AdminTimetablePage() {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    All Timetables<span className="text-primary">.</span>
                </h1>
                <p className="text-muted-foreground mt-1">View timetables for any department and section across the institution.</p>
            </div>
            <AllTimetablesView userRole="ADMIN" />
        </motion.div>
    );
}
