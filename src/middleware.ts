import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple middleware - can be extended later
  return NextResponse.next();
}

export const config = {
  // Match all paths except static files and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};