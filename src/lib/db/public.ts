// This file will contain functions to query public data, primarily using the SQL views.
// Server-side only - uses next/headers
// NOTE: Client components should import types/helpers from '@/lib/db/recipe-helpers' directly

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { RecipeDetail } from './recipe-helpers';

export interface PublicRecipeCard {
    recipe_id: number;
    status: string;
    is_free: boolean;
    user_id: string | null;
    cover_image_url: string | null;
    created_at: string;
    title: string;
    description: string | null;
    category_slug: string | null;
    view_count: number;
    favorite_count: number;
    save_count: number;
    tried_count: number;
    comment_count: number;
}

export interface RecipeFilters {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export async function getAllPublicRecipes(filters?: RecipeFilters): Promise<PublicRecipeCard[]> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    let query = supabase
        .from('v_public_recipe_cards')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters?.category) {
        query = query.eq('category_slug', filters.category);
    }

    if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching public recipes:', error);
        return [];
    }

    return data || [];
}

export async function getFeaturedRecipes(limit: number = 6): Promise<PublicRecipeCard[]> {
    return getAllPublicRecipes({ limit });
}

export async function getCategories(locale: string = 'en') {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('category_translations')
        .select('*, categories:category_id(slug, image_url)')
        .eq('locale', locale)
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data || [];
}

export interface CategoryInfo {
    category_id: number;
    locale: string;
    name: string;
    description: string | null;
    categories: {
        slug: string;
        image_url: string | null;
    };
}

export async function getCategoryBySlug(slug: string, locale: string = 'en'): Promise<CategoryInfo | null> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // First get category_id from slug
    const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .single();

    if (categoryError || !category) {
        console.error('Error fetching category by slug:', categoryError);
        return null;
    }

    // Then get translation
    const { data: translation, error: translationError } = await supabase
        .from('category_translations')
        .select('*, categories:category_id(slug, image_url)')
        .eq('category_id', category.id)
        .eq('locale', locale)
        .single();

    if (translationError || !translation) {
        console.error('Error fetching category translation:', translationError);
        return null;
    }

    return translation as CategoryInfo;
}

export async function getRecipeDetail(recipeId: number): Promise<RecipeDetail | null> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('v_recipe_detail')
        .select('*')
        .eq('recipe_id', recipeId)
        .single();

    if (error) {
        console.error('Error fetching recipe detail:', error);
        return null;
    }

    return data as RecipeDetail;
}
