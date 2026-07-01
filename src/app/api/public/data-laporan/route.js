import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    const result = await db.execute(`
      SELECT d.id, d.name, d.file_url, d.created_at, u.name as author_name
      FROM data_laporan d
      LEFT JOIN users u ON d.author_id = u.id
      ORDER BY d.created_at DESC
    `);
    return NextResponse.json({ data_laporan: result.rows });
  } catch (error) {
    console.error('Get public data_laporan error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
