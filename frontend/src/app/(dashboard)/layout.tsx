export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative bg-slate-50 min-h-screen">
            {children}
        </div>
    );
}
