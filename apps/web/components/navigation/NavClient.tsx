"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Brain, Cog } from "lucide-react";
import { useCallback } from "react";
import KanbanButton from './KanbanButton';

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
    }
];

type NavClientProps = {
    readonly vibeKanbanUrl: string | null;
}

export default function NavClient({ vibeKanbanUrl }: NavClientProps) {
    const pathname = usePathname();
    
    const isActive = useCallback((href: string) => {
        return pathname === href;
    }, [pathname]);

    return (
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
            <KanbanButton vibeKanbanUrl={vibeKanbanUrl} />
        </div>
    );
}