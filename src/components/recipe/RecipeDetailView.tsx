'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { 
    ArrowLeft, 
    Users, 
    Heart, 
    Share2, 
    Eye,
    MessageCircle,
    ChefHat,
    CheckCircle2,
    Lightbulb,
    ShoppingBasket,
    ListOrdered
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RecipeDetail } from '@/lib/db/recipe-helpers';
import { getLocalizedRecipeData, getIngredientsForServings } from '@/lib/db/recipe-helpers';
import { createClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface RecipeDetailViewProps {
    recipe: RecipeDetail;
    locale: string;
}

export function RecipeDetailView({ recipe, locale }: RecipeDetailViewProps) {
    const t = useTranslations('RecipeDetail');
    const localized = getLocalizedRecipeData(recipe, locale);
    const router = useRouter();
    
    const availableServings = recipe.available_servings || [1, 2, 3, 4];
    const [selectedServings, setSelectedServings] = useState(availableServings[0] || 1);
    const [imageError, setImageError] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    const ingredients = getIngredientsForServings(recipe, selectedServings, locale);
    const steps = localized.steps || [];

    // Reset checked ingredients when servings change
    useEffect(() => {
        setCheckedIngredients(new Set());
    }, [selectedServings]);

    // Load auth user and check if recipe is already favorited
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const authUser = session?.user ?? null;
            setCurrentUser(authUser);

            if (authUser) {
                const { data } = await supabase
                    .from('favorites')
                    .select('recipe_id')
                    .eq('user_id', authUser.id)
                    .eq('recipe_id', recipe.recipe_id);

                if (data && data.length > 0) {
                    setIsFavorite(true);
                }
            }
        });
    }, [recipe.recipe_id]);

    const handleToggleFavorite = async () => {
        if (favoriteLoading) return;

        const supabase = createClient();

        if (!currentUser) {
            router.push('/login');
            return;
        }

        setFavoriteLoading(true);
        try {
            if (isFavorite) {
                const { error: delErr } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', currentUser.id)
                    .eq('recipe_id', recipe.recipe_id);
                // #region agent log
                fetch('http://127.0.0.1:7244/ingest/309d5671-b7b2-4dcc-903e-8fda625e75f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RecipeDetailView.tsx:favoriteDelete',message:'Favorite delete result',data:{recipe_id:recipe.recipe_id,user_id:currentUser.id,error:delErr?.message},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
                // #endregion
                if (!delErr) setIsFavorite(false);
            } else {
                const { data: insData, error: insErr } = await supabase.from('favorites').insert({
                    user_id: currentUser.id,
                    recipe_id: recipe.recipe_id,
                }).select('recipe_id');
                // #region agent log
                fetch('http://127.0.0.1:7244/ingest/309d5671-b7b2-4dcc-903e-8fda625e75f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RecipeDetailView.tsx:favoriteInsert',message:'Favorite insert result',data:{recipe_id:recipe.recipe_id,user_id:currentUser.id,error:insErr?.message,code:insErr?.code,inserted:!!insData?.length},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
                // #endregion
                if (!insErr) setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const title = localized.title || 'Recipe';
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({
                    title,
                    url,
                    text: title,
                });
            } else {
                await navigator.clipboard.writeText(url);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                try {
                    await navigator.clipboard.writeText(url);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                } catch {
                    console.error('Share failed:', err);
                }
            }
        }
    };

    const toggleStep = (stepNumber: number) => {
        setCompletedSteps(prev => 
            prev.includes(stepNumber) 
                ? prev.filter(s => s !== stepNumber)
                : [...prev, stepNumber]
        );
    };

    const toggleIngredient = (index: number) => {
        setCheckedIngredients(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section - Simplified */}
            <div className="border-b bg-card">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>{t('backToRecipes')}</span>
                    </Link>

                    {/* Title and Category */}
                    <div className="space-y-3">
                        {localized.categoryName && (
                            <Badge variant="secondary" className="text-xs">
                                {localized.categoryName}
                            </Badge>
                        )}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            {localized.title}
                        </h1>
                        
                        {/* Simple Stats */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                <span>{recipe.view_count}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Heart className="h-4 w-4" />
                                <span>{recipe.favorite_count}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MessageCircle className="h-4 w-4" />
                                <span>{recipe.comment_count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recipe Image */}
            {recipe.cover_image_url && !imageError && (
                <div className="relative w-full h-[300px] md:h-[400px] bg-muted">
                    <Image
                        src={recipe.cover_image_url}
                        alt={localized.title || 'Recipe'}
                        fill
                        className="object-cover"
                        priority
                        onError={() => setImageError(true)}
                    />
                </div>
            )}

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Description */}
                        {localized.description && (
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-lg">
                                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                                    {localized.description}
                                </p>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-4xl font-semibold flex items-center gap-3">
                                <ListOrdered className="h-6 w-6" />
                                {t('instructions')}
                            </h2>
                            
                            {steps.length > 0 ? (
                                <>
                                    <ol className="space-y-6">
                                        {steps.map((step) => (
                                            <li 
                                                key={step.step_number}
                                                className={`flex gap-6 p-6 rounded-lg transition-colors cursor-pointer ${
                                                    completedSteps.includes(step.step_number)
                                                        ? 'bg-muted/50'
                                                        : 'hover:bg-muted/30'
                                                }`}
                                                onClick={() => toggleStep(step.step_number)}
                                            >
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold ${
                                                    completedSteps.includes(step.step_number)
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-foreground'
                                                }`}>
                                                    {completedSteps.includes(step.step_number) ? (
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    ) : (
                                                        step.step_number
                                                    )}
                                                </div>
                                                <p className={`text-lg md:text-xl leading-relaxed flex-1 pt-1 ${
                                                    completedSteps.includes(step.step_number)
                                                        ? 'text-muted-foreground line-through'
                                                        : ''
                                                }`}>
                                                    {step.text}
                                                </p>
                                            </li>
                                        ))}
                                    </ol>

                                    {/* Simple Progress */}
                                    {steps.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">{t('progress')}</span>
                                                <span className="font-medium">
                                                    {completedSteps.length} / {steps.length}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary transition-all duration-300 rounded-full"
                                                    style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                                                />
                                            </div>
                                            {completedSteps.length === steps.length && (
                                                <p className="text-center mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    {t('allStepsCompleted')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <ChefHat className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p>{t('noSteps')}</p>
                                </div>
                            )}
                        </div>

                        {/* Tips */}
                        {localized.tips && (
                            <div className="p-8 rounded-lg border bg-muted/30">
                                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                                    <Lightbulb className="h-6 w-6" />
                                    {t('tips')}
                                </h3>
                                <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                                    {localized.tips}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Ingredients Sidebar */}
                    <div className="lg:sticky lg:top-8 space-y-6">
                        {/* Ingredients Card */}
                        <div className="border rounded-lg bg-card p-8">
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                                <ShoppingBasket className="h-6 w-6" />
                                {t('ingredients')}
                            </h2>
                            
                            {/* Servings Selector */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                    <Users className="h-4 w-4" />
                                    <span>{t('servings')}</span>
                                </div>
                                <div className="flex gap-2">
                                    {availableServings.map((serving) => (
                                        <button
                                            key={serving}
                                            onClick={() => setSelectedServings(serving)}
                                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                                selectedServings === serving
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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

                            {/* Ingredients List */}
                            {ingredients.length > 0 ? (
                                <>
                                    <ul className="space-y-3">
                                        {ingredients.map((ingredient, index) => {
                                            const isChecked = checkedIngredients.has(index);
                                            return (
                                                <li 
                                                    key={index}
                                                    className={`flex items-start gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
                                                        isChecked 
                                                            ? 'bg-muted/50' 
                                                            : 'hover:bg-muted/30'
                                                    }`}
                                                    onClick={() => toggleIngredient(index)}
                                                >
                                                    <div className="flex-shrink-0 mt-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => toggleIngredient(index)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <span className={`text-base font-medium flex-1 ${
                                                                isChecked 
                                                                    ? 'text-muted-foreground line-through' 
                                                                    : ''
                                                            }`}>
                                                                {ingredient.name}
                                                                {ingredient.note && (
                                                                    <span className="block text-sm text-muted-foreground mt-1.5">
                                                                        {ingredient.note}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className={`text-base font-semibold text-right whitespace-nowrap ${
                                                                isChecked ? 'text-muted-foreground' : ''
                                                            }`}>
                                                                {ingredient.amount} {ingredient.unit}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    
                                    {/* Ingredients Progress */}
                                    {ingredients.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="flex items-center justify-between text-xs mb-2">
                                                <span className="text-muted-foreground">{t('ingredients')}</span>
                                                <span className="font-medium">
                                                    {checkedIngredients.size} / {ingredients.length}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary transition-all duration-300 rounded-full"
                                                    style={{ width: `${(checkedIngredients.size / ingredients.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ShoppingBasket className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">{t('noIngredients')}</p>
                                </div>
                            )}
                        </div>

                        {/* Actions: single primary (Favorite) + secondary (Share) */}
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <Button
                                    variant={isFavorite ? 'default' : 'outline'}
                                    size="sm"
                                    className="flex-1 gap-2 h-10"
                                    onClick={handleToggleFavorite}
                                    disabled={favoriteLoading}
                                >
                                    <Heart
                                        className={`h-4 w-4 shrink-0 ${
                                            isFavorite ? 'fill-current' : ''
                                        }`}
                                    />
                                    <span className="text-sm font-medium">
                                        {isFavorite ? t('inFavorites') : t('addToFavorites')}
                                    </span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 h-10 px-4 shrink-0"
                                    onClick={handleShare}
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {shareCopied ? t('linkCopied') : t('share')}
                                    </span>
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                {t('publishedOn')} {formatDate(recipe.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

