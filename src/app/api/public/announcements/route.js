import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    const result = await db.execute(`
      SELECT a.*, u.name as author_name, u.username as author_username
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published'
      ORDER BY a.created_at DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ announcement: null });
    }

    return NextResponse.json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('Get public announcement error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}