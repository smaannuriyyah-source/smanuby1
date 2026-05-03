import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT a.*, u.name as author_name, c.name as category_name FROM articles a LEFT JOIN users u ON a.author_id = u.id LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ? AND a.status = 'published'`,
      args: [parseInt(params.id)]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ article: result.rows[0] });
  } catch (error) {
    console.error('Get public article error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}