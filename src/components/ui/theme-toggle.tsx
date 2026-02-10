'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="w-9 h-9 p-0" disabled>
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="h-4 w-4 transition-all" />
            ) : (
                <Moon className="h-4 w-4 transition-all" />
            )}
        </Button>
    );
}
