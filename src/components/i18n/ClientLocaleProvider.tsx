'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';

type Locale = 'tr' | 'en';

const LOCALE_COOKIE = 'NEXT_LOCALE';
const LOCALES: Locale[] = ['tr', 'en'];
const DEFAULT_LOCALE: Locale = 'tr';

function getLocaleFromCookie(): Locale {
    if (typeof document === 'undefined') return DEFAULT_LOCALE;
    const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
    const value = match ? decodeURIComponent(match[1]) : '';
    return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

function setLocaleCookie(locale: string) {
    const basePath = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH;
    const path = basePath && basePath !== '' ? basePath : '/';
    document.cookie = `${LOCALE_COOKIE}=${locale};path=${path};max-age=31536000;SameSite=Lax`;
}

type ClientLocaleContextValue = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
};

const ClientLocaleContext = createContext<ClientLocaleContextValue | null>(null);

export function useClientLocale() {
    const ctx = useContext(ClientLocaleContext);
    if (!ctx) throw new Error('useClientLocale must be used within ClientLocaleProvider');
    return ctx;
}

interface ClientLocaleProviderProps {
    initialLocale: Locale;
    initialMessages: AbstractIntlMessages;
    messages: { en: AbstractIntlMessages; tr: AbstractIntlMessages };
    children: React.ReactNode;
}

export function ClientLocaleProvider({ initialLocale, initialMessages, messages, children }: ClientLocaleProviderProps) {
    // Tek kaynak: sunucu initialLocale (cookie'den) + mount'ta cookie tekrar okunur; dil değişince /locale-switching ile full reload yapıldığı için tüm site güncellenir.
    const [locale, setLocaleState] = useState<Locale>(initialLocale);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const fromCookie = getLocaleFromCookie();
        setLocaleState(fromCookie);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.lang = locale;
    }, [mounted, locale]);

    const setLocale = useCallback((next: Locale) => {
        setLocaleCookie(next);
        setLocaleState(next);
    }, []);

    const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

    const messagesToUse = mounted ? (messages[locale] ?? messages[DEFAULT_LOCALE]) : initialMessages;
    const localeToUse = mounted ? locale : initialLocale;

    return (
        <ClientLocaleContext.Provider value={value}>
            <NextIntlClientProvider key={localeToUse} locale={localeToUse} messages={messagesToUse}>
                {children}
            </NextIntlClientProvider>
        </ClientLocaleContext.Provider>
    );
}
