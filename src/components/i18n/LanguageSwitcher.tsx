'use client';

import { useRef, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useClientLocale } from '@/components/i18n/ClientLocaleProvider';

const LOCALES = [
    { value: 'tr' as const, label: 'TR' },
    { value: 'en' as const, label: 'EN' },
] as const;

export default function LanguageSwitcher() {
    const { locale } = useClientLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

    const handleLocaleSelect = (value: (typeof LOCALES)[number]['value']) => {
        if (value === locale) {
            setOpen(false);
            return;
        }
        setOpen(false);
        const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const isLocaleSwitching = pathname?.includes('/locale-switching');
        const next = pathname && pathname !== '/' && !isLocaleSwitching ? pathname : '/';
        const url = `${base}/locale-switching?locale=${value}&next=${encodeURIComponent(next)}`;
        router.push(url);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-label="Language"
                className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
                {current.label}
                <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <ul
                    role="listbox"
                    className="absolute right-0 top-full z-50 mt-1 min-w-[72px] rounded-md border border-border/60 bg-background py-1 shadow-md"
                >
                    {LOCALES.map(({ value, label }) => (
                        <li key={value} role="option" aria-selected={locale === value}>
                            <button
                                type="button"
                                onClick={() => handleLocaleSelect(value)}
                                className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted/50 ${
                                    locale === value ? 'font-medium text-foreground bg-muted/30' : 'text-muted-foreground'
                                }`}
                            >
                                {label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
