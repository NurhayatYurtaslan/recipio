'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/browser';
import { RecipeCard } from './RecipeCard';
import type { PublicRecipeCard } from '@/lib/db/public';
import { Card } from '@/components/ui/card';

interface RecipeListProps {
    initialRecipes?: PublicRecipeCard[];
    category?: string;
    search?: string;
    locale?: string;
}

export function RecipeList({ initialRecipes = [], category, search, locale = 'tr' }: RecipeListProps) {
    const t = useTranslations('HomePage');
    const tCategory = useTranslations('CategoryPage');
    const [recipes, setRecipes] = useState<PublicRecipeCard[]>(initialRecipes);
    const [loading, setLoading] = useState(!initialRecipes.length);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            setError(null);

            try {
                const supabase = createClient();
                let query = supabase
                    .from('v_public_recipe_cards')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (category) {
                    query = query.eq('category_slug', category);
                }

                if (search) {
                    // Search in both English and Turkish title fields
                    query = query.or(`title_en.ilike.%${search}%,title_tr.ilike.%${search}%`);
                }

                const { data, error: fetchError } = await query;

                if (fetchError) {
                    throw fetchError;
                }

                setRecipes(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
                console.error('Error fetching recipes:', err);
            } finally {
                setLoading(false);
            }
        };

        if (!initialRecipes.length || category || search) {
            fetchRecipes();
        }
    }, [category, search, initialRecipes.length]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-full">
                        <div className="aspect-[4/3] bg-muted animate-pulse" />
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    if (recipes.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">
                    {category ? tCategory('noRecipes') : t('noRecipesFound')}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
                <RecipeCard key={recipe.recipe_id} recipe={recipe} locale={locale} />
            ))}
        </div>
    );
}

