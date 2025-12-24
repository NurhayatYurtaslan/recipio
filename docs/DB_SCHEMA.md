# Recipio: Database Schema Summary

This document summarizes the database tables, views, and Row Level Security (RLS) strategy.

## 1. Tables

-   **`profiles`**: Stores public user data linked to `auth.users`.
    -   `id` (uuid, PK, references auth.users)
    -   `display_name`, `avatar_url`, `locale`
-   **`user_roles`**: Assigns roles to users for permissions.
    -   `user_id` (uuid, PK), `role` (enum: `user`, `admin`)
-   **`categories`**: Recipe categories (e.g., 'Dessert', 'Main Course').
    -   `id` (serial, PK), `slug` (text, unique)
-   **`category_translations`**: Localized names for categories.
    -   `category_id`, `locale`, `name`, `description`
-   **`recipes`**: The core recipe entity.
    -   `id` (serial, PK), `owner_user_id` (nullable), `status` (enum), `is_free`, `cover_image_url`
-   **`recipe_translations`**: Localized titles and descriptions for recipes.
    -   `recipe_id`, `locale`, `title`, `description`, `tips`, etc.
-   **`recipe_steps`**: Individual steps for a recipe.
    -   `recipe_id`, `locale`, `step_number`, `text`
-   **`recipe_variants`**: Defines the serving size options for a recipe.
    -   `id` (serial, PK), `recipe_id`, `servings` (int)
-   **`ingredients`**: Reusable ingredient definitions.
    -   `id` (serial, PK), `slug` (text, unique)
-   **`ingredient_translations`**: Localized names for ingredients.
    -   `ingredient_id`, `locale`, `name`
-   **`units`**: Measurement units (g, ml, pcs, etc.).
    -   `id` (serial, PK), `code` (text, unique)
-   **`recipe_variant_ingredients`**: Links ingredients with quantities to a specific recipe variant.
    -   `variant_id`, `ingredient_id`, `amount`, `unit_id`
-   **`favorites`, `saved_recipes`, `tried_recipes`**: User engagement tracking tables.
    -   `user_id`, `recipe_id` (composite PK)
-   **`comments`**: User comments on recipes.
    -   `id`, `recipe_id`, `user_id`, `body`, `is_hidden`
-   **`recipe_stats`**: Aggregated counters for performance.
    -   `recipe_id` (PK), `view_count`, `favorite_count`, etc.
-   **`recipe_events`**: Raw event log to trigger updates to `recipe_stats`.
    -   `id`, `recipe_id`, `user_id`, `event_type` (enum)

## 2. SQL Views

Views are used to simplify application queries and ensure RLS is respected.

-   **`v_public_recipe_cards`**: For public recipe lists. Returns a flattened structure with key recipe info and translated titles/descriptions for `published` and `is_free` recipes. Includes aggregated stats.
-   **`v_recipe_detail`**: For the main recipe page. Provides all necessary data for a single recipe, including base fields, translated category names, aggregated stats, and JSON arrays of steps for both locales. Works for both public and user-owned recipes.
-   **`v_variant_ingredients`**: Provides ingredient data for a specific recipe variant (serving size). Aggregates ingredients into JSON arrays for both locales, including amounts and unit codes.
-   **`v_admin_pending_recipes`**: A simple view for the admin dashboard, listing all recipes with a `pending` status, along with user and title information.
-   **`v_user_library`**: A view for logged-in users to retrieve their collections of 'favorited', 'saved', or 'tried' recipes, identified by a `library_type` column.

## 3. RLS Strategy Summary

-   **Anonymous (`anon` role):**
    -   **`SELECT`**: Allowed on `recipes` where `status = 'published'` AND `is_free = true`. Also allowed on related content (translations, ingredients) linked to these public recipes.
    -   **`INSERT`**: Allowed on `recipe_events` ONLY if `event_type = 'view'` and `user_id` is `NULL`.
    -   **`UPDATE`/`DELETE`**: Denied everywhere.
-   **Authenticated User (`authenticated` role):**
    -   **`SELECT`**: Can see all `published` recipes, plus their own `draft`, `pending`, or `rejected` recipes (`owner_user_id = auth.uid()`).
    -   **`INSERT`**: Can create `favorites`, `saved_recipes`, `tried_recipes`, and `comments` for themselves. Can create `recipes` which default to `status = 'pending'`.
    -   **`UPDATE`**: Can edit their own `draft` or `rejected` recipes. Can edit their own comments.
    -   **`DELETE`**: Can delete their own engagement records (e.g., unfavorite) and comments.
-   **Admin (`admin` role, via `user_roles`):**
    -   **Bypasses RLS**: Admins have full access to read all data.
    -   **`UPDATE`**: Can update any recipe's `status` (to approve/reject). Can update any comment's `is_hidden` flag.
    -   This is implemented via security invoker functions or by checking the user's role within RLS policies. For simplicity, our RLS policies will contain checks like `is_admin(auth.uid())`.
