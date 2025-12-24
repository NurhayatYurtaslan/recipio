import { getFeaturedRecipes } from "@/lib/db/public";
import { useTranslations } from 'next-intl';
import Link from "next/link";

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('HomePage');
  const featuredRecipes = await getFeaturedRecipes();

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-8">{t('featuredRecipes')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredRecipes.map((recipe: any) => (
          <Link href={`/recipes/${recipe.recipe_id}`} key={recipe.recipe_id} className="border rounded-lg overflow-hidden group">
            <div className="w-full h-48 bg-gray-200 overflow-hidden">
              <img 
                src={recipe.cover_image_url} 
                alt={locale === 'en' ? recipe.title_en : recipe.title_tr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{locale === 'en' ? recipe.title_en : recipe.title_tr}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
