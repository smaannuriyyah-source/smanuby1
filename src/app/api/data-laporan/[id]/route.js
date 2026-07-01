import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';
import { handleUpload } from '@/lib/upload';
import { MAX_FILE_SIZE } from '@/lib/config';
import { generateUniqueSlug } from '@/lib/slug';

export async function GET(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute(`
      SELECT d.*, u.name as author_name, u.username as author_username
      FROM data_laporan d LEFT JOIN users u ON d.author_id = u.id
      WHERE d.id = ?
    `, [parseInt(params.id)]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Data laporan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data_laporan: result.rows[0] });
  } catch (error) {
    console.error('Get data_laporan error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const itemId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM data_laporan WHERE id = ?', args: [itemId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Data laporan tidak ditemukan' }, { status: 404 });
    }

    if (existing.rows[0].author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak memiliki izin' }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const file = formData.get('file');

    if (name) {
      // Regenerate slug if name changed
      const newSlug = await generateUniqueSlug(db, name, itemId);
      await db.execute({
        sql: 'UPDATE data_laporan SET name = ?, slug = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: [name, newSlug, description !== null ? description : existing.rows[0].description, itemId]
      });
    }

    if (file && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });
      }
      const uploadResult = await handleUpload(file, { resourceType: 'raw', folder: 'sekolahku/files', subdir: 'files' });
      await db.execute({ sql: 'UPDATE data_laporan SET file_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [uploadResult.url, itemId] });
    }

    const updated = await db.execute(`
      SELECT d.*, u.name as author_name, u.username as author_username
      FROM data_laporan d LEFT JOIN users u ON d.author_id = u.id
      WHERE d.id = ?
    `, [itemId]);

    return NextResponse.json({ message: 'Data laporan berhasil diupdate', data_laporan: updated.rows[0] });
  } catch (error) {
    console.error('Update data_laporan error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const itemId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM data_laporan WHERE id = ?', args: [itemId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Data laporan tidak ditemukan' }, { status: 404 });
    }

    if (existing.rows[0].author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak memiliki izin' }, { status: 403 });
    }

    await db.execute({ sql: 'DELETE FROM data_laporan WHERE id = ?', args: [itemId] });

    return NextResponse.json({ message: 'Data laporan berhasil dihapus' });
  } catch (error) {
    console.error('Delete data_laporan error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
