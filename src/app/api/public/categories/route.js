import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    const result = await db.execute('SELECT * FROM categories ORDER BY name ASC');
    return NextResponse.json({ categories: result.rows });
  } catch (error) {
    console.error('Get public categories error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}