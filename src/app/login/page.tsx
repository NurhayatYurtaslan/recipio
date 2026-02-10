'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import Link from 'next/link';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCheckingAuth(false);
      if (session) {
        router.replace('/home');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || t('invalidCredentials'));
        setLoading(false);
        return;
      }

      if (data.user && data.session) {
        // Session created successfully - redirect to home page
        router.push('/home');
        router.refresh();
      } else if (data.user && !data.session) {
        // User exists but no session - might need email confirmation
        setError(t('emailConfirmationRequired') || 'Please confirm your email before signing in.');
        setLoading(false);
      }
    } catch (err) {
      setError(t('loginError'));
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <Providers>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">...</p>
          </main>
        </div>
      </Providers>
    );
  }

  return (
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {t('welcomeBack')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('loginToAccount')}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t('email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    {t('password')}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="remember" className="text-sm font-medium cursor-pointer">
                    {t('rememberMe')}
                  </label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? t('signingIn') : t('login')}
                </Button>
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">{t('noAccount')} </span>
                  <Link href="/signup" className="text-primary hover:underline font-medium">
                    {t('signUp')}
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
