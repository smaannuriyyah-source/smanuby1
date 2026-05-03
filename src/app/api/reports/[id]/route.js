import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';
import { handleUpload } from '@/lib/upload';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute(`
      SELECT r.*, u.name as author_name, u.username as author_username
      FROM reports r LEFT JOIN users u ON r.author_id = u.id
      WHERE r.id = ?
    `, [parseInt(params.id)]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const reportId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM reports WHERE id = ?', args: [reportId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    if (existing.rows[0].author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak memiliki izin' }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const photoFile = formData.get('photo');

    if (title) {
      await db.execute({ sql: 'UPDATE reports SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [title, reportId] });
    }

    if (photoFile && photoFile.size > 0) {
      const uploadResult = await handleUpload(photoFile);
      await db.execute({ sql: 'UPDATE reports SET photo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [uploadResult.url, reportId] });
    }

    const updated = await db.execute(`
      SELECT r.*, u.name as author_name, u.username as author_username
      FROM reports r LEFT JOIN users u ON r.author_id = u.id
      WHERE r.id = ?
    `, [reportId]);

    return NextResponse.json({ message: 'Laporan berhasil diupdate', report: updated.rows[0] });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const reportId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM reports WHERE id = ?', args: [reportId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    if (existing.rows[0].author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak memiliki izin' }, { status: 403 });
    }

    await db.execute({ sql: 'DELETE FROM reports WHERE id = ?', args: [reportId] });

    return NextResponse.json({ message: 'Laporan berhasil dihapus' });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}