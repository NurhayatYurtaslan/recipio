'use client';

import { SplashScreen } from '@/components/core/SplashScreen';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  const handleSplashComplete = () => {
    router.push('/');
  };

  return <SplashScreen onComplete={handleSplashComplete} />;
}

