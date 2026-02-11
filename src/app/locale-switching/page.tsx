'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LocaleLoadingView } from '@/components/i18n/LocaleLoadingView';

const LOCALES = ['tr', 'en'] as const;

/** Loading ekranının en az gösterileceği süre (ms). Dil geçişi hissi için. */
const MIN_LOADING_MS = 2200;

function LocaleSwitchingContent() {
    const searchParams = useSearchParams();
    const locale = searchParams.get('locale');
    const next = searchParams.get('next') || '/';

    useEffect(() => {
        const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const path = base && base !== '' ? base : '/';
        const targetUrl = base + next;

        if (!locale || !LOCALES.includes(locale as (typeof LOCALES)[number])) {
            window.location.href = targetUrl;
            return;
        }

        document.cookie = `NEXT_LOCALE=${locale};path=${path};max-age=31536000;SameSite=Lax`;

        const id = setTimeout(() => {
            window.location.href = targetUrl;
        }, MIN_LOADING_MS);

        return () => clearTimeout(id);
    }, [locale, next]);

    return <LocaleLoadingView />;
}

export default function LocaleSwitchingPage() {
    return (
        <Suspense fallback={<LocaleLoadingView />}>
            <LocaleSwitchingContent />
        </Suspense>
    );
}
