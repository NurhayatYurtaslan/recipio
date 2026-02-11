import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import { CategoryCard } from '@/components/category/CategoryCard';
import { CategoriesDriver } from '@/lib/drivers/categories.driver';
import { ChefHat, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const t = await getTranslations('CategoriesPage');

    return {
        title: t('title') + ' - Recipio',
        description: t('description', { count: 0 }),
    };
}

export default async function CategoriesPage() {
    const locale = await getLocale();
    const t = await getTranslations('CategoriesPage');
    const pageData = await CategoriesDriver.getCategoriesPageData(locale);

    return (
        <Providers>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                        >
                            <ArrowLeft className="h-4 w-4 shrink-0" />
                            {t('backToHome')}
                        </Link>

                        <header className="mb-8">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {t('title')}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t('description', { count: pageData.totalCount })}
                            </p>
                        </header>

                        {pageData.categories.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {pageData.categories.map((category) => (
                                    <CategoryCard
                                        key={category.id}
                                        category={category}
                                        variant="large"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <ChefHat className="h-12 w-12 text-muted-foreground/60 mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    {t('noCategories')}
                                </p>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </Providers>
    );
}
