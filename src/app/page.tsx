'use client';

import { useEffect, useState } from 'react';
import { SplashScreen } from '@/components/core/SplashScreen';

export default function HomePage() {
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
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: '1rem',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
          fontWeight: 'bold',
          color: '#000000',
          textAlign: 'center',
        }}
      >
        Create Web Site — Session I via W-OSS
      </h1>
    </div>
  );
}
