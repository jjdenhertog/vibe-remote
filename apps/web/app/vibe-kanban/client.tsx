"use client";

type VibeKanbanClientProps = {
    readonly vibeKanbanUrl: string;
}

export default function VibeKanbanClient({ vibeKanbanUrl }: VibeKanbanClientProps) {
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