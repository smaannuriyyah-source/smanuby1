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
      SELECT a.*, u.name as author_name, u.username as author_username
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
    `);
    return NextResponse.json({ announcements: result.rows });
  } catch (error) {
    console.error('Get announcements error:', error);
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
    const content = formData.get('content');
    const status = formData.get('status') || 'draft';
    const countdown_date = formData.get('countdown_date');
    const pdfFile = formData.get('pdf');
    const csvFile = formData.get('csv');

    if (!title) {
      return NextResponse.json({ error: 'Judul pengumuman harus diisi' }, { status: 400 });
    }

    if (status === 'published') {
      await db.execute("UPDATE announcements SET status = 'draft' WHERE status = 'published'");
    }

    let pdf_url = formData.get('existing_pdf_url') || null;
    if (pdfFile && pdfFile.size > 0) {
      if (pdfFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });
      }
      const uploadResult = await handleUpload(pdfFile, { resourceType: 'raw', folder: 'sekolahku/pdfs', subdir: 'pdfs' });
      pdf_url = uploadResult.url;
    }

    let csv_data = null;
    if (csvFile && csvFile.size > 0) {
      const csvText = await csvFile.text();
      csv_data = parseCSV(csvText);
    } else {
      const existingCsv = formData.get('existing_csv_data');
      if (existingCsv) csv_data = existingCsv;
    }

    const result = await db.execute({
      sql: 'INSERT INTO announcements (title, content, pdf_url, csv_data, countdown_date, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [title, content || null, pdf_url, csv_data ? (typeof csv_data === 'string' ? csv_data : JSON.stringify(csv_data)) : null, countdown_date || null, user.id, status]
    });

    const announcement = await db.execute({
      sql: `SELECT a.*, u.name as author_name, u.username as author_username FROM announcements a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = ?`,
      args: [Number(result.lastInsertRowid)]
    });

    return NextResponse.json({ message: 'Pengumuman berhasil dibuat', announcement: announcement.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create announcement error:', error);
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