import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const db = getDatabase();
    const result = await db.execute(`
      SELECT d.id, d.name, d.slug, d.description, d.file_url, d.created_at, u.name as author_name
      FROM data_laporan d
      LEFT JOIN users u ON d.author_id = u.id
      WHERE d.slug = ?
    `, [params.slug]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Data laporan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data_laporan: result.rows[0] });
  } catch (error) {
    console.error('Get public data_laporan by slug error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
