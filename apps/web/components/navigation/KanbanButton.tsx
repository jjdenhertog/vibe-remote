"use client";

import { Kanban, ExternalLink } from "lucide-react";
import { useCallback } from "react";

type KanbanButtonProps = {
    readonly vibeKanbanUrl: string | null;
}

export default function KanbanButton({ vibeKanbanUrl }: KanbanButtonProps) {
    const openKanban = useCallback(() => {
        if (vibeKanbanUrl) {
            window.open(vibeKanbanUrl, '_blank', 'noopener,noreferrer');
        }
    }, [vibeKanbanUrl]);

    return (
        <button
            type="button"
            onClick={openKanban}
            disabled={!vibeKanbanUrl}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                vibeKanbanUrl
                    ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                    : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
            }`}
            title={vibeKanbanUrl ? "Open Vibe Kanban" : "Kanban URL not configured"}
        >
            <Kanban className="w-5 h-5" />
            Vibe Kanban
            {!!vibeKanbanUrl && <ExternalLink className="w-3 h-3 opacity-60" />}
        </button>
    );
}