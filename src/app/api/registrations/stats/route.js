import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';

export async function GET(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute('SELECT COUNT(*) as count FROM registrations');
    return NextResponse.json({ count: result.rows[0].count });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Gagal mengambil statistik' }, { status: 500 });
  }
}