'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const locale = useLocale();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value as 'tr' | 'en';
        document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
        // Reload current page so the next request sends the new cookie and server renders with new locale
        window.location.href = pathname || '/';
    };

    return (
        <div className="relative">
            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select
                value={locale}
                onChange={handleChange}
                className="pl-9 pr-4 py-2 text-sm rounded-md border bg-transparent appearance-none cursor-pointer"
            >
                <option value="tr">🇹🇷 TR</option>
                <option value="en">🇬🇧 EN</option>
            </select>
        </div>
    );
}
