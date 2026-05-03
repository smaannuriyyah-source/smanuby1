import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';

export async function GET(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT a.*, u.name as author_name, u.username as author_username, c.name as category_name FROM articles a LEFT JOIN users u ON a.author_id = u.id LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ?`,
      args: [parseInt(params.id)]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ article: result.rows[0] });
  } catch (error) {
    console.error('Get article error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const { title, content, category_id, status, thumbnail } = await request.json();
    const articleId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM articles WHERE id = ?', args: [articleId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    if (existing.rows[0].author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak memiliki izin' }, { status: 403 });
    }

    if (title) await db.execute({ sql: 'UPDATE articles SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [title, articleId] });
    if (content !== undefined) await db.execute({ sql: 'UPDATE articles SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [content, articleId] });
    if (category_id !== undefined) await db.execute({ sql: 'UPDATE articles SET category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [category_id, articleId] });
    if (status) await db.execute({ sql: 'UPDATE articles SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [status, articleId] });
    if (thumbnail !== undefined) await db.execute({ sql: 'UPDATE articles SET thumbnail = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [thumbnail, articleId] });

    const updated = await db.execute({
      sql: `SELECT a.*, u.name as author_name, u.username as author_username, c.name as category_name FROM articles a LEFT JOIN users u ON a.author_id = u.id LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ?`,
      args: [articleId]
    });

    return NextResponse.json({ message: 'Artikel berhasil diupdate', article: updated.rows[0] });
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const articleId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM articles WHERE id = ?', args: [articleId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    if (existing.rows[0].author_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak memiliki izin' }, { status: 403 });
    }

    await db.execute({ sql: 'DELETE FROM articles WHERE id = ?', args: [articleId] });

    return NextResponse.json({ message: 'Artikel berhasil dihapus' });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}