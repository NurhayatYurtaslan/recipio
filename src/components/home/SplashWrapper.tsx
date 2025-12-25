'use client';

import { useEffect, useState } from 'react';
import { SplashScreen } from '@/components/core/SplashScreen';

interface SplashWrapperProps {
    children: React.ReactNode;
}

export function SplashWrapper({ children }: SplashWrapperProps) {
    const [showSplash, setShowSplash] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSplashComplete = () => {
        setShowSplash(false);
    };

    // Client-side render bekle
    if (!isClient) {
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

    // Splash göster
    if (showSplash) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    // Home içeriği
    return <>{children}</>;
}

