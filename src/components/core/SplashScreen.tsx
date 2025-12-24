'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 2 saniye sonra fade out başlat
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // 2.5 saniye sonra tamamlandı
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: '#000000',
            marginBottom: '1rem',
          }}
        >
          🍳 Recipio
        </h1>
        <p
          style={{
            fontSize: '1.5rem',
            color: '#666666',
          }}
        >
          Recipe Website
        </p>
      </div>
    </div>
  );
}
