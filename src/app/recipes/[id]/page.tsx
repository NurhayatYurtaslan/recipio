import { notFound } from 'next/navigation';
import { getRecipeDetail, getAllPublicRecipes } from '@/lib/db/public';
import { getLocalizedRecipeData } from '@/lib/db/recipe-helpers';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import { RecipeDetailView } from '@/components/recipe/RecipeDetailView';
import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';

interface RecipePageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    const recipes = await getAllPublicRecipes({ limit: 500 });
    return recipes.map((r) => ({ id: String(r.recipe_id) }));
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
    const { id } = await params;
    const locale = await getLocale();
    const recipe = await getRecipeDetail(parseInt(id));
    
    if (!recipe) {
        return {
            title: 'Recipe Not Found - Recipio',
        };
    }
    
    const localized = getLocalizedRecipeData(recipe, locale);
    
    return {
        title: localized.seoTitle || `${localized.title} - Recipio`,
        description: localized.seoDescription || localized.description || undefined,
        openGraph: {
            title: localized.title || 'Recipe',
            description: localized.description || undefined,
            images: recipe.cover_image_url ? [recipe.cover_image_url] : undefined,
        },
    };
}

export default async function RecipePage({ params }: RecipePageProps) {
    const { id } = await params;
    const locale = await getLocale();
    const recipe = await getRecipeDetail(parseInt(id));
    
    if (!recipe) {
        notFound();
    }

    return (
        <Providers>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <RecipeDetailView recipe={recipe} locale={locale} />
                </main>
                <Footer />
            </div>
        </Providers>
    );
}

