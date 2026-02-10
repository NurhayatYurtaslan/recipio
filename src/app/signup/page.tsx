'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import Link from 'next/link';

export default function SignUpPage() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  const validateForm = () => {
    // Reset errors
    setError(null);
    
    // Check email format
    if (!email || !email.includes('@')) {
      setError(locale === 'tr' ? 'Geçerli bir e-posta adresi giriniz' : 'Please enter a valid email address');
      return false;
    }
    
    // Check password length
    if (!password || password.length < 6) {
      setError(t('passwordTooShort'));
      return false;
    }
    
    // Check password match
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return false;
    }
    
    // Check terms acceptance
    if (!termsAccepted) {
      const termsError = locale === 'tr' 
        ? 'Şartları kabul etmelisiniz' 
        : 'You must accept the terms and conditions';
      setError(termsError);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/72ae24f2-6fe3-4c22-a4bc-f149b3860c8b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'signup/page.tsx:62',message:'SignUp attempt started',data:{email:email.substring(0,5)+'***',hasDisplayName:!!displayName.trim()},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    try {
      const supabase = createClient();
      
      // Prepare user metadata
      // IMPORTANT: Do NOT include 'role' in metadata. User roles are automatically
      // assigned by the database trigger (handle_new_user) which always sets role to 'user'.
      // Only admins can be assigned 'admin' role manually via database update.
      const metadata: Record<string, any> = {};
      if (displayName.trim()) {
        metadata.full_name = displayName.trim();
      }
      // Explicitly ensure no role is set in metadata
      // The database trigger will always assign 'user' role regardless of metadata

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/72ae24f2-6fe3-4c22-a4bc-f149b3860c8b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'signup/page.tsx:87',message:'Before signUp call',data:{hasMetadata:Object.keys(metadata).length>0,windowOrigin:typeof window !== 'undefined' ? window.location.origin : 'undefined'},timestamp:Date.now(),runId:'run2',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      // Redirect after email confirmation: Supabase Dashboard'da "Confirm email" açıksa
      // bu URL'deki linke tıklanınca session oluşur (callback route).
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/api/auth/callback`
          : undefined

      const signUpOptions: any = {
        data: metadata,
        emailRedirectTo: redirectUrl,
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: signUpOptions,
      })

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/72ae24f2-6fe3-4c22-a4bc-f149b3860c8b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'signup/page.tsx:95',message:'After signUp call',data:{hasError:!!signUpError,errorMessage:signUpError?.message,hasUser:!!data?.user,hasSession:!!data?.session},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      if (signUpError) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/72ae24f2-6fe3-4c22-a4bc-f149b3860c8b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'signup/page.tsx:97',message:'SignUp error occurred',data:{errorCode:signUpError.status,errorMessage:signUpError.message,isRateLimit:signUpError.message?.toLowerCase().includes('rate limit')},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('[signup] Supabase error:', signUpError)
        const isRateLimit = signUpError.message?.toLowerCase().includes('rate limit')
        setError(
          isRateLimit
            ? (locale === 'tr'
                ? 'Çok fazla deneme. Biraz bekleyin veya Supabase Dashboard → Authentication → Providers → Email bölümünden "Confirm email"i kapatın (geliştirme için).'
                : 'Too many attempts. Wait a while or disable "Confirm email" in Supabase Dashboard → Authentication → Providers → Email (for development).')
            : signUpError.message || t('signUpError')
        )
        setLoading(false)
        return
      }

      if (!data) {
        setError(t('signUpError') + ' (no response)')
        setLoading(false)
        return
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required - show success message
        setSuccess(t('emailConfirmationRequired'));
        setLoading(false);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        return;
      }

      if (data.user && data.session) {
        // Session created successfully - redirect to home (onboarding page doesn't exist yet)
        router.push('/home');
        router.refresh();
      }
    } catch (err: any) {
      console.error('[signup] Error:', err)
      const message =
        err?.message ||
        (typeof err === 'string' ? err : null) ||
        t('signUpError')
      setError(message)
      setLoading(false)
    } finally {
      // Ensure loading is set to false even if something goes wrong
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
                {t('createAccount')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('signUp')}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                    {success}
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
                  <label htmlFor="displayName" className="text-sm font-medium">
                    {t('displayName')} <span className="text-muted-foreground text-xs">(Optional)</span>
                  </label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder={t('displayName')}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      // Clear error when user starts typing
                      if (error && error === t('passwordTooShort')) {
                        setError(null);
                      }
                    }}
                    required
                    disabled={loading}
                    className="w-full"
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('passwordTooShort')}
                  </p>
                  {password && password.length > 0 && password.length < 6 && (
                    <p className="text-xs text-red-500">
                      {t('passwordTooShort')}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    {t('confirmPassword')}
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('confirmPassword')}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      // Clear error when user starts typing
                      if (error && error === t('passwordMismatch')) {
                        setError(null);
                      }
                    }}
                    required
                    disabled={loading}
                    className="w-full"
                  />
                  {confirmPassword && password && confirmPassword !== password && (
                    <p className="text-xs text-red-500">
                      {t('passwordMismatch')}
                    </p>
                  )}
                </div>
                <div className="flex items-start space-x-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    disabled={loading}
                    required
                    className="h-4 w-4 rounded border-gray-300 mt-1"
                  />
                  <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                    {t('termsAccept')}
                  </label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? t('signingUp') : t('signUp')}
                </Button>
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    {t('login')}
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
