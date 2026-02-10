import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['tr', 'en'] as const;
export const defaultLocale = 'tr';

export default getRequestConfig(async () => {
    let locale = defaultLocale;
    // Skip cookies during static export (build) so pages can be pre-rendered
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
        try {
            const cookieStore = await cookies();
            const localeCookie = cookieStore.get('NEXT_LOCALE');
            if (localeCookie && locales.includes(localeCookie.value as any)) {
                locale = localeCookie.value;
            }
        } catch {
            // Use default locale if cookie read fails
        }
    }
    return {
        locale,
        messages: (await import(`./localizations/${locale}.json`)).default
    };
});
