"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Brain, Cog, Kanban } from "lucide-react";
import { useCallback } from "react";

type NavItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        href: "/ai-context",
        label: "AI Context",
        icon: <Brain className="w-5 h-5" />
    },
    {
        href: "/automations",
        label: "Automations", 
        icon: <Cog className="w-5 h-5" />
    },
    {
        href: "/vibe-kanban",
        label: "Vibe Kanban",
        icon: <Kanban className="w-5 h-5" />
    }
];

export default function TopNavigation() {
    const pathname = usePathname();
    
    const isActive = useCallback((href: string) => {
        return pathname === href;
    }, [pathname]);
    
    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link 
                            href="/"
                            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Vibe Remote
                        </Link>
                        
                        <div className="flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                                        ${isActive(item.href)
                                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                        }
                                    `}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}