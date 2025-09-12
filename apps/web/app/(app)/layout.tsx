import TopNavigation from "@/components/navigation/TopNavigation";

export default function WithNavLayout({
    children,
}: {
    readonly children: React.ReactNode;
}) {
    return (
        <>
            <TopNavigation />
            <main className="min-h-[calc(100vh-4rem)]">
                {children}
            </main>
        </>
    );
}