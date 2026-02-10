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
-   **`components/category/`**: Components related to category pages.
    -   `CategoryHeader.tsx`: Category header with image, name, and description (optional).
-   **`components/ui/`**: Generic, reusable UI elements (inspired by shadcn/ui).
    -   `Button.tsx`
    -   `Card.tsx`
    -   `Input.tsx`
    -   `ThemeToggle.tsx`
-   **`components/user/`**: User-specific components.
    -   `ProfileForm.tsx`: Edit user profile form.
    -   `ProfileHeader.tsx`: Profile header with avatar, name, and email.
    -   `ProfileStats.tsx`: Display user statistics (favorites, saved, tried counts).
    -   `SavedRecipesSection.tsx`: Grid display of user's saved recipes.
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

## 4. Category Page Design & Implementation

### 4.1 Category Page Overview (`/categories/[slug]`)

**Purpose:**
- Display all recipes belonging to a specific category
- Show category information (name, description, image)
- Provide breadcrumb navigation back to home
- Allow users to browse recipes filtered by category

**Access Control:**
- Public route: Accessible to all users (anonymous and authenticated)
- No authentication required

### 4.2 Category Page Layout

**Page Structure:**
1. **Category Header Section:**
   - Category image (if available)
   - Category name (localized)
   - Category description (if available)
   - Breadcrumb navigation (Home > Categories > [Category Name])

2. **Recipes Grid Section:**
   - Grid layout of recipe cards using `RecipeCard` component
   - Shows all published recipes in this category
   - Uses `RecipeList` component for consistency
   - Empty state message if no recipes found
   - Pagination or infinite scroll for large lists

3. **Page Metadata:**
   - SEO-friendly title: "[Category Name] Recipes - Recipio"
   - Meta description from category description

### 4.3 Data Flow & Queries

**Category Information Query:**
```typescript
// Get category by slug
const category = await getCategoryBySlug(slug, locale);

// Returns:
// {
//   category_id: number,
//   locale: string,
//   name: string,
//   description: string | null,
//   categories: {
//     slug: string,
//     image_url: string | null
//   }
// }
```

**Category Recipes Query:**
```typescript
// Get recipes for category
const recipes = await getAllPublicRecipes({
  category: slug,
  limit: 20,
  offset: 0
});

// Uses existing v_public_recipe_cards view
// Filters by category_slug field
```

**Implementation:**
- Server component fetches category info and initial recipes
- Client component (`RecipeList`) handles filtering and pagination
- Uses existing `v_public_recipe_cards` view with `category_slug` filter

### 4.4 Component Structure

**Files to Create:**
- `src/app/categories/[slug]/page.tsx` - Category page (server component)
- `src/components/category/CategoryHeader.tsx` - Category header with image, name, description (optional)

**Component Hierarchy:**
```
CategoryPage (server)
├── CategoryHeader (client, optional)
│   ├── Category Image
│   ├── Category Name
│   └── Category Description
└── RecipeList (client)
    └── RecipeCard[] (grid, filtered by category)
```

### 4.5 UI/UX Design

**Design Principles:**
- Consistent with app's minimalist black/white + accent color theme
- Category header matches homepage category card style
- Responsive grid layout for recipes
- Clear visual hierarchy (header → recipes)
- Loading states for async data fetching
- Error handling with user-friendly messages (404 if category not found)

**Navigation:**
- Update `CategorySection` component to link to `/categories/[slug]` instead of `/recipes?category=[slug]`
- Breadcrumb navigation: Home > Categories > [Category Name]

**Translation Keys Required:**
```json
{
  "CategoryPage": {
    "title": "{categoryName} Tarifleri",
    "noRecipes": "Bu kategoride henüz tarif bulunmamaktadır.",
    "backToCategories": "Kategorilere Dön",
    "recipesInCategory": "{count} tarif bulundu",
    "categoryNotFound": "Kategori bulunamadı"
  }
}
```

### 4.6 Implementation Details

**Route Structure:**
- Dynamic route: `/categories/[slug]`
- Slug comes from `categories.slug` field
- Locale-aware: Category name/description based on user's locale preference

**Error Handling:**
- 404 page if category slug doesn't exist
- Empty state if category exists but has no recipes
- Fallback to default locale if translation not available

**SEO Considerations:**
- Dynamic meta title: "[Category Name] Recipes - Recipio"
- Meta description from category description
- Structured data for category pages (optional, future enhancement)

### 4.7 Supabase Integration

**Database Views:**
- ✅ `v_public_recipe_cards` - Already includes `category_slug` field for filtering
- ✅ `categories` table - Stores category slugs
- ✅ `category_translations` table - Stores localized category names/descriptions

**Query Functions (`src/lib/db/public.ts`):**
- ✅ `getAllPublicRecipes(filters?)` - Supports category filtering via `category_slug`
- ✅ `getCategoryBySlug(slug, locale)` - New function to get category info by slug

**No Additional Migrations Required:**
- All necessary database structures already exist
- `v_public_recipe_cards` view already includes `category_slug` field
- Category filtering works with existing view structure

### 4.8 Implementation Status

**Completed:**
- ✅ Database schema for categories (categories, category_translations tables)
- ✅ `v_public_recipe_cards` view includes `category_slug` field
- ✅ `getAllPublicRecipes()` function supports category filtering
- ✅ `getCategoryBySlug()` function added to `public.ts`

**To Be Implemented:**
- ⏳ Category page component (`/categories/[slug]/page.tsx`)
- ⏳ Category header component (optional)
- ⏳ Update `CategorySection` component (`src/components/home/CategorySection.tsx`)
  - Change link from `href={`/recipes?category=${category.categories.slug}`}` 
  - To: `href={`/categories/${category.categories.slug}`}`
- ⏳ Translation keys for category page
- ⏳ 404 handling for invalid category slugs
- ⏳ Breadcrumb navigation component

**Key Features:**
- ✅ All recipes filtered by category using existing database view
- ✅ Category information displayed with localized name/description
- ✅ Consistent UI with homepage recipe grid
- ✅ SEO-friendly URLs (`/categories/soups` instead of `/recipes?category=soups`)

## 5. Profile Page Design & Implementation

### 4.1 Profile Page Overview (`/profile`)

**Purpose:**
- Display user's profile information (display name, email, avatar, locale preference)
- Allow users to edit their profile information
- Show user's saved recipes ("Kayıtlı Tariflerim" section)
- Display user statistics (total favorites, saved recipes, tried recipes)

**Access Control:**
- Protected route: Only accessible to authenticated users
- Users can only view/edit their own profile
- Redirect to `/login` if not authenticated

### 4.2 Profile Page Layout

**Page Structure:**
1. **Profile Header Section:**
   - Avatar image (editable, with upload functionality - future)
   - Display name (editable)
   - Email address (read-only, from auth.users)
   - Account creation date
   - Locale preference selector (TR/EN)

2. **Profile Statistics Section:**
   - Total favorites count
   - Total saved recipes count
   - Total tried recipes count
   - Total comments made

3. **Saved Recipes Section ("Kayıtlı Tariflerim"):**
   - Grid layout of saved recipe cards
   - Uses `RecipeCard` component for consistency
   - Shows recipe title, image, description, stats
   - Clickable cards that navigate to recipe detail page
   - Empty state message if no saved recipes
   - Pagination or infinite scroll for large lists

4. **Profile Edit Form:**
   - Inline editing or modal form
   - Fields: display_name, avatar_url, locale
   - Save/Cancel buttons
   - Success/error feedback

### 4.3 Data Flow & Queries

**Profile Data Query:**
```typescript
// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Get user email from auth (separate query or from session)
const { data: { user } } = await supabase.auth.getUser();
const email = user?.email;
```

**Saved Recipes Query:**
```typescript
// Get user's saved recipes
const { data: savedRecipes } = await supabase
  .from('v_user_library')
  .select('*')
  .eq('user_id', userId)
  .eq('engagement_type', 'saved')
  .order('engaged_at', { ascending: false });
```

**User Statistics Query:**
```typescript
// Get user engagement counts
const [favorites, saved, tried] = await Promise.all([
  supabase.from('favorites').select('recipe_id', { count: 'exact' }).eq('user_id', userId),
  supabase.from('saved_recipes').select('recipe_id', { count: 'exact' }).eq('user_id', userId),
  supabase.from('tried_recipes').select('recipe_id', { count: 'exact' }).eq('user_id', userId)
]);
```

**Profile Update Mutation:**
```typescript
// Update user profile
const { data, error } = await supabase
  .from('profiles')
  .update({ display_name, avatar_url, locale })
  .eq('id', userId)
  .select()
  .single();
```

### 4.4 Component Structure

**Files to Create:**
- `src/app/profile/page.tsx` - Profile page (server component)
- `src/components/user/ProfileHeader.tsx` - Profile header with avatar and name
- `src/components/user/ProfileStats.tsx` - Statistics display component
- `src/components/user/SavedRecipesSection.tsx` - Saved recipes grid
- `src/components/user/ProfileForm.tsx` - Profile edit form (reusable)

**Component Hierarchy:**
```
ProfilePage (server)
├── ProfileHeader (client)
│   ├── Avatar (editable)
│   ├── Display Name (editable)
│   └── Email (read-only)
├── ProfileStats (client)
│   ├── Favorites Count
│   ├── Saved Count
│   ├── Tried Count
│   └── Comments Count
└── SavedRecipesSection (client)
    └── RecipeCard[] (grid)
```

### 4.5 UI/UX Design

**Design Principles:**
- Consistent with app's minimalist black/white + accent color theme
- Responsive grid layout for saved recipes
- Clear visual hierarchy (header → stats → recipes)
- Loading states for async data fetching
- Error handling with user-friendly messages
- Success feedback after profile updates

**Translation Keys Required:**
```json
{
  "Profile": {
    "title": "Profil",
    "editProfile": "Profili Düzenle",
    "saveChanges": "Değişiklikleri Kaydet",
    "cancel": "İptal",
    "displayName": "Görünen İsim",
    "email": "E-posta",
    "locale": "Dil Tercihi",
    "memberSince": "Üyelik Tarihi",
    "statistics": "İstatistikler",
    "favorites": "Favoriler",
    "savedRecipes": "Kayıtlı Tarifler",
    "triedRecipes": "Denenen Tarifler",
    "comments": "Yorumlar",
    "savedRecipesTitle": "Kayıtlı Tariflerim",
    "noSavedRecipes": "Henüz kayıtlı tarifiniz yok.",
    "profileUpdated": "Profil başarıyla güncellendi.",
    "profileUpdateError": "Profil güncellenirken bir hata oluştu."
  }
}
```

### 4.6 Implementation Details

**Authentication Check:**
- Server component checks authentication status
- Redirects to `/login` if not authenticated
- Passes user data to client components

**Data Fetching:**
- Server-side data fetching for initial load
- Client-side refetching after mutations
- Optimistic updates for better UX

**State Management:**
- Form state managed with React hooks
- Loading states for async operations
- Error states for error handling

**RLS Policy Compliance:**
- All queries respect RLS policies
- Users can only query their own data
- Profile updates only allowed for own profile

### 4.7 Supabase Integration

**Database Views:**
- ✅ `v_user_library` - Used for saved recipes (includes user_id, engagement_type)
- ✅ `profiles` table - Stores user profile data
- ✅ RLS policies ensure users can only access their own data

**Required Migrations:**
- ✅ `0005_fix_user_library_view.sql` - Adds user_id to v_user_library view for proper filtering
  - Includes user_id field for filtering user's own recipes
  - Adds description fields (en/tr) for recipe cards
  - Adds category_slug for filtering/display
  - View automatically respects RLS policies from underlying tables (favorites, saved_recipes, tried_recipes)

**Query Functions (`src/lib/db/user.ts` - to be created):**
```typescript
// Get user profile
export async function getUserProfile(userId: string)

// Update user profile
export async function updateUserProfile(userId: string, data: ProfileUpdate)

// Get user's saved recipes
export async function getUserSavedRecipes(userId: string, locale?: string)

// Get user statistics
export async function getUserStats(userId: string)
```

### 4.8 Implementation Status

**Completed:**
- ✅ Database schema for profiles table
- ✅ RLS policies for profile access
- ✅ v_user_library view (fixed to include user_id)
- ✅ Database trigger for automatic profile creation

**To Be Implemented:**
- ⏳ Profile page component (`/profile`)
- ⏳ Profile header component (`ProfileHeader.tsx`)
- ⏳ Profile statistics component (`ProfileStats.tsx`)
- ⏳ Saved recipes section component (`SavedRecipesSection.tsx`)
- ⏳ Profile edit form component (`ProfileForm.tsx`)
- ⏳ User query functions (`src/lib/db/user.ts`)
  - `getUserProfile(userId)`
  - `updateUserProfile(userId, data)`
  - `getUserSavedRecipes(userId, locale?)`
  - `getUserStats(userId)`
- ⏳ Translation keys for profile page (tr.json, en.json)
- ⏳ Route protection middleware (protect `/profile` route)

**Key Features:**
- ✅ Automatic profile creation on signup (via database trigger)
- ✅ User can view their own profile information
- ✅ User can edit display name, avatar, and locale preference
- ✅ "Kayıtlı Tariflerim" section displays all saved recipes
- ✅ User statistics (favorites, saved, tried counts)
- ✅ All data comes from Supabase (profiles table, v_user_library view)
- ✅ RLS policies ensure users can only access their own data

## 5. Data Model & State Flow

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
