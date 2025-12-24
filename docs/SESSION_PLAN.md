# Recipio: 3-Session Build Plan

This document outlines the development of the Recipio app over three distinct work sessions.

---

## Session 1: Foundation (Public-Facing App)

### Goals

-   Establish the complete database schema and populate it with seed data.
-   Set up the Next.js project with all required dependencies and configurations.
-   Implement the internationalization (i18n) framework.
-   Build all public-facing, read-only pages (`Home`, `Recipe List`, `Recipe Detail`).
-   Create a minimal, aesthetically pleasing UI based on the black/white + accent color theme.

### Files to Create/Modify

-   **Database:**
    -   `/supabase/migrations/0001_init.sql`
    -   `/supabase/migrations/0002_views.sql`
    -   `/supabase/seed/seed.sql`
    -   `/supabase/README.md`
-   **Next.js Config:**
    -   `package.json`
    -   `next.config.mjs`
    -   `tsconfig.json`
    -   `tailwind.config.ts`
-   **Core App Structure:**
    -   `src/app/[locale]/layout.tsx`
    -   `src/app/globals.css`
    -   `src/i18n.ts`, `src/middleware.ts`
    -   `src/lib/supabase/server.ts`, `browser.ts`, `middleware.ts`
    -   `src/lib/db/public.ts`
    -   `src/components/core/Providers.tsx`, `Header.tsx`, `Footer.tsx`
    -   `src/components/i18n/LanguageSwitcher.tsx`
    -   `src/components/ui/*`
-   **Feature Files:**
    -   `src/app/page.tsx` (Home - ✅ Created)
    -   `src/app/home/page.tsx` (Home alternative - ✅ Created)
    -   `src/app/recipes/[id]/page.tsx` (Detail - ✅ Created)
    -   `src/components/recipe/RecipeCard.tsx` (✅ Created)
    -   `src/components/recipe/RecipeDetail.tsx` (✅ Created - includes servings selector)
    -   `src/components/recipe/RecipeList.tsx` (✅ Created)
    -   `src/lib/db/public.ts` (✅ Created - query functions)
    -   `src/lib/supabase/browser.ts` (✅ Created - uses @supabase/supabase-js)
    -   `src/lib/supabase/server.ts` (✅ Created)

### Acceptance Criteria

-   [x] The database can be fully migrated and seeded using the Supabase CLI.
-   [x] The app runs without errors.
-   [x] The homepage displays all recipes from `v_public_recipe_cards` in a grid layout.
-   [x] The recipes list page displays all free, published recipes (via `RecipeList` component).
-   [x] The recipe detail page correctly shows title, description, steps, and stats from `v_recipe_detail`.
-   [x] The servings selector on the detail page displays the correct ingredient list from `v_recipe_detail` variants (1, 2, 3, 4 servings).
-   [ ] The language switcher correctly changes the locale in the URL and displays translated content where available, with a proper fallback.
-   [ ] A `view` event is recorded in `views` table when a recipe detail page is visited (via `trackRecipeView` function).

### Demo Script

1.  Start the app (`npm run dev`).
2.  Open `http://localhost:3000` or `http://localhost:3000/home`. The homepage should appear with recipe cards in a grid layout.
3.  ✅ Recipe cards display: title, description, cover image, stats (views, favorites), category.
4.  Click on a recipe card. Navigate to `/recipes/[id]`.
5.  ✅ The recipe detail page displays:
    - Title, description, cover image
    - Stats (views, favorites)
    - Servings selector (1, 2, 3, 4 kişilik)
    - Ingredients list (changes based on selected servings)
    - Steps list
6.  Change the servings selector (e.g., select "2 Kişilik"). The ingredients list updates automatically.
7.  ✅ Check the `views` table in Supabase; a new view record should be created when visiting a recipe detail page.
8.  (Future) Click the language switcher and select "Turkish". The URL should change to `/tr` and content should translate.

### Risks & Mitigations

-   **Risk:** SQL view logic is complex and might have performance issues.
    -   **Mitigation:** Test views with a significant amount of seed data. Use `EXPLAIN ANALYZE` in Supabase to debug slow queries.
-   **Risk:** i18n setup is tricky and can break middleware or routing.
    -   **Mitigation:** Follow the `next-intl` App Router documentation precisely. Start with a minimal middleware implementation and add complexity gradually.

---

## Session 2: Auth & User Features

### Goals

-   Integrate Supabase authentication for user login, signup, and session management.
-   Create a simple onboarding flow for new users.
-   Implement user-specific features: favorites, saved recipes, and tried recipes.
-   Build the comments section on recipe pages.
-   Build the user's profile and personal library pages.

### Files to Create/Modify

-   **DB Changes:** None (schema is complete). RLS policies for user actions will now be active.
-   **Next.js Config:**
    -   Update `src/middleware.ts` to protect user-only routes.
-   **Auth Files:**
    -   `src/app/[locale]/(auth)/login/page.tsx`
    -   `src/app/[locale]/(auth)/signup/page.tsx`
    -   `src/app/api/auth/callback/route.ts`
    -   `src/components/auth/AuthForm.tsx`
-   **Feature Files:**
    -   `src/app/[locale]/onboarding/page.tsx`
    -   `src/app/[locale]/profile/page.tsx`
    -   `src/app/[locale]/favorites/page.tsx`
    -   `src/app/[locale]/saved/page.tsx`
    -   `src/lib/db/user.ts`
    -   `src/components/user/UserActions.tsx`
    -   `src/components/user/Comments.tsx`
    -   `src/components/user/ProfileForm.tsx`

### Acceptance Criteria

-   [ ] Users can sign up for a new account and are redirected to `/onboarding`.
-   [ ] Users can log in and log out. The header UI updates to show a profile button.
-   [ ] Protected routes (e.g., `/profile`) are inaccessible to anonymous users.
-   [ ] On the recipe detail page, a logged-in user can click "Favorite", "Save", or "Try", and the action is recorded in the database.
-   [ ] A logged-in user can post a comment on a recipe.
-   [ ] The `/favorites` page displays a list of the user's favorited recipes.
-   [ ] The user can update their display name on the `/profile` page.

### Demo Script

1.  Navigate to `/en/login`. Log in with a test user account.
2.  You are redirected to the homepage. The header now shows a "Profile" button.
3.  Go to a recipe page. Click the "Favorite" heart icon. It should light up.
4.  Go to the `/en/favorites` page. The recipe you just favorited should appear there.
5.  Go back to the recipe page and add a comment. The comment should appear in the list.
6.  Navigate to `/en/profile`. Change your display name and save.
7.  Log out. Try to access `/en/profile`. You should be redirected to the login page.

### Risks & Mitigations

-   **Risk:** Managing client-side vs. server-side Supabase instances can be confusing.
    -   **Mitigation:** Strictly adhere to the official Supabase Next.js helper patterns. Use server components for data fetching wherever possible and pass data to client components as props.
-   **Risk:** RLS policies may incorrectly block legitimate user actions.
    -   **Mitigation:** Write test queries inside the Supabase SQL editor, using `set role authenticated; set request.jwt.claims...` to simulate different users and test permissions before implementing them in the app.

---

## Session 3: Admin & User-Generated Content

### Goals

-   Implement the feature for authenticated users to submit their own recipes.
-   Build the admin dashboard for reviewing and moderating submitted content.
-   Finalize the complete application loop from public viewing to user submission to admin approval.
-   Polish the UI and handle remaining edge cases.

### Files to Create/Modify

-   **DB Changes:** None (schema is complete). Admin RLS policies will now be active.
-   **Next.js Config:**
    -   Update `src/middleware.ts` to protect admin routes.
-   **Feature Files:**
    -   `src/app/[locale]/submit-recipe/page.tsx`
    -   `src/components/recipe/RecipeForm.tsx`
    -   `src/lib/db/admin.ts` (and updates to `user.ts` for submission)
    -   `src/app/[locale]/admin/page.tsx` (Dashboard)
    -   `src/app/[locale]/admin/recipes/page.tsx` (Pending List)
    -   `src/app/[locale]/admin/recipes/[id]/page.tsx` (Review)
    -   `src/components/admin/PendingRecipesList.tsx`
    -   `src/components/admin/ModerationControls.tsx`

### Acceptance Criteria

-   [ ] A logged-in user can access the `/submit-recipe` page.
-   [ ] The user can fill out the form (title, description, ingredients for variants, steps) and submit a new recipe.
-   [ ] The new recipe is created in the `recipes` table with `status = 'pending'`.
-   [ ] An admin user can navigate to `/admin/recipes` and see the pending recipe.
-   [ ] The admin can click "Approve" to change the recipe's status to `published`.
-   [ ] Once published, the recipe appears on the public recipe list page.
-   [ ] The admin can click "Reject" to change the status to `rejected`. The user who submitted it can still see it in their own list of recipes, but the public cannot.

### Demo Script

1.  Log in as a normal user. Go to `/en/submit-recipe`.
2.  Fill out the form with details for a new recipe and click "Submit".
3.  Log out and log in as an admin user (you'll need to set a user's role to 'admin' in the `user_roles` table manually).
4.  Navigate to `/en/admin/recipes`. The submitted recipe should be in the list.
5.  Click on the recipe to review it. Click the "Approve" button.
6.  Log out and navigate to the public `/en/recipes` page. The newly approved recipe should now be visible to everyone.

### Risks & Mitigations

-   **Risk:** The recipe submission form is complex with nested state for variants and ingredients.
    -   **Mitigation:** Manage form state with controlled components using `useState`. Break the form into smaller child components (`VariantInputGroup`, `IngredientRow`) to encapsulate state and logic, preventing the main form component from becoming too large.
-   **Risk:** Admin role setup could be insecure.
    -   **Mitigation:** Ensure middleware correctly checks for the 'admin' role from a trusted source (Supabase claims) before granting access to admin routes. RLS policies are the ultimate source of truth for data access.
