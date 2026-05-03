import { NextResponse } from 'next/server';
import { ensureInitialized } from '@/lib/db';

export async function middleware(request) {
  await ensureInitialized();
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};