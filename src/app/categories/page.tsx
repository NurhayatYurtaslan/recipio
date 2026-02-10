import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import { CategoryCard } from '@/components/category/CategoryCard';
import { CategoriesDriver } from '@/lib/drivers/categories.driver';
import { Button } from '@/components/ui/button';
import { ChefHat, Grid3x3, ArrowLeft } from 'lucide-react';
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
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        {/* Back to Home Link */}
                        <div className="mb-8">
                            <Link href="/">
                                <Button variant="ghost" className="inline-flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    {t('backToHome')}
                                </Button>
                            </Link>
                        </div>

                        {/* Header Section */}
                        <div className="mb-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                <Grid3x3 className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {t('title')}
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                {t('description', { count: pageData.totalCount })}
                            </p>
                        </div>

                        {/* Categories Grid */}
                        {pageData.categories.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {pageData.categories.map((category) => (
                                    <CategoryCard
                                        key={category.id}
                                        category={category}
                                        variant="large"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-lg text-muted-foreground">
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
