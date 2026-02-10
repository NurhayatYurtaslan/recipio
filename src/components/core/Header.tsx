'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChefHat, Search, User, LogOut } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
                            <Link href="/recipes">
                                <Button variant="ghost" size="sm">
                                    {t('recipes')}
                                </Button>
                            </Link>
                        </nav>
                        <ThemeToggle />
                        <LanguageSwitcher />
                        {user ? (
                            <>
                                <Link href="/home">
                                    <Button variant="ghost" size="sm" className="gap-1.5">
                                        <User className="h-4 w-4" />
                                        <span className="hidden sm:inline max-w-[120px] truncate" title={displayName}>
                                            {displayName}
                                        </span>
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('logout')}</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        {t('login')}
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button variant="default" size="sm">
                                        {t('signUp')}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
