'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CategoryCard } from '@/components/category/CategoryCard';
import { transformCategoryToCardData, type CategoryCardData } from '@/lib/utils/category-helpers';
import { ChevronRight } from 'lucide-react';

interface Category {
    category_id: number;
    locale: string;
    name: string;
    description: string | null;
    categories: {
        slug: string;
        image_url: string | null;
    };
}

interface CategorySectionProps {
    categories: Category[];
    locale: string;
}

export function CategorySection({ categories, locale }: CategorySectionProps) {
    const t = useTranslations('HomePage');
    const tCategories = useTranslations('CategoriesPage');
    
    if (categories.length === 0) {
        return null;
    }

    // Transform to card data and show only first 4 categories
    const cardData: CategoryCardData[] = transformCategoryToCardData(categories);
    const featuredCategories = cardData.slice(0, 4);
    const hasMoreCategories = categories.length > 4;

    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-semibold">{t('browseByCategory')}</h2>
                {hasMoreCategories && (
                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {tCategories('viewAllCategories')}
                        <ChevronRight className="h-4 w-4 shrink-0" />
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {featuredCategories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        variant="default"
                    />
                ))}
            </div>
        </section>
    );
}

