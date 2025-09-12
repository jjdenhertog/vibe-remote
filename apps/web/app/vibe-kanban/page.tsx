"use client";

import { AlertCircle } from "lucide-react";

export default function VibeKanbanPage() {
    // NEXT_PUBLIC_ variables are exposed to the browser automatically
    const vibeKanbanUrl = process.env.NEXT_PUBLIC_VIBE_KANBAN_URL;
    
    if (!vibeKanbanUrl) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md px-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Vibe Kanban Not Configured
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The NEXT_PUBLIC_VIBE_KANBAN_URL environment variable is not configured.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        Please set the environment variable and restart the application.
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
            {/* eslint-disable-next-line react/iframe-missing-sandbox */}
            <iframe
                src={vibeKanbanUrl}
                className="w-full h-full border-0"
                title="Vibe Kanban"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                allow="clipboard-write"
            />
        </div>
    );
}