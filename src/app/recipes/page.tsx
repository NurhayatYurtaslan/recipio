import { getLocale } from 'next-intl/server';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import { RecipeList } from '@/components/recipe/RecipeList';
import { getAllPublicRecipes } from '@/lib/db/public';
import { Search } from 'lucide-react';
import type { Metadata } from 'next';

interface RecipesPageProps {
    searchParams: Promise<{ search?: string; category?: string }>;
}

export async function generateMetadata({ searchParams }: RecipesPageProps): Promise<Metadata> {
    const params = await searchParams;
    const locale = await getLocale();
    
    if (params.search) {
        return {
            title: locale === 'tr' 
                ? `"${params.search}" Arama Sonuçları - Recipio`
                : `"${params.search}" Search Results - Recipio`,
            description: locale === 'tr'
                ? `${params.search} için tarif arama sonuçları`
                : `Search results for ${params.search}`,
        };
    }
    
    return {
        title: locale === 'tr' ? 'Tüm Tarifler - Recipio' : 'All Recipes - Recipio',
        description: locale === 'tr' 
            ? 'Tüm tarifleri keşfedin'
            : 'Discover all recipes',
    };
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
    const locale = await getLocale();
    const params = await searchParams;
    const search = params.search || '';
    const category = params.category || '';

    // Fetch initial recipes with search filter
    const initialRecipes = await getAllPublicRecipes({
        search: search || undefined,
        category: category || undefined,
        limit: 20,
    });

    return (
        <Providers>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        {/* Page Header */}
                        {search && (
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                        <Search className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold">
                                            {locale === 'tr' ? 'Arama Sonuçları' : 'Search Results'}
                                        </h1>
                                        <p className="text-muted-foreground mt-1">
                                            {locale === 'tr' 
                                                ? `"${search}" için ${initialRecipes.length} sonuç bulundu`
                                                : `Found ${initialRecipes.length} results for "${search}"`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recipe List */}
                        <RecipeList
                            initialRecipes={initialRecipes}
                            search={search || undefined}
                            category={category || undefined}
                            locale={locale}
                        />
                    </div>
                </main>
                <Footer />
            </div>
        </Providers>
    );
}
