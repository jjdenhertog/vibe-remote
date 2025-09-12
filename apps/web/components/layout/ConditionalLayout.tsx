"use client";

import { usePathname } from "next/navigation";
import TopNavigation from "@/components/navigation/TopNavigation";

type ConditionalLayoutProps = {
    readonly children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const isHomepage = pathname === '/';

    return (
        <>
            {!isHomepage && <TopNavigation />}
            <main className={isHomepage ? "min-h-screen" : "min-h-[calc(100vh-4rem)]"}>
                {children}
            </main>
        </>
    );
}