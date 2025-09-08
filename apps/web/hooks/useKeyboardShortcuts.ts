'use client';

import { useEffect } from 'react';

type ShortcutCallback = () => void;
type Shortcuts = Record<string, ShortcutCallback>;

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const { ctrlKey, metaKey, shiftKey, key } = event;
      
            // Build shortcut string
            const parts: string[] = [];
            if (ctrlKey) parts.push('Ctrl');

            if (metaKey) parts.push('Cmd');

            if (shiftKey) parts.push('Shift');

            parts.push(key);
      
            const shortcut = parts.join('+');
      
            // Check for matching shortcuts
            for (const [pattern, callback] of Object.entries(shortcuts)) {
                if (pattern === shortcut) {
                    event.preventDefault();
                    callback();

                    return;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}