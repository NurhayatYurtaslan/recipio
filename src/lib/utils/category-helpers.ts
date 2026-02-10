// Client-safe category utility functions
// These functions can be used in both client and server components

export interface CategoryCardData {
    id: number;
    name: string;
    description: string | null;
    slug: string;
    imageUrl: string | null;
    href: string;
}

export interface CategoryInput {
    category_id: number;
    locale: string;
    name: string;
    description: string | null;
    categories: {
        slug: string;
        image_url: string | null;
    };
}

/**
 * Transform category data into UI-ready card data
 * This function is client-safe and can be used in both client and server components
 */
export function transformCategoryToCardData(categories: CategoryInput[]): CategoryCardData[] {
    return categories.map((category) => ({
        id: category.category_id,
        name: category.name,
        description: category.description,
        slug: category.categories.slug,
        imageUrl: category.categories.image_url,
        href: `/categories/${category.categories.slug}`,
    }));
}
