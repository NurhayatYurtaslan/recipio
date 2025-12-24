# Recipio: Step-by-Step Analysis

This document provides a comprehensive analysis and build plan for the Recipio web application.

## 1. Product & Feature Breakdown

Recipio is a minimalist, bilingual (Turkish/en) recipe platform with a key differentiator: non-linear serving size variants.

-   **Public (Anonymous Users):**
    -   Browse/view a limited set of free, published recipes.
    -   Search and filter recipes.
    -   Switch between English and Turkish.
-   **Authenticated Users:**
    -   All public features.
    -   Bookmark/save recipes to a personal library.
    -   Mark recipes as "favorited".
    -   Mark recipes as "tried".
    -   Comment on recipes.
    -   Submit their own recipes for moderation.
    -   Manage their profile (display name, avatar, locale preference).
-   **Admin Users:**
    -   All user features.
    -   Review and moderate user-submitted recipes (approve, reject).
    -   Manage site content (e.g., hide inappropriate comments).
-   **Core Differentiator: Recipe Variants**
    -   Recipes are not linearly scalable. A recipe for 2 servings has a distinct ingredient list from the same recipe for 4 servings.
    -   The UI will feature a stepper (1, 2, 3, 4 servings) that fetches the appropriate variant data.
    -   Recipe steps can be shared across variants.

## 2. Component Architecture

Components will be organized by feature under `src/components/`.

-   **`components/auth/`**: Login/Signup forms, user action buttons.
-   **`components/core/`**: Core application shell components.
    -   `Header.tsx`: Top navigation bar.
    -   `Footer.tsx`: Site footer.
    -   `Providers.tsx`: Wraps the app with Theme, i18n, and Query providers.
-   **`components/i18n/`**:
    -   `LanguageSwitcher.tsx`: Dropdown to switch between `en` and `tr`.
-   **`components/layout/`**: Page layout containers and grids.
-   **`components/recipe/`**: Components related to displaying recipes.
    -   `RecipeCard.tsx`: Compact card for recipe lists.
    -   `RecipeDetail.tsx`: Full recipe page view.
    -   `RecipeForm.tsx`: Form for submitting/editing recipes (UGC).
    -   `ServingsStepper.tsx`: UI to switch between `1, 2, 3, 4` servings.
    -   `IngredientsList.tsx`: Displays ingredients for a selected variant.
    -   `StepsList.tsx`: Displays recipe steps.
-   **`components/ui/`**: Generic, reusable UI elements (inspired by shadcn/ui).
    -   `Button.tsx`
    -   `Card.tsx`
    -   `Input.tsx`
    -   `ThemeToggle.tsx`
-   **`components/user/`**: User-specific components.
    -   `ProfileForm.tsx`: Edit user profile.
    -   `UserActions.tsx`: Buttons for favorite, save, try.
    -   `Comments.tsx`: Comment display and submission form.
-   **`components/admin/`**: Components for the admin dashboard.
    -   `PendingRecipesList.tsx`: Table/list of recipes awaiting moderation.
    -   `ModerationControls.tsx`: Buttons for admin to approve/reject recipes.

## 3. Data Model & State Flow

The database schema is designed around the core entities: `recipes`, `users`, `categories`, and `ingredients`. The key is the `recipe_variants` system.

-   **Tables:** See `docs/DB_SCHEMA.md` for the full schema.
-   **SQL Views:** The application will heavily rely on pre-defined SQL views to simplify queries, encapsulate logic, and respect RLS policies.
    -   `v_public_recipe_cards`: Powers all public recipe listing pages.
    -   `v_recipe_detail`: Fetches all data for a single recipe page.
    -   `v_variant_ingredients`: Fetches ingredients for a specific serving size.
    -   `v_admin_pending_recipes`: For the admin moderation queue.
    -   `v_user_library`: For listing a user's favorited/saved recipes.
-   **RLS Strategy:**
    -   **Anon:** Can read `published` & `is_free` recipes and their related content. Can only create `view` events.
    -   **Auth User:** Can read all `published` recipes plus their own non-published ones. Can create engagement records (`favorites`, `comments`, etc.) and `pending` recipes.
    -   **Admin:** Can read/write everything.
-   **State Management:**
    -   **Server State:** Managed by `react-query` (or similar, via Next.js fetch caching) interacting with the `src/lib/db/` query layer.
    -   **Client State:** Managed by `useState` and `useContext` for simple UI state (e.g., theme, selected language, form inputs). No complex state management library is needed initially.

## 4. Step-by-Step Build Order

The project will be built in three sessions, as detailed in `docs/SESSION_PLAN.md`.

1.  **Session 1: The Foundation**
    -   Initialize Next.js project and install dependencies.
    -   Set up Supabase database schema, views, and seed data.
    -   Implement i18n scaffolding (`next-intl`).
    -   Build core layout (`Header`, `Footer`, `Providers`).
    -   Build public pages: Home, Recipe List, Recipe Detail.
    -   Implement the read-only view of recipes using the SQL views.
    -   Style the app with the minimal black/white + accent color theme.
2.  **Session 2: User Authentication & Engagement**
    -   Implement Supabase authentication (Login, Signup, Onboarding pages).
    -   Create the `src/lib/db/user.ts` query layer.
    -   Add user engagement features: favorite, save, tried buttons.
    -   Implement the comments section (view and post).
    -   Build user library pages: `/favorites`, `/saved`.
    -   Build the user profile page.
3.  **Session 3: Admin & User-Generated Content**
    -   Build the recipe submission form (`/submit-recipe`).
    -   Implement the backend logic to save submitted recipes with a `pending` status.
    -   Build the admin dashboard to view pending recipes (`v_admin_pending_recipes`).
    -   Implement admin actions to approve or reject submissions.
    -   Refine UI/UX, handle edge cases, and perform final testing.

## 5. Generated File Tree

```
.
├───docs/
│   ├───ANALYSIS.md
│   ├───DB_SCHEMA.md
│   ├───ROUTES_AND_QUERIES.md
│   └───SESSION_PLAN.md
├───public/
│   └───assets/
├───src/
│   ├───app/
│   │   ├───[locale]/
│   │   │   ├───(auth)/
│   │   │   │   ├───login/page.tsx
│   │   │   │   └───signup/page.tsx
│   │   │   ├───admin/
│   │   │   │   ├───recipes/
│   │   │   │   │   ├───[id]/page.tsx
│   │   │   │   │   └───page.tsx
│   │   │   │   └───page.tsx
│   │   │   ├───favorites/page.tsx
│   │   │   ├───onboarding/page.tsx
│   │   │   ├───profile/page.tsx
│   │   │   ├───recipes/
│   │   │   │   ├───[id]/page.tsx
│   │   │   │   └───page.tsx
│   │   │   ├───saved/page.tsx
│   │   │   ├───submit-recipe/page.tsx
│   │   │   ├───layout.tsx
│   │   │   └───page.tsx
│   │   ├───api/
│   │   │   └───auth/callback/route.ts
│   │   └───globals.css
│   ├───components/
│   │   ├───admin/
│   │   │   ├───ModerationControls.tsx
│   │   │   └───PendingRecipesList.tsx
│   │   ├───auth/
│   │   │   └───AuthForm.tsx
│   │   ├───core/
│   │   │   ├───Footer.tsx
│   │   │   ├───Header.tsx
│   │   │   └───Providers.tsx
│   │   ├───i18n/
│   │   │   └───LanguageSwitcher.tsx
│   │   ├───recipe/
│   │   │   ├───IngredientsList.tsx
│   │   │   ├───RecipeCard.tsx
│   │   │   ├───RecipeDetail.tsx
│   │   │   ├───RecipeForm.tsx
│   │   │   ├───ServingsStepper.tsx
│   │   │   └───StepsList.tsx
│   │   ├───ui/
│   │   │   ├───Button.tsx
│   │   │   ├───Card.tsx
│   │   │   ├───Input.tsx
│   │   │   └───ThemeToggle.tsx
│   │   └───user/
│   │       ├───Comments.tsx
│   │       ├───ProfileForm.tsx
│   │       └───UserActions.tsx
│   ├───data/
│   │   └───navigation.ts
│   ├───lib/
│   │   ├───db/
│   │   │   ├───admin.ts
│   │   │   ├───public.ts
│   │   │   └───user.ts
│   │   └───supabase/
│   │       ├───browser.ts
│   │       ├───middleware.ts
│   │       └───server.ts
│   ├───styles/
│   │   └───globals.css
│   ├───utils/
│   │   └───helpers.ts
│   ├───i18n.ts
│   └───middleware.ts
├───supabase/
│   ├───migrations/
│   │   ├───0001_init.sql
│   │   └───0002_views.sql
│   ├───seed/
│   │   └───seed.sql
│   └───README.md
├───.gitignore
├───next.config.mjs
├───package.json
├───postcss.config.js
├───tailwind.config.ts
└───tsconfig.json
```
