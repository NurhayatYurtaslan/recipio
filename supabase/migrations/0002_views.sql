-- Recipio Schema Setup: Views
-- Migration: 0002_views

-- v_public_recipe_cards
-- One row per recipe (published + free)
-- Columns: recipe_id, cover_image_url, created_at, category_slug,
-- title_tr, title_en, desc_tr, desc_en,
-- stats counters from recipe_stats
CREATE OR REPLACE VIEW public.v_public_recipe_cards AS
SELECT
    r.id AS recipe_id,
    r.cover_image_url,
    r.created_at,
    (SELECT c.slug FROM public.categories c JOIN public.category_translations ct ON c.id = ct.category_id JOIN public.recipe_categories rc ON r.id = rc.recipe_id WHERE c.id = rc.category_id LIMIT 1) AS category_slug,
    rt_en.title AS title_en,
    rt_tr.title AS title_tr,
    rt_en.description AS desc_en,
    rt_tr.description AS desc_tr,
    rs.view_count,
    rs.favorite_count,
    rs.save_count,
    rs.tried_count,
    rs.comment_count
FROM
    public.recipes r
LEFT JOIN public.recipe_translations rt_en ON r.id = rt_en.recipe_id AND rt_en.locale = 'en'
LEFT JOIN public.recipe_translations rt_tr ON r.id = rt_tr.recipe_id AND rt_tr.locale = 'tr'
LEFT JOIN public.recipe_stats rs ON r.id = rs.recipe_id
WHERE
    r.status = 'published' AND r.is_free = true;

-- v_recipe_detail
-- One row per recipe (must work for both public and user-owned access via RLS)
CREATE OR REPLACE VIEW public.v_recipe_detail AS
SELECT
    r.id AS recipe_id,
    r.status,
    r.is_free,
    r.owner_user_id,
    r.cover_image_url,
    r.created_at,
    (
        SELECT jsonb_object_agg(ct.locale, ct.name)
        FROM public.recipe_categories rc
        JOIN public.category_translations ct ON rc.category_id = ct.category_id
        WHERE rc.recipe_id = r.id
    ) AS category_names,
    rs.view_count,
    rs.favorite_count,
    rs.save_count,
    rs.tried_count,
    rs.comment_count,
    (
        SELECT jsonb_agg(jsonb_build_object('step_number', s.step_number, 'text', s.text) ORDER BY s.step_number)
        FROM public.recipe_steps s
        WHERE s.recipe_id = r.id AND s.locale = 'tr'
    ) AS steps_tr_json,
    (
        SELECT jsonb_agg(jsonb_build_object('step_number', s.step_number, 'text', s.text) ORDER BY s.step_number)
        FROM public.recipe_steps s
        WHERE s.recipe_id = r.id AND s.locale = 'en'
    ) AS steps_en_json,
    (
        SELECT jsonb_agg(rv.servings ORDER BY rv.servings)
        FROM public.recipe_variants rv
        WHERE rv.recipe_id = r.id
    ) AS available_servings
FROM
    public.recipes r
LEFT JOIN public.recipe_stats rs ON r.id = rs.recipe_id;


-- v_variant_ingredients
-- One row per variant
CREATE OR REPLACE VIEW public.v_variant_ingredients AS
SELECT
    rv.recipe_id,
    rv.id AS variant_id,
    rv.servings,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'name', it.name,
                'amount', rvi.amount,
                'unit', u.code,
                'note', rvi.note
            )
        )
        FROM public.recipe_variant_ingredients rvi
        JOIN public.ingredients i ON rvi.ingredient_id = i.id
        JOIN public.ingredient_translations it ON i.id = it.ingredient_id
        JOIN public.units u ON rvi.unit_id = u.id
        WHERE rvi.variant_id = rv.id AND it.locale = 'tr'
    ) AS ingredients_tr_json,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'name', it.name,
                'amount', rvi.amount,
                'unit', u.code,
                'note', rvi.note
            )
        )
        FROM public.recipe_variant_ingredients rvi
        JOIN public.ingredients i ON rvi.ingredient_id = i.id
        JOIN public.ingredient_translations it ON i.id = it.ingredient_id
        JOIN public.units u ON rvi.unit_id = u.id
        WHERE rvi.variant_id = rv.id AND it.locale = 'en'
    ) AS ingredients_en_json
FROM
    public.recipe_variants rv;


-- v_admin_pending_recipes
-- One row per pending recipe
CREATE OR REPLACE VIEW public.v_admin_pending_recipes AS
SELECT
    r.id AS recipe_id,
    r.created_at,
    p.id AS owner_user_id,
    p.display_name AS owner_name,
    rt_en.title AS title_en,
    rt_tr.title AS title_tr
FROM
    public.recipes r
LEFT JOIN public.recipe_translations rt_en ON r.id = rt_en.recipe_id AND rt_en.locale = 'en'
LEFT JOIN public.recipe_translations rt_tr ON r.id = rt_tr.recipe_id AND rt_tr.locale = 'tr'
LEFT JOIN public.profiles p ON r.owner_user_id = p.id
WHERE
    r.status = 'pending';

-- v_user_library
-- Returns recipe cards for a user's library (favorites, saved, tried)
CREATE OR REPLACE VIEW public.v_user_library AS
SELECT
    'favorite' AS library_type,
    f.user_id,
    vprc.*
FROM public.favorites f
JOIN public.v_public_recipe_cards vprc ON f.recipe_id = vprc.recipe_id

UNION ALL

SELECT
    'saved' AS library_type,
    sr.user_id,
    vprc.*
FROM public.saved_recipes sr
JOIN public.v_public_recipe_cards vprc ON sr.recipe_id = vprc.recipe_id

UNION ALL

SELECT
    'tried' AS library_type,
    tr.user_id,
    vprc.*
FROM public.tried_recipes tr
JOIN public.v_public_recipe_cards vprc ON tr.recipe_id = vprc.recipe_id;

-- Before creating the `recipe_categories` table, we need to alter the v_public_recipe_cards view to remove the dependency on it.
-- We will add the dependency back after the table is created.
-- We will also need to alter the v_recipe_detail view to remove the dependency on it.
-- Add recipe_categories table
CREATE TABLE public.recipe_categories (
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, category_id)
);
ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Related content is visible if recipe is accessible." ON public.recipe_categories FOR SELECT USING (is_recipe_accessible(recipe_id));

-- Grant usage on new views
GRANT SELECT ON public.v_public_recipe_cards TO anon, authenticated;
GRANT SELECT ON public.v_recipe_detail TO anon, authenticated;
GRANT SELECT ON public.v_variant_ingredients TO anon, authenticated;
GRANT SELECT ON public.v_admin_pending_recipes TO authenticated; -- RLS will handle admin check
GRANT SELECT ON public.v_user_library TO authenticated;
GRANT SELECT ON public.recipe_categories TO anon, authenticated;

-- Grant usage on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant usage on all sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
