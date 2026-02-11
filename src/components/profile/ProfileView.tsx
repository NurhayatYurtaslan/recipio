'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useClientLocale } from '@/components/i18n/ClientLocaleProvider';
import { createClient } from '@/lib/supabase/browser';
import { User as UserIcon, UtensilsCrossed } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import type { User } from '@supabase/supabase-js';

interface FavoriteRecipe {
    recipe_id: number;
    title_en: string | null;
    title_tr: string | null;
    description_en: string | null;
    description_tr: string | null;
    cover_image_url: string | null;
    category_slug: string | null;
}

function getTitle(row: FavoriteRecipe, locale: string): string {
    const isTr = locale === 'tr';
    const title = isTr ? (row.title_tr ?? row.title_en) : (row.title_en ?? row.title_tr);
    return title ?? '';
}

export function ProfileView() {
    const t = useTranslations('Profile');
    const { locale } = useClientLocale();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session?.user) {
                router.replace('/login');
                return;
            }
            setUser(session.user);
        });
    }, [router]);

    useEffect(() => {
        if (!user?.id) return;
        const supabase = createClient();
        supabase
            .from('v_user_library')
            .select('recipe_id, title_en, title_tr, description_en, description_tr, cover_image_url, category_slug')
            .eq('user_id', user.id)
            .eq('engagement_type', 'favorite')
            .order('engaged_at', { ascending: false })
            .then(({ data, error }) => {
                // #region agent log
                fetch('http://127.0.0.1:7244/ingest/309d5671-b7b2-4dcc-903e-8fda625e75f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileView.tsx:favoritesFetch',message:'Profile favorites fetch result',data:{user_id:user.id,error:error?.message,code:error?.code,count:Array.isArray(data)?data.length:0},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
                // #endregion
                if (!error) setFavorites((data as FavoriteRecipe[]) ?? []);
                setLoading(false);
            });
    }, [user?.id]);

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <p className="text-sm text-muted-foreground">{t('loading')}</p>
            </div>
        );
    }

    const displayName =
        user.user_metadata?.full_name?.trim() ||
        user.user_metadata?.display_name?.trim() ||
        user.email?.split('@')[0] ||
        user.email ||
        t('displayName');

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
            <h1 className="text-xl font-semibold tracking-tight mb-6">{t('title')}</h1>

            {/* Profile meta */}
            <div className="flex items-center gap-4 pb-6 border-b border-border/60">
                <div className="shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    {user.user_metadata?.avatar_url ? (
                        <Image
                            src={user.user_metadata.avatar_url}
                            alt=""
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <UserIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    {user.email && (
                        <p className="text-xs text-muted-foreground truncate" title={user.email}>
                            {t('signedInAs')}: {user.email}
                        </p>
                    )}
                </div>
            </div>

            {/* Settings */}
            <div className="py-6 border-b border-border/60">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    {t('settings')}
                </h2>
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t('language')}</span>
                        <LanguageSwitcher />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t('theme')}</span>
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Favorites */}
            <div className="pt-6">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    {t('favorites')}
                </h2>
                {loading ? (
                    <p className="text-sm text-muted-foreground">{t('loadingFavorites')}</p>
                ) : favorites.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('noFavorites')}</p>
                ) : (
                    <ul className="space-y-0">
                        {favorites.map((row) => (
                            <li key={row.recipe_id}>
                                <Link
                                    href={`/recipes/${row.recipe_id}`}
                                    className="flex gap-3 py-2.5 px-1 -mx-1 rounded-md hover:bg-muted/40 transition-colors"
                                >
                                    <div className="relative shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted/80">
                                        {row.cover_image_url ? (
                                            <Image
                                                src={row.cover_image_url}
                                                alt={getTitle(row, locale)}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                                                <UtensilsCrossed className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium line-clamp-1">
                                            {getTitle(row, locale)}
                                        </p>
                                        {(row.description_tr ?? row.description_en) && (
                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                {locale === 'tr'
                                                    ? (row.description_tr ?? row.description_en)
                                                    : (row.description_en ?? row.description_tr)}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
