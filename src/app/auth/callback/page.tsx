'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string>('Signing you in…');

  useEffect(() => {
    const code = searchParams.get('code');
    const next = searchParams.get('next') || '/home';

    if (!code) {
      router.replace('/login');
      return;
    }

    const supabase = createClient();
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ data, error }) => {
        if (error) {
          console.error('[auth/callback] exchangeCodeForSession error:', error.message);
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
        if (!data.session) {
          router.replace('/login');
          return;
        }
        router.replace(next);
      })
      .catch((err) => {
        console.error('[auth/callback]', err);
        setMessage('Something went wrong.');
        router.replace(`/login?error=${encodeURIComponent(String(err))}`);
      });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
