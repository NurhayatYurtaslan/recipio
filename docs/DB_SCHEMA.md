# Recipio: Database Schema Summary

This document summarizes the complete database structure including tables, views, functions, triggers, and Row Level Security (RLS) policies.

---

## 1. Core Tables

### User Management

**`profiles`**
- Stores public user data linked to `auth.users`
- Fields: `id` (UUID, PK, references auth.users), `display_name`, `avatar_url`, `locale`, `created_at`

**`user_roles`**
- Assigns roles to users for permissions
- Fields: `user_id` (UUID, PK), `role` (enum: `user`, `admin`)
- Composite primary key: `(user_id, role)`

### Categories

**`categories`**
- Recipe categories (e.g., 'soups', 'desserts')
- Fields: `id` (SERIAL, PK), `slug` (TEXT, UNIQUE)

**`category_translations`**
- Localized names for categories
- Fields: `category_id`, `locale` (VARCHAR(2)), `name`, `description`
- Composite primary key: `(category_id, locale)`

### Recipes

**`recipes`**
- Core recipe entity (NO JSON fields - fully normalized)
- Fields: `id` (SERIAL, PK), `user_id` (UUID, nullable), `status` (enum: `draft`, `pending`, `published`, `rejected`), `is_free` (BOOLEAN), `cover_image_url`, `created_at`, `updated_at`
- Indexes: `user_id`, `status`, `(status, is_free)`

**`recipe_translations`**
- Localized titles and descriptions for recipes
- Fields: `recipe_id`, `locale` (VARCHAR(2)), `title`, `description`, `tips`, `seo_title`, `seo_description`
- Composite primary key: `(recipe_id, locale)`

**`recipe_steps`**
- Individual steps for a recipe (separate table per language)
- Fields: `id` (SERIAL, PK), `recipe_id`, `locale` (VARCHAR(2)), `step_number`, `text`
- Unique constraint: `(recipe_id, locale, step_number)`

**`recipe_categories`**
- Many-to-many relationship between recipes and categories
- Fields: `recipe_id`, `category_id`
- Composite primary key: `(recipe_id, category_id)`

### Variants & Ingredients

**`recipe_variants`**
- Defines serving size options for a recipe (1, 2, 3, 4 servings)
- Fields: `id` (SERIAL, PK), `recipe_id`, `servings` (INTEGER), `variant_image_url`, `created_at`
- Unique constraint: `(recipe_id, servings)`
- Indexes: `recipe_id`, `(recipe_id, servings)`

**`ingredients`**
- Reusable ingredient definitions
- Fields: `id` (SERIAL, PK), `slug` (TEXT, UNIQUE), `image_url`

**`ingredient_translations`**
- Localized names for ingredients
- Fields: `ingredient_id`, `locale` (VARCHAR(2)), `name`
- Composite primary key: `(ingredient_id, locale)`

**`units`**
- Measurement units (g, kg, ml, l, pcs, tbsp, tsp, cup, pinch)
- Fields: `id` (SERIAL, PK), `code` (TEXT, UNIQUE)

**`recipe_variant_ingredients`**
- Links ingredients with quantities to a specific recipe variant
- Fields: `variant_id`, `ingredient_id`, `unit_id`, `amount` (NUMERIC(10,2)), `note`
- Composite primary key: `(variant_id, ingredient_id)`
- Indexes: `variant_id`, `ingredient_id`

### User Engagement

**`favorites`**
- User favorite recipes
- Fields: `user_id` (UUID), `recipe_id` (INTEGER), `created_at`
- Composite primary key: `(user_id, recipe_id)`
- Indexes: `recipe_id`, `user_id`

**`saved_recipes`**
- User saved recipes
- Fields: `user_id` (UUID), `recipe_id` (INTEGER), `created_at`
- Composite primary key: `(user_id, recipe_id)`
- Indexes: `recipe_id`, `user_id`

**`tried_recipes`**
- User tried recipes
- Fields: `user_id` (UUID), `recipe_id` (INTEGER), `created_at`
- Composite primary key: `(user_id, recipe_id)`
- Indexes: `recipe_id`, `user_id`

**`views`**
- Recipe view tracking
- Fields: `id` (BIGSERIAL, PK), `recipe_id` (INTEGER), `user_id` (UUID, nullable), `created_at`
- Indexes: `recipe_id`, `(recipe_id, user_id)`

**`comments`**
- User comments on recipes
- Fields: `id` (BIGSERIAL, PK), `recipe_id` (INTEGER), `user_id` (UUID), `body`, `is_hidden` (BOOLEAN), `created_at`
- Indexes: `recipe_id`, `user_id`

### Statistics & Events

**`recipe_stats`**
- Aggregated counters for performance (updated via triggers)
- Fields: `recipe_id` (INTEGER, PK), `view_count`, `favorite_count`, `save_count`, `tried_count`, `comment_count`, `updated_at`
- Automatically updated by triggers when engagement tables change

**`recipe_events`**
- Raw event log (optional, for analytics)
- Fields: `id` (BIGSERIAL, PK), `recipe_id` (INTEGER), `user_id` (UUID, nullable), `event_type` (enum: `view`, `favorite`, `save`, `try`, `comment`), `created_at`
- Indexes: `(recipe_id, event_type)`, `created_at`

---

## 2. SQL Views

Views simplify application queries and ensure RLS is respected. All views are granted to `anon` and `authenticated` roles.

### **`v_recipe_stats`**
- Aggregated statistics from `recipe_stats` table
- Returns: `recipe_id`, `view_count`, `favorite_count`, `save_count`, `tried_count`, `comment_count`, `updated_at`

### **`v_public_recipe_cards`**
- **Purpose:** For public recipe listing pages (homepage, recipe list)
- **Returns:** Flattened structure with:
  - Basic info: `recipe_id`, `status`, `is_free`, `user_id`, `cover_image_url`, `created_at`
  - Localized content: `title`, `description` (with TR/EN fallback)
  - Category: `category_slug`
  - Stats: `view_count`, `favorite_count`, `save_count`, `tried_count`, `comment_count`
- **Filter:** Only `status = 'published'` recipes

### **`v_recipe_detail`**
- **Purpose:** Single recipe detail page - fetches ALL data in ONE query
- **Returns:**
  - Basic info: `recipe_id`, `status`, `is_free`, `user_id`, `cover_image_url`, `created_at`, `updated_at`
  - Translations: `title_en`, `title_tr`, `description_en`, `description_tr`, `tips_en`, `tips_tr`, `seo_title_en`, `seo_title_tr`, `seo_description_en`, `seo_description_tr`
  - Categories: `category_names` (JSONB object with locale keys)
  - Stats: `view_count`, `favorite_count`, `save_count`, `tried_count`, `comment_count`
  - Steps: `steps_en_json`, `steps_tr_json` (JSONB arrays)
  - Variants: `available_servings` (JSONB array: [1,2,3,4])
  - Variants with ingredients: `variants_with_ingredients` (JSONB array containing):
    - `servings`, `variant_id`, `variant_image_url`
    - `ingredients_en` (JSONB array: name, amount, unit, note)
    - `ingredients_tr` (JSONB array: name, amount, unit, note)
- **Usage:** Single query gets everything needed for recipe detail page

### **`v_admin_pending_recipes`**
- **Purpose:** Admin dashboard - list recipes awaiting moderation
- **Returns:** `recipe_id`, `status`, `user_id`, `cover_image_url`, `created_at`, `title_en`, `title_tr`, `author_name`, `translation_count`, `step_count`, `variant_count`
- **Filter:** Only `status = 'pending'` recipes
- **Access:** `authenticated` role only

### **`v_user_library`**
- **Purpose:** User's personal library (favorites, saved, tried)
- **Returns:** Recipe info with `engagement_type` ('favorite', 'saved', 'tried'), `engaged_at`, stats
- **Filter:** Only recipes where user has engagement AND `status = 'published'`
- **Access:** `authenticated` role only

---

## 3. Functions

### **`is_admin(user_id UUID)`**
- Checks if a user has admin role
- Returns: `BOOLEAN`
- Security: `SECURITY DEFINER`

### **`is_recipe_accessible(recipe_id INTEGER)`**
- Checks if current user can access a recipe based on RLS rules
- Returns: `BOOLEAN`
- Logic:
  - `published` AND `is_free` = true → accessible to all
  - `published` AND authenticated → accessible to authenticated users
  - Own recipe → accessible to owner
  - Admin → accessible to admins
- Security: `SECURITY DEFINER`

### **`update_recipe_stats()`**
- Trigger function that updates `recipe_stats` table
- Called automatically when engagement tables change
- Updates counts from source tables (not from events to avoid loops)
- Handles both `recipes` table (uses `id`) and other tables (use `recipe_id`)

### **`handle_new_user()`**
- Trigger function that creates a profile when a new user signs up
- Creates entry in `profiles` table with `id = auth.users.id`

---

## 4. Triggers

### **`on_auth_user_created`**
- Table: `auth.users`
- Event: `AFTER INSERT`
- Function: `handle_new_user()`
- Purpose: Auto-create profile for new users

### **`on_recipe_updated`**
- Table: `recipes`
- Event: `BEFORE UPDATE`
- Function: Updates `updated_at` timestamp

### **`on_favorite_changed`, `on_saved_changed`, `on_tried_changed`, `on_comment_changed`, `on_view_changed`, `on_recipe_created`**
- Tables: `favorites`, `saved_recipes`, `tried_recipes`, `comments`, `views`, `recipes`
- Events: `AFTER INSERT`, `AFTER DELETE` (or `AFTER INSERT` for views)
- Function: `update_recipe_stats()`
- Purpose: Automatically update aggregated stats

---

## 5. Row Level Security (RLS) Strategy

### Anonymous (`anon` role)

**SELECT:**
- `profiles`: All profiles (public data)
- `recipes`: Only `status = 'published'` AND `is_free = true`
- `recipe_translations`, `recipe_steps`: Only for accessible recipes
- `recipe_variants`, `recipe_variant_ingredients`: Only for accessible recipes
- `categories`, `category_translations`: All
- `ingredients`, `ingredient_translations`: All
- `units`: All
- `recipe_stats`: Only for accessible recipes
- Views: `v_public_recipe_cards`, `v_recipe_detail` (filtered by RLS)

**INSERT:**
- `views`: Allowed (for tracking views)
- All other tables: Denied

**UPDATE/DELETE:**
- All tables: Denied

### Authenticated User (`authenticated` role)

**SELECT:**
- All `published` recipes (regardless of `is_free`)
- Own recipes (`user_id = auth.uid()`): `draft`, `pending`, `rejected`, `published`
- All related content (translations, steps, variants) for accessible recipes
- Own engagement records (`favorites`, `saved_recipes`, `tried_recipes`, `comments`)
- Views: All public views + `v_user_library` (own data only)

**INSERT:**
- `recipes`: Default `status = 'pending'`, `user_id = auth.uid()`
- `recipe_translations`, `recipe_steps`, `recipe_variants`, `recipe_variant_ingredients`: For own recipes
- `favorites`, `saved_recipes`, `tried_recipes`: Own records only
- `comments`: Own comments only
- `views`: Allowed

**UPDATE:**
- Own `draft` or `rejected` recipes
- Own comments
- Own profile

**DELETE:**
- Own engagement records (unfavorite, unsave, etc.)
- Own comments
- Own `draft` recipes

### Admin (`admin` role, via `user_roles`)

**SELECT:**
- All data (bypasses RLS via `is_admin()` function)

**UPDATE:**
- Any recipe's `status` (approve/reject)
- Any comment's `is_hidden` flag
- Any recipe data

**DELETE:**
- Any recipe (with cascade to related data)
- Any comment

---

## 6. Key Design Decisions

1. **No JSON fields in `recipes` table**: All translations and steps are in separate tables for better querying, filtering, and RLS support.

2. **Separate engagement tables**: `favorites`, `saved_recipes`, `tried_recipes` are separate tables (not a single `engagements` table) for better RLS control and clarity.

3. **Aggregated stats**: `recipe_stats` table is updated via triggers for performance. Avoids counting on every query.

4. **Single query for detail**: `v_recipe_detail` view returns ALL data needed for recipe detail page in one query, including all variants and ingredients.

5. **Variant-based ingredients**: Each recipe has 1, 2, 3, 4 serving variants with separate ingredient lists (not calculated).

6. **Idempotent migrations**: All `CREATE` statements use `IF NOT EXISTS`, policies use `DROP IF EXISTS` before `CREATE`, types use `DO $$ BEGIN ... EXCEPTION` blocks.

---

## 7. Indexes Summary

- **Recipes**: `user_id`, `status`, `(status, is_free)`
- **Recipe translations**: `recipe_id`, `locale`
- **Recipe steps**: `(recipe_id, locale)`
- **Recipe variants**: `recipe_id`, `(recipe_id, servings)`
- **Recipe variant ingredients**: `variant_id`, `ingredient_id`
- **Engagements**: `recipe_id`, `user_id` (on all engagement tables)
- **Views**: `recipe_id`, `(recipe_id, user_id)`
- **Comments**: `recipe_id`, `user_id`
- **Recipe events**: `(recipe_id, event_type)`, `created_at`

---

## 8. Seed Data

The `supabase/seed/seed.sql` file includes:
- 6 categories (soups, salads, main-courses, desserts, breakfast, appetizers)
- 20 ingredients with translations (TR/EN)
- 9 units (g, kg, ml, l, pcs, tbsp, tsp, cup, pinch)
- 10 recipes (published, pending, rejected, free, premium)
- Each recipe has 1, 2, 3, 4 serving variants with ingredient lists
- Recipe translations (TR/EN) and steps (TR/EN)
