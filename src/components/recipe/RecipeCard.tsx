'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, UtensilsCrossed } from 'lucide-react';
import type { PublicRecipeCard } from '@/lib/db/public';

interface RecipeCardProps {
    recipe: PublicRecipeCard;
    locale?: string;
}

function ImageFallback() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-orange-400">
            <UtensilsCrossed className="h-12 w-12 mb-2" />
            <span className="text-xs text-orange-300">Görsel yok</span>
        </div>
    );
}

export function RecipeCard({ recipe, locale = 'en' }: RecipeCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <Link href={`/recipes/${recipe.recipe_id}`}>
            <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                    {recipe.cover_image_url && !imageError ? (
                        <Image
                            src={recipe.cover_image_url}
                            alt={recipe.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <ImageFallback />
                    )}
                    {recipe.category_slug && (
                        <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                                {recipe.category_slug}
                            </Badge>
                        </div>
                    )}
                </div>
                <CardContent className="flex-1 p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {recipe.title}
                    </h3>
                    {recipe.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {recipe.description}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{recipe.view_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{recipe.favorite_count}</span>
                    </div>
                    {recipe.comment_count > 0 && (
                        <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{recipe.comment_count}</span>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </Link>
    );
}

