'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat } from 'lucide-react';

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

function CategoryCard({ category }: { category: Category }) {
    const [imageError, setImageError] = useState(false);

    return (
        <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="relative aspect-square overflow-hidden bg-muted">
                {category.categories.image_url && !imageError ? (
                    <Image
                        src={category.categories.image_url}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-400">
                        <ChefHat className="h-8 w-8 mb-1" />
                        <span className="text-xs text-emerald-300">{category.name}</span>
                    </div>
                )}
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-center group-hover:text-primary transition-colors">
                    {category.name}
                </h3>
            </CardContent>
        </Card>
    );
}

export function CategorySection({ categories, locale }: CategorySectionProps) {
    const t = useTranslations('HomePage');
    
    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold mb-8">{t('browseByCategory')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                    <Link
                        key={category.category_id}
                        href={`/categories/${category.categories.slug}`}
                    >
                        <CategoryCard category={category} />
                    </Link>
                ))}
            </div>
        </section>
    );
}

