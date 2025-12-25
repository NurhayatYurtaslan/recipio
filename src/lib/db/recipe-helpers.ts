// Helper functions for recipe data that can be used in both server and client components

export interface RecipeIngredient {
    name: string;
    amount: number;
    unit: string;
    note: string | null;
}

export interface RecipeVariant {
    servings: number;
    variant_id: number;
    variant_image_url: string | null;
    ingredients_en: RecipeIngredient[] | null;
    ingredients_tr: RecipeIngredient[] | null;
}

export interface RecipeStep {
    step_number: number;
    text: string;
}

export interface RecipeDetail {
    recipe_id: number;
    status: string;
    is_free: boolean;
    user_id: string | null;
    cover_image_url: string | null;
    created_at: string;
    updated_at: string;
    // Translations
    title_en: string | null;
    title_tr: string | null;
    description_en: string | null;
    description_tr: string | null;
    tips_en: string | null;
    tips_tr: string | null;
    seo_title_en: string | null;
    seo_title_tr: string | null;
    seo_description_en: string | null;
    seo_description_tr: string | null;
    // Categories
    category_names: Record<string, string> | null;
    // Stats
    view_count: number;
    favorite_count: number;
    save_count: number;
    tried_count: number;
    comment_count: number;
    // Steps
    steps_en_json: RecipeStep[] | null;
    steps_tr_json: RecipeStep[] | null;
    // Servings & Variants
    available_servings: number[] | null;
    variants_with_ingredients: RecipeVariant[] | null;
}

// Helper function to get localized recipe data
export function getLocalizedRecipeData(recipe: RecipeDetail, locale: string) {
    const isEn = locale === 'en';
    
    return {
        title: isEn ? (recipe.title_en || recipe.title_tr) : (recipe.title_tr || recipe.title_en),
        description: isEn ? (recipe.description_en || recipe.description_tr) : (recipe.description_tr || recipe.description_en),
        tips: isEn ? (recipe.tips_en || recipe.tips_tr) : (recipe.tips_tr || recipe.tips_en),
        seoTitle: isEn ? (recipe.seo_title_en || recipe.seo_title_tr) : (recipe.seo_title_tr || recipe.seo_title_en),
        seoDescription: isEn ? (recipe.seo_description_en || recipe.seo_description_tr) : (recipe.seo_description_tr || recipe.seo_description_en),
        steps: isEn ? (recipe.steps_en_json || recipe.steps_tr_json) : (recipe.steps_tr_json || recipe.steps_en_json),
        categoryName: recipe.category_names?.[locale] || recipe.category_names?.['en'] || recipe.category_names?.['tr'] || null,
    };
}

// Helper function to get ingredients for a specific serving size
export function getIngredientsForServings(recipe: RecipeDetail, servings: number, locale: string): RecipeIngredient[] {
    const variant = recipe.variants_with_ingredients?.find(v => v.servings === servings);
    if (!variant) return [];
    
    const isEn = locale === 'en';
    return isEn 
        ? (variant.ingredients_en || variant.ingredients_tr || [])
        : (variant.ingredients_tr || variant.ingredients_en || []);
}

