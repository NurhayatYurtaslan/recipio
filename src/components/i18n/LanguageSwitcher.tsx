'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next-intl/client';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <div className="relative">
            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select
                defaultValue={locale}
                onChange={handleChange}
                className="pl-9 pr-4 py-2 text-sm rounded-md border bg-transparent appearance-none"
            >
                <option value="en">EN</option>
                <option value="tr">TR</option>
            </select>
        </div>
    );
}
