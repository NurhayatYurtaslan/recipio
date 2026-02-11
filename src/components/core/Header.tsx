'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChefHat, Search, User as UserIcon, LogOut } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';

export function Header() {
    const t = useTranslations('Header');
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const displayName =
        user?.user_metadata?.full_name?.trim() ||
        user?.user_metadata?.display_name?.trim() ||
        user?.email?.split('@')[0] ||
        user?.email ||
        t('profile');

    const linkClass =
        'text-sm text-muted-foreground hover:text-foreground transition-colors';

    return (
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center gap-6">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 shrink-0 text-foreground hover:opacity-80 transition-opacity"
                    >
                        <ChefHat className="h-5 w-5 text-muted-foreground" />
                        <span className="text-base font-semibold tracking-tight hidden sm:inline">
                            Recipio
                        </span>
                    </Link>

                    {/* Search */}
                    <form
                        onSubmit={handleSearch}
                        className="flex-1 max-w-xs sm:max-w-sm mx-auto"
                    >
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
                            <input
                                type="search"
                                placeholder={t('search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-8 pl-8 pr-3 rounded-md text-sm bg-muted/40 border-0 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-muted-foreground/20"
                            />
                        </div>
                    </form>

                    {/* Giriş yapmamış: dil + tema header'da; giriş yapmış: ayarlar sadece Profil > Ayarlar */}
                    <div className="flex items-center gap-1 shrink-0">
                        {!user && (
                            <>
                                <ThemeToggle />
                                <LanguageSwitcher />
                                <div className="w-px h-4 bg-border/60 mx-1 hidden sm:block" />
                            </>
                        )}
                        {user ? (
                            <>
                                <Link
                                    href="/profile"
                                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded ${linkClass}`}
                                    title={displayName}
                                >
                                    <UserIcon className="h-4 w-4 shrink-0" />
                                    <span className="hidden sm:inline max-w-[100px] truncate text-sm">
                                        {displayName}
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground transition-colors`}
                                    aria-label={t('logout')}
                                >
                                    <LogOut className="h-4 w-4 shrink-0" />
                                    <span className="hidden sm:inline">{t('logout')}</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className={`px-2 py-1.5 rounded ${linkClass}`}
                            >
                                {t('login')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
