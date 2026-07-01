import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';
import { handleUpload } from '@/lib/upload';
import { MAX_FILE_SIZE } from '@/lib/config';
import { generateUniqueSlug } from '@/lib/slug';

export async function GET(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute(`
      SELECT d.*, u.name as author_name, u.username as author_username
      FROM data_laporan d LEFT JOIN users u ON d.author_id = u.id
      ORDER BY d.created_at DESC
    `);
    return NextResponse.json({ data_laporan: result.rows });
  } catch (error) {
    console.error('Get data_laporan error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const file = formData.get('file');

    if (!name) {
      return NextResponse.json({ error: 'Nama laporan harus diisi' }, { status: 400 });
    }

    let fileUrl = null;
    if (file && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });
      }
      const uploadResult = await handleUpload(file, { resourceType: 'raw', folder: 'sekolahku/files', subdir: 'files' });
      fileUrl = uploadResult.url;
    }

    const slug = await generateUniqueSlug(db, name);

    const result = await db.execute({
      sql: 'INSERT INTO data_laporan (name, slug, description, file_url, author_id) VALUES (?, ?, ?, ?, ?)',
      args: [name, slug, description || null, fileUrl, user.id]
    });

    const item = await db.execute(`
      SELECT d.*, u.name as author_name, u.username as author_username
      FROM data_laporan d LEFT JOIN users u ON d.author_id = u.id
      WHERE d.id = ?
    `, [Number(result.lastInsertRowid)]);

    return NextResponse.json({ message: 'Data laporan berhasil dibuat', data_laporan: item.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create data_laporan error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
