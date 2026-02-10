'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChefHat } from 'lucide-react';
import type { CategoryInfo } from '@/lib/db/public';

interface CategoryHeaderProps {
    category: CategoryInfo;
    locale: string;
}

export function CategoryHeader({ category, locale }: CategoryHeaderProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">
                    {locale === 'tr' ? 'Ana Sayfa' : 'Home'}
                </Link>
                <span>/</span>
                <Link href="/" className="hover:text-foreground transition-colors">
                    {locale === 'tr' ? 'Kategoriler' : 'Categories'}
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">{category.name}</span>
            </nav>

            {/* Category Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Category Image */}
                {category.categories.image_url && !imageError ? (
                    <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                            src={category.categories.image_url}
                            alt={category.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 192px"
                            onError={() => setImageError(true)}
                        />
                    </div>
                ) : (
                    <div className="w-full md:w-48 h-48 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center flex-shrink-0">
                        <ChefHat className="h-16 w-16 text-emerald-400" />
                    </div>
                )}

                {/* Category Info */}
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="text-muted-foreground text-lg">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
