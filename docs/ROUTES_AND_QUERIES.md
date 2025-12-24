# Recipio: Routes and Database Queries

This document maps application routes to the database queries and views they use.

---

## Public Routes

### 1. `/(locale)/` - Home Page

-   **Purpose:** Display featured recipes, categories, and a search bar.
-   **Queries (`src/lib/db/public.ts`):**
    -   `getFeaturedRecipes()`:
        -   **DB View:** `v_public_recipe_cards`
        -   **Logic:** `SELECT * FROM v_public_recipe_cards ORDER BY created_at DESC LIMIT 6`
    -   `getCategoryList()`:
        -   **DB Table:** `category_translations`
        -   **Logic:** `SELECT name, slug FROM category_translations WHERE locale = :currentLocale`

### 2. `/(locale)/recipes` - Recipe List Page

-   **Purpose:** Display all published, free recipes with filtering capabilities.
-   **Queries (`src/lib/db/public.ts`):**
    -   `getAllPublicRecipes(filters)`:
        -   **DB View:** `v_public_recipe_cards`
        -   **Logic:** `SELECT * FROM v_public_recipe_cards WHERE [filters apply]` (e.g., `category_slug = :filter_category`)

### 3. `/(locale)/recipes/[id]` - Recipe Detail Page

-   **Purpose:** Show a single recipe with all its details, including variants and steps.
-   **Queries (`src/lib/db/public.ts`):**
    -   `getRecipeDetails(id)`:
        -   **DB View:** `v_recipe_detail`
        -   **Logic:** `SELECT * FROM v_recipe_detail WHERE recipe_id = :id`
    -   `getVariantIngredients(recipeId, servings)`:
        -   **DB View:** `v_variant_ingredients`
        -   **Logic:** `SELECT * FROM v_variant_ingredients WHERE recipe_id = :recipeId AND servings = :servings`
    -   `getRecipeComments(id)`:
        -   **DB Table:** `comments` JOIN `profiles`
        -   **Logic:** `SELECT c.body, p.display_name FROM comments c JOIN profiles p ON c.user_id = p.id WHERE c.recipe_id = :id AND c.is_hidden = false`
-   **Mutations (`src/lib/db/public.ts`):**
    -   `trackView(recipeId)`:
        -   **DB Table:** `recipe_events`
        -   **Logic:** `INSERT INTO recipe_events (recipe_id, event_type) VALUES (:recipeId, 'view')`

## Auth Routes

### 4. `/(locale)/login`, `/(locale)/signup`

-   **Purpose:** User authentication.
-   **Queries:** None (Uses Supabase Auth client methods).

### 5. `/(locale)/onboarding`

-   **Purpose:** First-time setup for new users.
-   **Mutations (`src/lib/db/user.ts`):**
    -   `updateUserProfile(profileData)`:
        -   **DB Table:** `profiles`
        -   **Logic:** `UPDATE profiles SET display_name = :displayName WHERE id = auth.uid()`

## Member Routes

### 6. `/(locale)/favorites`, `/(locale)/saved`

-   **Purpose:** List recipes the user has saved to their library.
-   **Queries (`src/lib/db/user.ts`):**
    -   `getUserLibrary(userId, libraryType)`:
        -   **DB View:** `v_user_library`
        -   **Logic:** `SELECT * FROM v_user_library WHERE user_id = :userId AND library_type = :libraryType` (`'favorite'` or `'saved'`)

### 7. `/(locale)/profile`

-   **Purpose:** Allow users to manage their profile information.
-   **Queries (`src/lib/db/user.ts`):**
    -   `getUserProfile(userId)`:
        -   **DB Table:** `profiles`
        -   **Logic:** `SELECT display_name, avatar_url, locale FROM profiles WHERE id = :userId`
-   **Mutations:** `updateUserProfile()` (same as onboarding).

### 8. Engagement Actions (on Recipe Detail Page)

-   **Purpose:** Favorite, save, try, or comment on a recipe.
-   **Mutations (`src/lib/db/user.ts`):**
    -   `addFavorite(recipeId, userId)`:
        -   **DB Table:** `favorites`
        -   **Logic:** `INSERT INTO favorites (recipe_id, user_id) VALUES (:recipeId, :userId)`
    -   `addComment(recipeId, userId, body)`:
        -   **DB Table:** `comments`
        -   **Logic:** `INSERT INTO comments (recipe_id, user_id, body) VALUES (:recipeId, :userId, :body)`

## User-Generated Content (UGC)

### 9. `/(locale)/submit-recipe`

-   **Purpose:** Form for users to submit new recipes.
-   **Mutations (`src/lib/db/user.ts`):**
    -   `submitNewRecipe(recipeData)`:
        -   **DB Tables:** `recipes`, `recipe_translations`, `recipe_variants`, `recipe_variant_ingredients`, `recipe_steps`
        -   **Logic:** A transaction that:
            1.  `INSERT` into `recipes` with `status = 'pending'` and `owner_user_id = auth.uid()`.
            2.  `INSERT` into `recipe_translations`.
            3.  Loop and `INSERT` into `recipe_variants` for each serving size.
            4.  Loop and `INSERT` into `recipe_variant_ingredients` for each variant.
            5.  Loop and `INSERT` into `recipe_steps`.

## Admin Routes

### 10. `/(locale)/admin/recipes`

-   **Purpose:** List recipes awaiting moderation.
-   **Queries (`src/lib/db/admin.ts`):**
    -   `getPendingRecipes()`:
        -   **DB View:** `v_admin_pending_recipes`
        -   **Logic:** `SELECT * FROM v_admin_pending_recipes`

### 11. `/(locale)/admin/recipes/[id]`

-   **Purpose:** Review a specific pending recipe and approve or reject it.
-   **Queries:**
    -   Uses public `getRecipeDetails` and `getVariantIngredients` to display the recipe content.
-   **Mutations (`src/lib/db/admin.ts`):**
    -   `updateRecipeStatus(recipeId, newStatus)`:
        -   **DB Table:** `recipes`
        -   **Logic:** `UPDATE recipes SET status = :newStatus WHERE id = :recipeId` (requires admin privileges checked by RLS).
