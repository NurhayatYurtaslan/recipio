'use client';

import { useEffect, useState } from 'react';
import { SplashScreen } from '@/components/core/SplashScreen';

const SPLASH_SHOWN_KEY = 'recipio_splash_shown';

interface SplashWrapperProps {
    children: React.ReactNode;
}

/** Splash yalnızca web sitesi bu oturumda ilk açıldığında gösterilir; sonraki sayfa yüklemelerinde veya ana sayfaya dönüşlerde gösterilmez. */
export function SplashWrapper({ children }: SplashWrapperProps) {
    const [showSplash, setShowSplash] = useState<boolean | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const alreadyShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);
        setShowSplash(alreadyShown ? false : true);
    }, []);

    const handleSplashComplete = () => {
        if (typeof window !== 'undefined') sessionStorage.setItem(SPLASH_SHOWN_KEY, '1');
        setShowSplash(false);
    };

    // Karar verilene kadar kısa boş alan (hydration)
    if (showSplash === null) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#ffffff',
                }}
            />
        );
    }

    if (showSplash) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    return <>{children}</>;
}

