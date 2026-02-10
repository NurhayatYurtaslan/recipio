'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import { RecipeList } from '@/components/recipe/RecipeList';
import { Search } from 'lucide-react';
import { useLocale } from 'next-intl';

function RecipesContent() {
    const locale = useLocale();
    const searchParams = useSearchParams();
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    return (
        <>
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
                                    ? `"${search}" için arama sonuçları`
                                    : `Search results for "${search}"`}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <RecipeList
                initialRecipes={[]}
                search={search || undefined}
                category={category || undefined}
                locale={locale}
            />
        </>
    );
}

export default function RecipesPage() {
    return (
        <Providers>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <Suspense fallback={<RecipeList initialRecipes={[]} locale="en" />}>
                            <RecipesContent />
                        </Suspense>
                    </div>
                </main>
                <Footer />
            </div>
        </Providers>
    );
}
