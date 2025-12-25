import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Cookie-based locale - just pass through
  return NextResponse.next();
}

export const config = {
  // Match all paths except static files and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};