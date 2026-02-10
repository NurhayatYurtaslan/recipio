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
    -   `RecipeCard.tsx`: ✅ Compact card for recipe lists (displays title, description, image, stats, category).
    -   `RecipeDetail.tsx`: ✅ Full recipe page view (includes servings selector, ingredients list, steps).
    -   `RecipeList.tsx`: ✅ Grid layout component that fetches and displays recipes from `v_public_recipe_cards`.
    -   `RecipeForm.tsx`: Form for submitting/editing recipes (UGC) - to be created.
    -   `ServingsStepper.tsx`: ✅ Integrated into `RecipeDetail` as a dropdown selector.
    -   `IngredientsList.tsx`: ✅ Integrated into `RecipeDetail` component.
    -   `StepsList.tsx`: ✅ Integrated into `RecipeDetail` component.
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

## 3. Authentication Design & Implementation

### 3.1 Login Page (`/login`)

**Design:**
- Minimalist, centered card layout matching the app's black/white + accent color theme
- Form fields:
  - Email input (required, email validation)
  - Password input (required, type="password")
  - "Remember me" checkbox (optional)
  - Submit button (primary action)
- Error handling: Display Supabase auth errors in a user-friendly way
- Loading state: Show loading indicator during authentication
- Success: Redirect to `/onboarding` for new users or `/home` for returning users

**Implementation Details:**
- Uses Supabase `signInWithPassword()` method from `@supabase/auth-helpers-nextjs`
- Client component (`'use client'`) for form interactivity
- Form validation using HTML5 validation + custom error messages
- i18n support: All text strings from translation files (`tr.json`, `en.json`)
- Responsive design: Mobile-first, works on all screen sizes

**Translation Keys Required:**
```json
{
  "Auth": {
    "login": "Giriş Yap",
    "email": "E-posta",
    "password": "Şifre",
    "rememberMe": "Beni hatırla",
    "forgotPassword": "Şifremi unuttum",
    "noAccount": "Hesabın yok mu?",
    "signUp": "Kayıt Ol",
    "loginError": "Giriş başarısız",
    "invalidCredentials": "E-posta veya şifre hatalı"
  }
}
```

### 3.2 Sign Up Page (`/signup`)

**Design:**
- Located below the login form on the same page OR as a separate route
- If on same page: Toggle between login/signup modes
- If separate: Link at bottom of login page: "Eğer hesabın yoksa, Kayıt Ol" (Turkish) / "Don't have an account? Sign Up" (English)
- Form fields:
  - Email input (required, email validation)
  - Password input (required, min 6 characters, show strength indicator)
  - Confirm Password input (required, must match password)
  - Display Name input (optional, can be set during onboarding)
  - Terms & Conditions checkbox (required)
  - Submit button (primary action)

**Implementation Details:**
- Uses Supabase `signUp()` method
- Automatic profile creation via database trigger (`handle_new_user()` function)
- Email confirmation: Configure Supabase to send confirmation emails (optional, can be disabled for development)
- After successful signup: Redirect to `/onboarding` to complete profile setup
- Error handling: Display validation errors (weak password, email already exists, etc.)

**Translation Keys Required:**
```json
{
  "Auth": {
    "signUp": "Kayıt Ol",
    "confirmPassword": "Şifreyi Onayla",
    "displayName": "Görünen İsim",
    "termsAccept": "Şartları kabul ediyorum",
    "alreadyHaveAccount": "Zaten hesabın var mı?",
    "login": "Giriş Yap",
    "signUpError": "Kayıt başarısız",
    "passwordMismatch": "Şifreler eşleşmiyor",
    "passwordTooShort": "Şifre en az 6 karakter olmalı"
  }
}
```

### 3.3 Supabase Integration

**Authentication Flow:**
1. User submits login/signup form
2. Client calls Supabase auth API (`signInWithPassword()` or `signUp()`)
3. Supabase validates credentials and creates/updates session
4. Database trigger (`on_auth_user_created`) automatically creates:
   - Profile record in `public.profiles` table
   - User role record in `public.user_roles` table (default: 'user')
5. Session cookie is set via Supabase auth helpers
6. Middleware validates session on protected routes
7. Client redirects based on user state (new user → `/onboarding`, existing → `/home`)

**Required Supabase Setup:**
- ✅ Database trigger `handle_new_user()` exists (creates profile + role)
  - Automatically creates profile record when user signs up
  - Uses email as fallback for display_name if not provided in metadata
  - Sets default role as 'user' in `user_roles` table
- ✅ RLS policies for `profiles` table (users can read all, update own)
- ✅ Auth callback route: `/api/auth/callback/route.ts` (handles OAuth redirects and code exchange)
- ✅ Migration `0004_improve_user_trigger.sql` improves trigger to handle email/password signups
- ⚠️ Email templates configured in Supabase dashboard (for production)
- ⚠️ Password reset flow (optional, can be added later)

**Files to Create:**
- `src/app/login/page.tsx` - Login page component
- `src/app/signup/page.tsx` - Sign up page component (OR combined with login)
- `src/components/auth/AuthForm.tsx` - Reusable auth form component (optional)
- ✅ `src/app/api/auth/callback/route.ts` - OAuth callback handler (created)
- Update `src/localizations/tr.json` and `en.json` with auth translations

**Supabase Migrations:**
- ✅ `0001_init.sql` - Base schema with `handle_new_user()` trigger
- ✅ `0004_improve_user_trigger.sql` - Improved trigger for email/password signups

**Security Considerations:**
- All authentication happens server-side via Supabase
- Passwords are never stored in plain text (handled by Supabase)
- RLS policies ensure users can only access their own data
- Session tokens are HTTP-only cookies (handled by `@supabase/auth-helpers-nextjs`)

### 3.4 Route Protection

**Middleware Implementation:**
- Check authentication status using Supabase middleware client
- Protected routes: `/profile`, `/favorites`, `/saved`, `/submit-recipe`, `/admin/*`
- Redirect unauthenticated users to `/login` with return URL
- Allow public access to: `/`, `/recipes`, `/recipes/[id]`, `/login`, `/signup`

### 3.5 Implementation Status

**Completed:**
- ✅ Supabase client setup (browser, server, middleware)
- ✅ Database trigger for automatic profile creation
- ✅ Auth callback route for OAuth flows
- ✅ Improved trigger function for email/password signups
- ✅ RLS policies for user data protection

**To Be Implemented:**
- ⏳ Login page component (`/login`)
- ⏳ Sign up page component (`/signup`)
- ⏳ Auth form component (optional, reusable)
- ⏳ Translation keys for auth pages (tr.json, en.json)
- ⏳ Middleware updates for route protection
- ⏳ Header component updates (show user menu when logged in)
- ⏳ Logout functionality

**Design Principles:**
- All authentication data comes from Supabase (no local storage of credentials)
- Email/password authentication with optional OAuth providers
- Automatic profile creation via database trigger
- Session management via HTTP-only cookies
- Bilingual support (Turkish/English) for all auth pages

## 4. Data Model & State Flow

The database schema is designed around the core entities: `recipes`, `users`, `categories`, and `ingredients`. The key is the `recipe_variants` system.

-   **Tables:** See `docs/DB_SCHEMA.md` for the full schema.
-   **SQL Views:** The application will heavily rely on pre-defined SQL views to simplify queries, encapsulate logic, and respect RLS policies.
    -   `v_public_recipe_cards`: Powers all public recipe listing pages.
    -   `v_recipe_stats`: Aggregated statistics (view_count, favorite_count, etc.)
    -   `v_public_recipe_cards`: ✅ For recipe listing pages (homepage, recipe list) - includes title, description, stats, category.
    -   `v_recipe_detail`: ✅ Fetches ALL data for a single recipe page in ONE query - includes translations, steps, all variants (1,2,3,4 servings) with ingredients (TR/EN), stats, categories.
    -   `v_admin_pending_recipes`: For the admin moderation queue (to be implemented).
    -   `v_user_library`: For listing a user's favorited/saved recipes (to be implemented).
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
