import { NextResponse } from 'next/server';
import { authenticate, unauthorized } from '@/lib/auth';

export async function POST(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();
  return NextResponse.json({ message: 'Logout berhasil' });
}