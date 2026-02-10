import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (!code) {
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Route Handler'da set yapılamıyorsa middleware session yeniler
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    )
  }

  if (!data.session) {
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', data.session.user.id)
    .single()

  const redirectPath = profile?.display_name ? next : '/onboarding'
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
}
