'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';
import { useClientLocale } from '@/components/i18n/ClientLocaleProvider';

export default function LanguageSwitcher() {
    const { locale, setLocale } = useClientLocale();
    const [switching, setSwitching] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value as 'tr' | 'en';
        if (nextLocale === locale) return;
        setSwitching(true);
        setLocale(nextLocale);
        setSwitching(false);
    };

    return (
        <div className="relative">
            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select
                value={locale}
                onChange={handleChange}
                disabled={switching}
                aria-label="Language"
                className="pl-9 pr-4 py-2 text-sm rounded-md border bg-transparent appearance-none cursor-pointer disabled:opacity-70"
            >
                <option value="tr">🇹🇷 TR</option>
                <option value="en">🇬🇧 EN</option>
            </select>
        </div>
    );
}
