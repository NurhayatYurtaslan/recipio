-- Recipio Schema Setup: Tables, Roles, RLS, and Triggers
-- Migration: 0001_init

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types (Enums)
CREATE TYPE public.recipe_status AS ENUM ('draft', 'pending', 'published', 'rejected');
CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.recipe_event_type AS ENUM ('view', 'favorite', 'save', 'try', 'comment');

-- Tables
-- Auth & User Management
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    locale VARCHAR(2) DEFAULT 'en'::character varying,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'user'
);

-- Content Structure
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE
);

CREATE TABLE public.category_translations (
    category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    locale VARCHAR(2) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    PRIMARY KEY (category_id, locale)
);

CREATE TABLE public.recipes (
    id SERIAL PRIMARY KEY,
    owner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status public.recipe_status NOT NULL DEFAULT 'draft',
    is_free BOOLEAN NOT NULL DEFAULT false,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.recipes (owner_user_id);
CREATE INDEX ON public.recipes (status);

CREATE TABLE public.recipe_translations (
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    locale VARCHAR(2) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    tips TEXT,
    seo_title TEXT,
    seo_description TEXT,
    PRIMARY KEY (recipe_id, locale)
);

CREATE TABLE public.recipe_steps (
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    locale VARCHAR(2) NOT NULL,
    step_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    PRIMARY KEY (recipe_id, locale, step_number)
);

CREATE TABLE public.ingredients (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    default_image_url TEXT
);

CREATE TABLE public.ingredient_translations (
    ingredient_id INTEGER NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    locale VARCHAR(2) NOT NULL,
    name TEXT NOT NULL,
    PRIMARY KEY (ingredient_id, locale)
);

CREATE TABLE public.units (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE
);

CREATE TABLE public.recipe_variants (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    servings INTEGER NOT NULL,
    variant_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(recipe_id, servings)
);
CREATE INDEX ON public.recipe_variants (recipe_id);

CREATE TABLE public.recipe_variant_ingredients (
    variant_id INTEGER NOT NULL REFERENCES public.recipe_variants(id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    unit_id INTEGER NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    note TEXT,
    PRIMARY KEY (variant_id, ingredient_id)
);

-- Engagement
CREATE TABLE public.favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE public.saved_recipes (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE public.tried_recipes (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE public.comments (
    id BIGSERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.comments (recipe_id);

-- Stats & Analytics
CREATE TABLE public.recipe_stats (
    recipe_id INTEGER PRIMARY KEY REFERENCES public.recipes(id) ON DELETE CASCADE,
    view_count BIGINT DEFAULT 0,
    favorite_count BIGINT DEFAULT 0,
    save_count BIGINT DEFAULT 0,
    tried_count BIGINT DEFAULT 0,
    comment_count BIGINT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.recipe_events (
    id BIGSERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type public.recipe_event_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.recipe_events (recipe_id, event_type);

-- Helper function to check for admin role
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles r
        WHERE r.user_id = is_admin.user_id AND r.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Triggers
-- 1. Automatically create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    INSERT INTO public.user_roles (user_id)
    VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Automatically create a stats entry for a new recipe
CREATE OR REPLACE FUNCTION public.handle_new_recipe()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.recipe_stats (recipe_id)
    VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_recipe_created
    AFTER INSERT ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_recipe();

-- 3. Update stats based on events
CREATE OR REPLACE FUNCTION public.update_recipe_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        CASE new.event_type
            WHEN 'view' THEN
                UPDATE public.recipe_stats SET view_count = view_count + 1, updated_at = now() WHERE recipe_id = new.recipe_id;
            WHEN 'favorite' THEN
                UPDATE public.recipe_stats SET favorite_count = favorite_count + 1, updated_at = now() WHERE recipe_id = new.recipe_id;
            WHEN 'save' THEN
                UPDATE public.recipe_stats SET save_count = save_count + 1, updated_at = now() WHERE recipe_id = new.recipe_id;
            WHEN 'try' THEN
                UPDATE public.recipe_stats SET tried_count = tried_count + 1, updated_at = now() WHERE recipe_id = new.recipe_id;
            WHEN 'comment' THEN
                UPDATE public.recipe_stats SET comment_count = comment_count + 1, updated_at = now() WHERE recipe_id = new.recipe_id;
        END CASE;
    ELSIF TG_OP = 'DELETE' THEN
        CASE old.event_type
            WHEN 'favorite' THEN
                UPDATE public.recipe_stats SET favorite_count = favorite_count - 1, updated_at = now() WHERE recipe_id = old.recipe_id;
            WHEN 'save' THEN
                UPDATE public.recipe_stats SET save_count = save_count - 1, updated_at = now() WHERE recipe_id = old.recipe_id;
            WHEN 'try' THEN
                UPDATE public.recipe_stats SET tried_count = tried_count - 1, updated_at = now() WHERE recipe_id = old.recipe_id;
            WHEN 'comment' THEN
                UPDATE public.recipe_stats SET comment_count = comment_count - 1, updated_at = now() WHERE recipe_id = old.recipe_id;
        END CASE;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_recipe_event
    AFTER INSERT OR DELETE ON public.recipe_events
    FOR EACH ROW EXECUTE FUNCTION public.update_recipe_stats();
    
CREATE TRIGGER on_favorite_engagement
    AFTER INSERT OR DELETE ON public.favorites
    FOR EACH ROW EXECUTE FUNCTION public.update_favorite_stats();

CREATE TRIGGER on_saved_engagement
    AFTER INSERT OR DELETE ON public.saved_recipes
    FOR EACH ROW EXECUTE FUNCTION public.update_save_stats();

CREATE TRIGGER on_tried_engagement
    AFTER INSERT OR DELETE ON public.tried_recipes
    FOR EACH ROW EXECUTE FUNCTION public.update_tried_stats();

CREATE TRIGGER on_comment_engagement
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comment_stats();

-- Functions to link engagement tables to recipe_events
CREATE OR REPLACE FUNCTION public.update_favorite_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.recipe_events(recipe_id, user_id, event_type) VALUES(new.recipe_id, new.user_id, 'favorite');
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.recipe_events WHERE recipe_id = old.recipe_id AND user_id = old.user_id AND event_type = 'favorite';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_save_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.recipe_events(recipe_id, user_id, event_type) VALUES(new.recipe_id, new.user_id, 'save');
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.recipe_events WHERE recipe_id = old.recipe_id AND user_id = old.user_id AND event_type = 'save';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_tried_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.recipe_events(recipe_id, user_id, event_type) VALUES(new.recipe_id, new.user_id, 'try');
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.recipe_events WHERE recipe_id = old.recipe_id AND user_id = old.user_id AND event_type = 'try';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_comment_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.recipe_events(recipe_id, user_id, event_type) VALUES(new.recipe_id, new.user_id, 'comment');
    ELSIF TG_OP = 'DELETE' THEN
         DELETE FROM public.recipe_events WHERE recipe_id = old.recipe_id AND user_id = old.user_id AND event_type = 'comment' AND id IN (SELECT id FROM public.recipe_events WHERE recipe_id = old.recipe_id AND user_id = old.user_id AND event_type = 'comment' LIMIT 1);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_variant_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tried_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_events ENABLE ROW LEVEL SECURITY;

-- Policies
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- User Roles
CREATE POLICY "Admins can view all roles." ON public.user_roles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert and update roles." ON public.user_roles FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Public readable content
CREATE POLICY "Anyone can read categories, ingredients, and units." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read category_translations." ON public.category_translations FOR SELECT USING (true);
CREATE POLICY "Anyone can read ingredients." ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Anyone can read ingredient_translations." ON public.ingredient_translations FOR SELECT USING (true);
CREATE POLICY "Anyone can read units." ON public.units FOR SELECT USING (true);
CREATE POLICY "Anyone can read recipe_stats." ON public.recipe_stats FOR SELECT USING (true);

-- Recipes
CREATE POLICY "Published, free recipes are public." ON public.recipes FOR SELECT USING (status = 'published' AND is_free = true);
CREATE POLICY "Published, non-free recipes for auth users." ON public.recipes FOR SELECT USING (status = 'published' AND auth.role() = 'authenticated');
CREATE POLICY "Users can see their own non-published recipes." ON public.recipes FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Admins can see all recipes." ON public.recipes FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Auth users can create recipes." ON public.recipes FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND owner_user_id = auth.uid() AND status IN ('pending', 'draft'));
CREATE POLICY "Users can update their own draft/rejected recipes." ON public.recipes FOR UPDATE USING (auth.uid() = owner_user_id AND status IN ('draft', 'rejected')) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Admins can update any recipe." ON public.recipes FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Function to check recipe accessibility
CREATE OR REPLACE FUNCTION is_recipe_accessible(recipe_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    is_accessible BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.recipes r
        WHERE r.id = is_recipe_accessible.recipe_id
    ) INTO is_accessible;
    RETURN is_accessible;
END;
$$ LANGUAGE plpgsql;

-- Related recipe content
CREATE POLICY "Related content is visible if recipe is accessible." ON public.recipe_translations FOR SELECT USING (is_recipe_accessible(recipe_id));
CREATE POLICY "Related content is visible if recipe is accessible." ON public.recipe_steps FOR SELECT USING (is_recipe_accessible(recipe_id));
CREATE POLICY "Related content is visible if recipe is accessible." ON public.recipe_variants FOR SELECT USING (is_recipe_accessible(recipe_id));
CREATE POLICY "Related content is visible if recipe is accessible." ON public.recipe_variant_ingredients FOR SELECT USING (EXISTS (SELECT 1 FROM recipe_variants rv WHERE rv.id = variant_id AND is_recipe_accessible(rv.recipe_id)));

-- Engagement
CREATE POLICY "Auth users can manage their own engagement." ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can manage their own engagement." ON public.saved_recipes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can manage their own engagement." ON public.tried_recipes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Comments
CREATE POLICY "Comments are public if not hidden and recipe is accessible." ON public.comments FOR SELECT USING (is_hidden = false AND is_recipe_accessible(recipe_id));
CREATE POLICY "Users can see their own hidden comments." ON public.comments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can see all comments." ON public.comments FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Auth users can post comments on accessible recipes." ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid() AND is_recipe_accessible(recipe_id));
CREATE POLICY "Users can delete their own comments." ON public.comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can hide/unhide any comment." ON public.comments FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Recipe Events
CREATE POLICY "Anon users can insert 'view' events." ON public.recipe_events FOR INSERT WITH CHECK (event_type = 'view' AND user_id IS NULL);
CREATE POLICY "Auth users can insert their own events." ON public.recipe_events FOR INSERT WITH CHECK (auth.uid() = user_id);
-- No one should be able to SELECT or DELETE events directly, they are append-only logs managed by triggers.
-- The stats table is the source of truth for reads.
CREATE POLICY "Admins can view events for debugging." ON public.recipe_events FOR SELECT USING (is_admin(auth.uid()));
