import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';
import { handleUpload } from '@/lib/upload';
import { MAX_FILE_SIZE } from '@/lib/config';

export async function GET(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT a.*, u.name as author_name, u.username as author_username FROM announcements a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = ?`,
      args: [parseInt(params.id)]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ announcement: result.rows[0] });
  } catch (error) {
    console.error('Get announcement error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const announcementId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM announcements WHERE id = ?', args: [announcementId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const content = formData.get('content');
    const status = formData.get('status');
    const countdown_date = formData.get('countdown_date');
    const pdfFile = formData.get('pdf');
    const csvFile = formData.get('csv');
    const removePdf = formData.get('remove_pdf');

    if (status === 'published') {
      await db.execute({ sql: "UPDATE announcements SET status = 'draft' WHERE status = 'published' AND id != ?", args: [announcementId] });
    }

    let pdf_url = existing.rows[0].pdf_url;
    if (removePdf === 'true') {
      pdf_url = null;
    }
    if (pdfFile && pdfFile.size > 0) {
      if (pdfFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });
      }
      const uploadResult = await handleUpload(pdfFile, { resourceType: 'raw', folder: 'sekolahku/pdfs', subdir: 'pdfs' });
      pdf_url = uploadResult.url;
    }

    let csv_data = existing.rows[0].csv_data;
    const removeCsv = formData.get('remove_csv');
    if (removeCsv === 'true') {
      csv_data = null;
    }
    if (csvFile && csvFile.size > 0) {
      const csvText = await csvFile.text();
      csv_data = parseCSV(csvText);
    }

    if (title) await db.execute({ sql: 'UPDATE announcements SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [title, announcementId] });
    if (content !== null && content !== undefined) await db.execute({ sql: 'UPDATE announcements SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [content, announcementId] });
    if (pdf_url !== existing.rows[0].pdf_url) await db.execute({ sql: 'UPDATE announcements SET pdf_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [pdf_url, announcementId] });
    if (csv_data !== existing.rows[0].csv_data) await db.execute({ sql: 'UPDATE announcements SET csv_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [csv_data, announcementId] });
    if (countdown_date !== null && countdown_date !== undefined) await db.execute({ sql: 'UPDATE announcements SET countdown_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [countdown_date || null, announcementId] });
    if (status) await db.execute({ sql: 'UPDATE announcements SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [status, announcementId] });

    const updated = await db.execute({
      sql: `SELECT a.*, u.name as author_name, u.username as author_username FROM announcements a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = ?`,
      args: [announcementId]
    });

    return NextResponse.json({ message: 'Pengumuman berhasil diupdate', announcement: updated.rows[0] });
  } catch (error) {
    console.error('Update announcement error:', error);
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
    const announcementId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM announcements WHERE id = ?', args: [announcementId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 });
    }

    if (existing.rows[0].author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak memiliki izin' }, { status: 403 });
    }

    await db.execute({ sql: 'DELETE FROM announcements WHERE id = ?', args: [announcementId] });

    return NextResponse.json({ message: 'Pengumuman berhasil dihapus' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return null;

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }

  return JSON.stringify({ headers, rows });
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}