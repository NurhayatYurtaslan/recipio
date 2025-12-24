# Recipio: Routes and Database Queries

This document maps application routes to the database queries and views they use, based on the current implementation.

---

## Public Routes

### 1. `/` or `/home` - Home Page

**Purpose:** Display all published recipes in a grid layout.

**Components:**
- `src/app/page.tsx` or `src/app/home/page.tsx`
- `src/components/recipe/RecipeList.tsx`
- `src/components/recipe/RecipeCard.tsx`

**Queries:**
- **Component:** `RecipeList` (client-side)
- **DB View:** `v_public_recipe_cards`
- **Query:** 
  ```typescript
  supabase
    .from('v_public_recipe_cards')
    .select('*')
    .order('created_at', { ascending: false })
  ```
- **Returns:** Array of recipe cards with title, description, cover_image_url, stats, category_slug

**Server-side alternative (`src/lib/db/public.ts`):**
- `getAllPublicRecipes(filters?)`: Same query with optional filters (category, search, limit, offset)

---

### 2. `/recipes/[id]` - Recipe Detail Page

**Purpose:** Show a single recipe with all details, variants, and steps.

**Components:**
- `src/app/recipes/[id]/page.tsx`
- `src/components/recipe/RecipeDetail.tsx`

**Queries:**
- **Component:** `RecipeDetail` (client-side)
- **DB View:** `v_recipe_detail`
- **Query:**
  ```typescript
  supabase
    .from('v_recipe_detail')
    .select('*')
    .eq('recipe_id', recipeId)
    .single()
  ```
- **Returns:** Complete recipe data including:
  - Basic info (title, description, cover_image_url)
  - Translations (TR/EN)
  - Steps (TR/EN as JSONB arrays)
  - All variants (1, 2, 3, 4 servings) with ingredients (TR/EN)
  - Stats (views, favorites, saves, etc.)
  - Categories

**Server-side alternative (`src/lib/db/public.ts`):**
- `getRecipeDetails(recipeId, locale)`: Same query with locale-based parsing
- `getIngredientsForServings(recipe, servings, locale)`: Helper to extract ingredients for specific serving size

**Additional Queries:**
- `getRecipeComments(recipeId)`: 
  ```typescript
  supabase
    .from('comments')
    .select('*, profiles:user_id(*)')
    .eq('recipe_id', recipeId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
  ```

**Mutations:**
- `trackRecipeView(recipeId, userId?)`:
  ```typescript
  supabase
    .from('views')
    .insert({ recipe_id: recipeId, user_id: userId || null })
  ```

---

## Auth Routes (Future)

### 3. `/login`, `/signup`

**Purpose:** User authentication.

**Queries:** None (Uses Supabase Auth client methods).

---

### 4. `/onboarding`

**Purpose:** First-time setup for new users.

**Mutations (`src/lib/db/user.ts` - to be created):**
- `updateUserProfile(profileData)`:
  ```typescript
  supabase
    .from('profiles')
    .update({ display_name, avatar_url, locale })
    .eq('id', auth.uid())
  ```

---

## Member Routes (Future)

### 5. `/favorites`, `/saved`, `/tried`

**Purpose:** List recipes the user has engaged with.

**Queries (`src/lib/db/user.ts` - to be created):**
- `getUserLibrary(userId, libraryType)`:
  ```typescript
  supabase
    .from('v_user_library')
    .select('*')
    .eq('user_id', userId)
    .eq('engagement_type', libraryType) // 'favorite', 'saved', or 'tried'
  ```

---

### 6. `/profile`

**Purpose:** Allow users to manage their profile information.

**Queries (`src/lib/db/user.ts` - to be created):**
- `getUserProfile(userId)`:
  ```typescript
  supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  ```

**Mutations:** `updateUserProfile()` (same as onboarding).

---

### 7. Engagement Actions (on Recipe Detail Page)

**Purpose:** Favorite, save, try, or comment on a recipe.

**Mutations (`src/lib/db/user.ts` - to be created):**

- `addFavorite(recipeId, userId)`:
  ```typescript
  supabase
    .from('favorites')
    .insert({ recipe_id: recipeId, user_id: userId })
  ```

- `removeFavorite(recipeId, userId)`:
  ```typescript
  supabase
    .from('favorites')
    .delete()
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
  ```

- `addComment(recipeId, userId, body)`:
  ```typescript
  supabase
    .from('comments')
    .insert({ recipe_id: recipeId, user_id: userId, body })
  ```

- Similar functions for `saved_recipes` and `tried_recipes`

---

## User-Generated Content (Future)

### 8. `/submit-recipe`

**Purpose:** Form for users to submit new recipes.

**Mutations (`src/lib/db/user.ts` - to be created):**
- `submitNewRecipe(recipeData)`:
  - Transaction that inserts into:
    1. `recipes` (with `status = 'pending'`, `user_id = auth.uid()`)
    2. `recipe_translations` (TR/EN)
    3. `recipe_variants` (1, 2, 3, 4 servings)
    4. `recipe_variant_ingredients` (for each variant)
    5. `recipe_steps` (TR/EN)
    6. `recipe_categories` (many-to-many)

---

## Admin Routes (Future)

### 9. `/admin/recipes`

**Purpose:** List recipes awaiting moderation.

**Queries (`src/lib/db/admin.ts` - to be created):**
- `getPendingRecipes()`:
  ```typescript
  supabase
    .from('v_admin_pending_recipes')
    .select('*')
    .order('created_at', { ascending: false })
  ```

---

### 10. `/admin/recipes/[id]`

**Purpose:** Review a specific pending recipe and approve or reject it.

**Queries:**
- Uses `getRecipeDetails()` to display recipe content.

**Mutations (`src/lib/db/admin.ts` - to be created):**
- `updateRecipeStatus(recipeId, newStatus)`:
  ```typescript
  supabase
    .from('recipes')
    .update({ status: newStatus })
    .eq('id', recipeId)
  ```
  - Requires admin role (checked by RLS)

- `hideComment(commentId)`:
  ```typescript
  supabase
    .from('comments')
    .update({ is_hidden: true })
    .eq('id', commentId)
  ```

---

## Query Patterns

### Single Query Pattern (Recommended)

For recipe detail pages, use `v_recipe_detail` view to get everything in one query:

```typescript
const { data } = await supabase
  .from('v_recipe_detail')
  .select('*')
  .eq('recipe_id', id)
  .single();

// Parse JSONB fields
const recipe = {
  ...data,
  title: locale === 'tr' ? data.title_tr : data.title_en,
  steps: locale === 'tr' ? data.steps_tr_json : data.steps_en_json,
  variants: data.variants_with_ingredients.map(v => ({
    servings: v.servings,
    ingredients: locale === 'tr' ? v.ingredients_tr : v.ingredients_en
  }))
};
```

### Filtering Pattern

For recipe lists with filters:

```typescript
let query = supabase
  .from('v_public_recipe_cards')
  .select('*')
  .order('created_at', { ascending: false });

if (category) {
  query = query.eq('category_slug', category);
}

if (search) {
  query = query.ilike('title', `%${search}%`);
}

const { data } = await query;
```

### Engagement Pattern

For user engagements (favorite, save, try):

```typescript
// Add engagement
await supabase
  .from('favorites')
  .insert({ recipe_id, user_id });

// Remove engagement
await supabase
  .from('favorites')
  .delete()
  .eq('recipe_id', recipeId)
  .eq('user_id', userId);

// Check if engaged
const { data } = await supabase
  .from('favorites')
  .select('recipe_id')
  .eq('recipe_id', recipeId)
  .eq('user_id', userId)
  .single();
```

---

## Current Implementation Status

✅ **Implemented:**
- Home page with recipe list (`RecipeList`, `RecipeCard`)
- Recipe detail page (`RecipeDetail`)
- Supabase client setup (`browser.ts`, `server.ts`)
- Public query functions (`getAllPublicRecipes`, `getRecipeDetails`, `getRecipeComments`, `trackRecipeView`)

🚧 **To be implemented:**
- Auth routes (login, signup, onboarding)
- User library routes (favorites, saved, tried)
- Profile management
- Recipe submission form
- Admin dashboard
- User engagement actions (favorite, save, try buttons)

---

## Notes

1. **Client vs Server Components:**
   - `RecipeList` and `RecipeDetail` are client components (use `createClient` from `browser.ts`)
   - Server-side functions use `createClient` from `server.ts` with cookies

2. **View Usage:**
   - Always use views (`v_public_recipe_cards`, `v_recipe_detail`) instead of querying tables directly
   - Views handle RLS automatically and provide optimized data structures

3. **Performance:**
   - `v_recipe_detail` returns all data in one query (no N+1 problems)
   - Stats are pre-aggregated in `recipe_stats` table (updated via triggers)
   - Use indexes for filtering (category_slug, status, etc.)

4. **RLS:**
   - All queries respect RLS policies automatically
   - Anonymous users can only see `published` AND `is_free` recipes
   - Authenticated users can see all `published` recipes
   - Users can only modify their own data (except admins)
