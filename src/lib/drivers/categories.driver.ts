// Categories Driver - Manages category data and provides UI-ready data structures
// Server-only: Uses next/headers, should only be used in Server Components
import { getCategories, type CategoryInfo } from '@/lib/db/public';
import { transformCategoryToCardData, type CategoryCardData } from '@/lib/utils/category-helpers';

export type { CategoryCardData };

export interface CategoriesPageData {
    categories: CategoryCardData[];
    totalCount: number;
}

/**
 * Driver for managing category data
 * Provides a clean interface for fetching and transforming category data
 * NOTE: This driver is server-only and should only be used in Server Components
 */
export class CategoriesDriver {
    /**
     * Fetch all categories for a given locale
     */
    static async fetchCategories(locale: string = 'en'): Promise<CategoryInfo[]> {
        return getCategories(locale);
    }

    /**
     * Transform category data into UI-ready card data
     * @deprecated Use transformCategoryToCardData from '@/lib/utils/category-helpers' in client components
     */
    static transformToCardData(categories: CategoryInfo[]): CategoryCardData[] {
        return transformCategoryToCardData(categories);
    }

    /**
     * Get page data for categories listing page
     */
    static async getCategoriesPageData(locale: string = 'en'): Promise<CategoriesPageData> {
        const categories = await this.fetchCategories(locale);
        const cardData = transformCategoryToCardData(categories);

        return {
            categories: cardData,
            totalCount: cardData.length,
        };
    }

    /**
     * Get featured categories (first N categories)
     */
    static async getFeaturedCategories(
        limit: number = 6,
        locale: string = 'en'
    ): Promise<CategoryCardData[]> {
        const categories = await this.fetchCategories(locale);
        const cardData = transformCategoryToCardData(categories);
        return cardData.slice(0, limit);
    }
}
