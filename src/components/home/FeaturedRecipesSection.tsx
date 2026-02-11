'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { UtensilsCrossed } from 'lucide-react';
import type { PublicRecipeCard } from '@/lib/db/public';

export interface CategoryLabel {
    slug: string;
    name: string;
}

interface FeaturedRecipesSectionProps {
    initialRecipes: PublicRecipeCard[];
    locale: string;
    categoryNames?: CategoryLabel[];
}

/** Minimal accent per category slug – left border + optional label tint */
const CATEGORY_ACCENT: Record<string, string> = {
    soups: 'border-l-amber-500/40',
    desserts: 'border-l-rose-500/40',
    salads: 'border-l-emerald-500/40',
    'main-dishes': 'border-l-sky-500/40',
    drinks: 'border-l-violet-500/40',
};

function getAccent(slug: string): string {
    return CATEGORY_ACCENT[slug] ?? 'border-l-border';
}

function getTitle(recipe: PublicRecipeCard, locale: string): string {
    const isTr = locale === 'tr';
    return (
        (isTr ? recipe.title_tr ?? recipe.title_en : recipe.title_en ?? recipe.title_tr) ??
        recipe.title ??
        ''
    );
}

function getDescription(recipe: PublicRecipeCard, locale: string): string | null {
    const isTr = locale === 'tr';
    return (
        (isTr ? recipe.description_tr ?? recipe.description_en : recipe.description_en ?? recipe.description_tr) ??
        recipe.description
    );
}

/** Minimal list row – category-standard layout */
function RecipeRow({
    recipe,
    locale,
}: {
    recipe: PublicRecipeCard;
    locale: string;
}) {
    const [imgErr, setImgErr] = useState(false);
    const title = getTitle(recipe, locale);
    const desc = getDescription(recipe, locale);
    return (
        <Link
            href={`/recipes/${recipe.recipe_id}`}
            className="flex gap-3 py-2.5 px-1 -mx-1 rounded-md hover:bg-muted/40 transition-colors"
        >
            <div className="relative shrink-0 w-11 h-11 rounded-md overflow-hidden bg-muted/80">
                {recipe.cover_image_url && !imgErr ? (
                    <Image
                        src={recipe.cover_image_url}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="44px"
                        onError={() => setImgErr(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                        <UtensilsCrossed className="h-4 w-4" />
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground line-clamp-1">{title}</p>
                {desc && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{desc}</p>
                )}
            </div>
        </Link>
    );
}

export function FeaturedRecipesSection({
    initialRecipes,
    locale,
    categoryNames = [],
}: FeaturedRecipesSectionProps) {
    const t = useTranslations('HomePage');

    const slugToName = (slug: string) =>
        categoryNames.find((c) => c.slug === slug)?.name ?? slug;

    const grouped = new Map<string, PublicRecipeCard[]>();
    for (const r of initialRecipes) {
        const key = r.category_slug ?? '_';
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(r);
    }
    const entries = Array.from(grouped.entries());

    if (initialRecipes.length === 0) return null;

    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-sm font-medium text-muted-foreground tracking-tight mb-5">
                {t('featuredRecipes')}
            </h2>
            <div className="space-y-6">
                {entries.map(([slug, recipes]) => {
                    const title = slug === '_' ? t('editorPicks') : slugToName(slug);
                    const accent = getAccent(slug);

                    return (
                        <div
                            key={slug}
                            className={`pl-3 border-l-2 ${accent} rounded-r-sm`}
                        >
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                {title}
                            </p>
                            <div className="space-y-0">
                                {recipes.map((r) => (
                                    <RecipeRow key={r.recipe_id} recipe={r} locale={locale} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
