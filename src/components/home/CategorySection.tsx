'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/category/CategoryCard';
import { transformCategoryToCardData, type CategoryCardData } from '@/lib/utils/category-helpers';
import { ArrowRight } from 'lucide-react';

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
            <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t('browseByCategory')}</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {featuredCategories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        variant="default"
                    />
                ))}
            </div>

            {hasMoreCategories && (
                <div className="text-center">
                    <Link href="/categories">
                        <Button variant="outline" className="inline-flex items-center gap-2 px-6 py-2">
                            {tCategories('viewAllCategories')}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )}
        </section>
    );
}

