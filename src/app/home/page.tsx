import { getFeaturedRecipes, getCategories } from '@/lib/db/public';
import { RecipeList } from '@/components/recipe/RecipeList';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import { HomeHero } from '@/components/home/HomeHero';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedRecipesSection } from '@/components/home/FeaturedRecipesSection';
import { getLocale } from 'next-intl/server';

export default async function HomePage() {
    const locale = await getLocale();
    const featuredRecipes = await getFeaturedRecipes(6);
    const categories = await getCategories(locale);

    return (
        <Providers>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <HomeHero />
                    <CategorySection categories={categories} locale={locale} />
                    <FeaturedRecipesSection initialRecipes={featuredRecipes} locale={locale} />
                </main>
                <Footer />
            </div>
        </Providers>
    );
}
