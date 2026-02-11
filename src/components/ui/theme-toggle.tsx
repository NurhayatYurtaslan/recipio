'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground/50">
                <Sun className="h-3.5 w-3.5" />
            </span>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
        >
            {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5" />
            ) : (
                <Moon className="h-3.5 w-3.5" />
            )}
        </button>
    );
}
