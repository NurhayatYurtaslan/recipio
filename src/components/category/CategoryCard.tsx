'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, ArrowRight } from 'lucide-react';
import type { CategoryCardData } from '@/lib/utils/category-helpers';

interface CategoryCardProps {
    category: CategoryCardData;
    variant?: 'default' | 'large' | 'featured';
}

export function CategoryCard({ category, variant = 'default' }: CategoryCardProps) {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const sizeClasses = {
        default: 'aspect-square',
        large: 'aspect-[4/3]',
        featured: 'aspect-[3/2]',
    };

    const cardClasses = {
        default: 'group hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer border border-border/50 hover:border-border',
        large: 'group hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer border border-border/60 hover:border-border hover:shadow-lg',
        featured: 'group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border-2 hover:border-primary/50',
    };

    return (
        <Link href={category.href} className="block h-full">
            <Card
                className={cardClasses[variant]}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={`relative ${sizeClasses[variant]} overflow-hidden ${variant === 'default' ? 'bg-muted/30' : variant === 'large' ? 'bg-muted/40' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950'}`}>
                    {category.imageUrl && !imageError ? (
                        <Image
                            src={category.imageUrl}
                            alt={category.name}
                            fill
                            className={`object-cover transition-transform duration-500 ${
                                isHovered && variant !== 'default' ? 'scale-110' : 'scale-100'
                            } ${variant === 'default' ? 'opacity-90' : ''}`}
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className={`w-full h-full flex flex-col items-center justify-center ${variant === 'default' ? 'bg-muted/50' : variant === 'large' ? 'bg-muted/50' : 'bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900'}`}>
                            <ChefHat className={`${variant === 'large' ? 'h-14 w-14' : variant === 'default' ? 'h-8 w-8' : 'h-12 w-12'} mb-2 ${variant === 'default' || variant === 'large' ? 'text-muted-foreground' : 'text-emerald-500 dark:text-emerald-400'} transition-transform duration-300 ${isHovered && variant === 'featured' ? 'scale-110 rotate-12' : ''}`} />
                            {variant !== 'default' && (
                                <span className={`${variant === 'large' ? 'text-base' : 'text-sm'} font-medium ${variant === 'large' ? 'text-foreground' : 'text-emerald-700 dark:text-emerald-300'}`}>
                                    {category.name}
                                </span>
                            )}
                        </div>
                    )}
                    {/* Overlay gradient on hover - only for non-default variants */}
                    {variant !== 'default' && (
                        <div
                            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 transition-opacity duration-300 ${
                                isHovered ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                    )}
                </div>
                <CardContent className={`${variant === 'large' ? 'p-4' : variant === 'default' ? 'p-3' : 'p-4'} relative`}>
                    {variant === 'default' ? (
                        <div className="text-center">
                            <h3 className="text-sm font-medium text-center group-hover:text-primary transition-colors duration-300">
                                {category.name}
                            </h3>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <h3 className={`${variant === 'large' ? 'text-base font-semibold' : 'text-base font-bold'} mb-0.5 group-hover:text-primary transition-colors duration-200`}>
                                    {category.name}
                                </h3>
                                {category.description && variant === 'large' && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                        {category.description}
                                    </p>
                                )}
                            </div>
                            <ArrowRight
                                className={`h-4 w-4 shrink-0 text-muted-foreground transition-all duration-200 ${
                                    isHovered ? 'translate-x-0.5 opacity-100' : 'translate-x-0 opacity-60'
                                }`}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
