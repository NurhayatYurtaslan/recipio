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

    let featuredRecipes: Awaited<ReturnType<typeof getFeaturedRecipes>> = [];
    let categories: Awaited<ReturnType<typeof getCategories>> = [];

    try {
        featuredRecipes = await getFeaturedRecipes(6);
    } catch (error) {
        console.error('Error fetching featured recipes:', error);
    }

    try {
        categories = await getCategories(locale);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }

    const categoryNames = categories
        .map((c: (typeof categories)[number]) => ({
            slug: (c as { categories?: { slug?: string }; name?: string }).categories?.slug ?? '',
            name: (c as { name?: string }).name ?? '',
        }))
        .filter((c) => c.slug);

    return (
        <SplashWrapper>
            <Providers>
                <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">
                        <HomeHero />
                        <CategorySection categories={categories} locale={locale} />
                        <FeaturedRecipesSection
                            initialRecipes={featuredRecipes}
                            locale={locale}
                            categoryNames={categoryNames}
                        />
                    </main>
                    <Footer />
                </div>
            </Providers>
        </SplashWrapper>
    );
}
