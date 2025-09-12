import Link from "next/link";
import { unstable_noStore as noStore } from 'next/cache';
import NavClient from './NavClient';

export default function TopNavigation() {
    // Force dynamic rendering to read runtime environment variables
    noStore();
    
    // Access environment variable on the server at runtime
    const vibeKanbanUrl = process.env.VIBE_KANBAN_URL || null;
    
    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
                <div className="container mx-auto px-6">
                    <div className="flex items-center h-16">
                        {/* Logo positioned absolutely to the far left */}
                        <div className="absolute left-6">
                            <Link 
                                href="/"
                                className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Vibe 🤮 Remote 🚀
                            </Link>
                        </div>
                        
                        {/* Centered navigation */}
                        <div className="flex-1 flex items-center justify-center">
                            <NavClient vibeKanbanUrl={vibeKanbanUrl} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}