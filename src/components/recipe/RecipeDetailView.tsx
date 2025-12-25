'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { 
    ArrowLeft, 
    Users, 
    Heart, 
    Bookmark, 
    Share2, 
    Eye,
    MessageCircle,
    ChefHat,
    CheckCircle2,
    UtensilsCrossed,
    Lightbulb,
    ShoppingBasket,
    ListOrdered
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecipeDetail } from '@/lib/db/recipe-helpers';
import { getLocalizedRecipeData, getIngredientsForServings } from '@/lib/db/recipe-helpers';

interface RecipeDetailViewProps {
    recipe: RecipeDetail;
    locale: string;
}

export function RecipeDetailView({ recipe, locale }: RecipeDetailViewProps) {
    const t = useTranslations('RecipeDetail');
    const localized = getLocalizedRecipeData(recipe, locale);
    
    const availableServings = recipe.available_servings || [1, 2, 3, 4];
    const [selectedServings, setSelectedServings] = useState(availableServings[0] || 1);
    const [imageError, setImageError] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const ingredients = getIngredientsForServings(recipe, selectedServings, locale);
    const steps = localized.steps || [];

    const toggleStep = (stepNumber: number) => {
        setCompletedSteps(prev => 
            prev.includes(stepNumber) 
                ? prev.filter(s => s !== stepNumber)
                : [...prev, stepNumber]
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden">
                <div className="absolute inset-0">
                    {recipe.cover_image_url && !imageError ? (
                        <Image
                            src={recipe.cover_image_url}
                            alt={localized.title || 'Recipe'}
                            fill
                            className="object-cover"
                            priority
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center">
                            <UtensilsCrossed className="h-32 w-32 text-white/30" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="container mx-auto max-w-6xl">
                        {/* Back Button */}
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>{t('backToRecipes')}</span>
                        </Link>

                        {/* Category Badge */}
                        {localized.categoryName && (
                            <div className="mb-3">
                                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 px-3 py-1">
                                    {localized.categoryName}
                                </Badge>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg max-w-3xl leading-tight">
                            {localized.title}
                        </h1>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                                <Eye className="h-4 w-4" />
                                <span>{recipe.view_count}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                                <Heart className="h-4 w-4" />
                                <span>{recipe.favorite_count}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                                <MessageCircle className="h-4 w-4" />
                                <span>{recipe.comment_count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        {localized.description && (
                            <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                                <CardContent className="pt-6">
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {localized.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Instructions */}
                        <Card className="border-0 shadow-md bg-white dark:bg-slate-800">
                            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <ListOrdered className="h-5 w-5 text-primary" />
                                    </div>
                                    {t('instructions')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {steps.length > 0 ? (
                                    <>
                                        <ol className="space-y-4">
                                            {steps.map((step) => (
                                                <li 
                                                    key={step.step_number}
                                                    className={`flex gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer border-2 ${
                                                        completedSteps.includes(step.step_number)
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                                                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600'
                                                    }`}
                                                    onClick={() => toggleStep(step.step_number)}
                                                >
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                                                        completedSteps.includes(step.step_number)
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                            : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md'
                                                    }`}>
                                                        {completedSteps.includes(step.step_number) ? (
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        ) : (
                                                            step.step_number
                                                        )}
                                                    </div>
                                                    <p className={`text-base leading-relaxed pt-2 flex-1 ${
                                                        completedSteps.includes(step.step_number)
                                                            ? 'text-muted-foreground line-through decoration-emerald-500 decoration-2'
                                                            : ''
                                                    }`}>
                                                        {step.text}
                                                    </p>
                                                </li>
                                            ))}
                                        </ol>

                                        {/* Progress Bar */}
                                        <div className="mt-8 pt-6 border-t">
                                            <div className="flex items-center justify-between text-sm mb-3">
                                                <span className="text-muted-foreground font-medium">{t('progress')}</span>
                                                <span className="font-bold text-primary">
                                                    {completedSteps.length} / {steps.length}
                                                </span>
                                            </div>
                                            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 ease-out rounded-full"
                                                    style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                                                />
                                            </div>
                                            {completedSteps.length === steps.length && steps.length > 0 && (
                                                <p className="text-center mt-4 text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                    {t('allStepsCompleted')}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>{t('noSteps')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tips */}
                        {localized.tips && (
                            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                                            <Lightbulb className="h-5 w-5" />
                                        </div>
                                        {t('tips')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-amber-900 dark:text-amber-100 leading-relaxed">
                                        {localized.tips}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Ingredients Sidebar */}
                    <div className="space-y-6">
                        <div className="lg:sticky lg:top-24">
                            {/* Ingredients Card */}
                            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 overflow-hidden">
                                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <ShoppingBasket className="h-5 w-5 text-primary" />
                                        </div>
                                        {t('ingredients')}
                                    </CardTitle>
                                    
                                    {/* Servings Tab Bar */}
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <Users className="h-4 w-4" />
                                            <span>{t('servings')}</span>
                                        </div>
                                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                                            {availableServings.map((serving) => (
                                                <button
                                                    key={serving}
                                                    onClick={() => setSelectedServings(serving)}
                                                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                                        selectedServings === serving
                                                            ? 'bg-white dark:bg-slate-600 text-primary shadow-md'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    {serving}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-center text-muted-foreground mt-2">
                                            {t('portionLabel', { count: selectedServings })}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {ingredients.length > 0 ? (
                                        <ul className="space-y-1">
                                            {ingredients.map((ingredient, index) => (
                                                <li 
                                                    key={index}
                                                    className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                                >
                                                    <span className="font-medium text-foreground">
                                                        {ingredient.name}
                                                    </span>
                                                    <div className="text-right">
                                                        <span className="text-sm font-semibold text-primary">
                                                            {ingredient.amount} {ingredient.unit}
                                                        </span>
                                                        {ingredient.note && (
                                                            <span className="block text-xs text-muted-foreground">
                                                                ({ingredient.note})
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <ShoppingBasket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>{t('noIngredients')}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <Button variant="outline" className="flex-col h-auto py-3 gap-1 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/30 dark:hover:text-rose-400">
                                    <Heart className="h-5 w-5" />
                                    <span className="text-xs">{t('favorite')}</span>
                                </Button>
                                <Button variant="outline" className="flex-col h-auto py-3 gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/30 dark:hover:text-blue-400">
                                    <Bookmark className="h-5 w-5" />
                                    <span className="text-xs">{t('save')}</span>
                                </Button>
                                <Button variant="outline" className="flex-col h-auto py-3 gap-1 hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-950/30 dark:hover:text-green-400">
                                    <Share2 className="h-5 w-5" />
                                    <span className="text-xs">{t('share')}</span>
                                </Button>
                            </div>

                            {/* Meta Info */}
                            <p className="text-xs text-muted-foreground text-center mt-6">
                                {t('publishedOn')} {formatDate(recipe.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

