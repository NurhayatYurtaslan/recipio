/**
 * Build-time only helpers (no cookies). For use in generateStaticParams.
 * Kept in a separate file so static export builds always have these exports.
 */

import { createClient } from '@supabase/supabase-js';

export async function getCategorySlugsForBuild(): Promise<string[]> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('categories').select('slug').order('slug');
    if (error) {
        console.error('Error fetching category slugs:', error);
        return [];
    }
    return (data || []).map((r) => r.slug).filter((s): s is string => Boolean(s));
}

export async function getPublicRecipeIdsForBuild(limit: number = 500): Promise<number[]> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];
    const supabase = createClient(url, key);
    const { data, error } = await supabase
        .from('v_public_recipe_cards')
        .select('recipe_id')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) {
        console.error('Error fetching recipe ids:', error);
        return [];
    }
    return (data || []).map((r) => r.recipe_id);
}
