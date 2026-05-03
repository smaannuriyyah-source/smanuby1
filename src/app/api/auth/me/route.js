import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = authenticate(request);
    if (!user) return unauthorized();

    const db = getDatabase();
    const result = await db.execute({ sql: 'SELECT id, username, name, role, created_at FROM users WHERE id = ?', args: [user.id] });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}