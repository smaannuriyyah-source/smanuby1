import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';
import { handleUpload } from '@/lib/upload';
import { MAX_FILE_SIZE } from '@/lib/config';

export async function GET(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute(`
      SELECT r.*, u.name as author_name, u.username as author_username
      FROM reports r LEFT JOIN users u ON r.author_id = u.id
      ORDER BY r.created_at DESC
    `);
    return NextResponse.json({ reports: result.rows });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const formData = await request.formData();
    const title = formData.get('title');
    const photoFile = formData.get('photo');

    if (!title) {
      return NextResponse.json({ error: 'Judul laporan harus diisi' }, { status: 400 });
    }

    let photoPath = null;
    if (photoFile && photoFile.size > 0) {
      if (photoFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });
      }
      const uploadResult = await handleUpload(photoFile);
      photoPath = uploadResult.url;
    }

    const result = await db.execute({
      sql: 'INSERT INTO reports (title, photo, author_id) VALUES (?, ?, ?)',
      args: [title, photoPath, user.id]
    });

    const report = await db.execute(`
      SELECT r.*, u.name as author_name, u.username as author_username
      FROM reports r LEFT JOIN users u ON r.author_id = u.id
      WHERE r.id = ?
    `, [Number(result.lastInsertRowid)]);

    return NextResponse.json({ message: 'Laporan berhasil dibuat', report: report.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}