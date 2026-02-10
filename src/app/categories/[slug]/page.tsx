import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import { RecipeList } from '@/components/recipe/RecipeList';
import { getCategoryBySlug, getAllPublicRecipes } from '@/lib/db/public';
import { getCategorySlugsForBuild } from '@/lib/db/public-build';
import type { Metadata } from 'next';

interface CategoryPageProps {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    const slugs = await getCategorySlugsForBuild();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const locale = await getLocale();
    const category = await getCategoryBySlug(params.slug, locale);

    if (!category) {
        return {
            title: 'Category Not Found - Recipio',
        };
    }

    return {
        title: `${category.name} - Recipio`,
        description: category.description || `${category.name} recipes from Recipio`,
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const locale = await getLocale();
    const category = await getCategoryBySlug(params.slug, locale);

    if (!category) {
        notFound();
    }

    // Fetch initial recipes for this category
    const initialRecipes = await getAllPublicRecipes({
        category: params.slug,
        limit: 20,
    });

    return (
        <Providers>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <CategoryHeader category={category} locale={locale} />
                        <div className="mt-8">
                            <RecipeList
                                initialRecipes={initialRecipes}
                                category={params.slug}
                                locale={locale}
                            />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </Providers>
    );
}
