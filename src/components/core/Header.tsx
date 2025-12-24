'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
// import ThemeToggle from '@/components/ui/ThemeToggle'; // Will be created later

export function Header() {
    const t = useTranslations('Header');

    return (
        <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-bold text-primary">
                        Recipio
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        <Link href="/recipes" className="text-sm font-medium hover:text-primary transition-colors">
                            {t('recipes')}
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="search"
                            placeholder={t('search')}
                            className="pl-9 pr-4 py-2 text-sm rounded-md border bg-transparent"
                        />
                    </div>
                    <LanguageSwitcher />
                    {/* <ThemeToggle /> */}
                    <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                        {t('login')}
                    </Link>
                </div>
            </div>
        </header>
    );
}
