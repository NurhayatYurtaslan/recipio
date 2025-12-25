'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChefHat, Search } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
    const t = useTranslations('Header');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <ChefHat className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent hidden sm:inline">
                            Recipio
                        </span>
                    </Link>

                    {/* Search - Center */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={t('search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 h-10 w-full bg-muted/50 border-0 focus-visible:ring-1"
                            />
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <nav className="hidden md:flex items-center">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/recipes">
                                    {t('recipes')}
                                </Link>
                            </Button>
                        </nav>
                        <LanguageSwitcher />
                        <Button variant="default" size="sm" asChild>
                            <Link href="/login">
                                {t('login')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
