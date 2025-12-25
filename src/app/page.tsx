import { getFeaturedRecipes, getCategories } from '@/lib/db/public';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import { HomeHero } from '@/components/home/HomeHero';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedRecipesSection } from '@/components/home/FeaturedRecipesSection';
import { SplashWrapper } from '@/components/home/SplashWrapper';
import { getLocale } from 'next-intl/server';

export default async function HomePage() {
    const locale = await getLocale();
    
    let featuredRecipes = [];
    let categories = [];
    
    try {
        featuredRecipes = await getFeaturedRecipes(6, locale);
    } catch (error) {
        console.error('Error fetching featured recipes:', error);
    }
    
    try {
        categories = await getCategories(locale);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }

    return (
        <SplashWrapper>
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
        </SplashWrapper>
    );
}
