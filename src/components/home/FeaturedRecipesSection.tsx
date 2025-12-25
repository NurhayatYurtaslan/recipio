'use client';

import { useTranslations } from 'next-intl';
import { RecipeList } from '@/components/recipe/RecipeList';
import type { PublicRecipeCard } from '@/lib/db/public';

interface FeaturedRecipesSectionProps {
    initialRecipes: PublicRecipeCard[];
    locale: string;
}

export function FeaturedRecipesSection({ initialRecipes, locale }: FeaturedRecipesSectionProps) {
    const t = useTranslations('HomePage');
    
    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold mb-8">{t('featuredRecipes')}</h2>
            <RecipeList initialRecipes={initialRecipes} locale={locale} />
        </section>
    );
}

