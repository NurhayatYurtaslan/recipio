'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LocaleLoadingView } from '@/components/i18n/LocaleLoadingView';

const LOCALES = ['tr', 'en'] as const;

function LocaleSwitchingContent() {
    const searchParams = useSearchParams();
    const locale = searchParams.get('locale');
    const next = searchParams.get('next') || '/';

    useEffect(() => {
        if (!locale || !LOCALES.includes(locale as (typeof LOCALES)[number])) {
            const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
            window.location.href = base + next;
            return;
        }
        const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const path = base && base !== '' ? base : '/';
        document.cookie = `NEXT_LOCALE=${locale};path=${path};max-age=31536000;SameSite=Lax`;
        window.location.href = base + next;
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
