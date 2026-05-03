import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';

export async function GET(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category_id = searchParams.get('category_id');
    const author_id = searchParams.get('author_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    let query = `SELECT a.*, u.name as author_name, u.username as author_username, c.name as category_name FROM articles a LEFT JOIN users u ON a.author_id = u.id LEFT JOIN categories c ON a.category_id = c.id WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM articles a WHERE 1=1`;
    const args = [];

    if (status) { query += ` AND a.status = ?`; countQuery += ` AND a.status = ?`; args.push(status); }
    if (category_id) { query += ` AND a.category_id = ?`; countQuery += ` AND a.category_id = ?`; args.push(parseInt(category_id)); }
    if (author_id) { query += ` AND a.author_id = ?`; countQuery += ` AND a.author_id = ?`; args.push(parseInt(author_id)); }
    if (search) {
      query += ` AND (a.title LIKE ? OR a.content LIKE ?)`;
      countQuery += ` AND (a.title LIKE ? OR a.content LIKE ?)`;
      args.push(`%${search}%`, `%${search}%`);
    }

    const totalResult = await db.execute({ sql: countQuery, args: args.slice(0, args.length) });
    const total = totalResult.rows[0]?.total || 0;

    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);

    const result = await db.execute({ sql: query, args });

    return NextResponse.json({
      articles: result.rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const { title, content, category_id, status, thumbnail } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Judul artikel harus diisi' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'INSERT INTO articles (title, content, thumbnail, category_id, author_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      args: [title, content || null, thumbnail || null, category_id || null, user.id, status || 'draft']
    });

    const article = await db.execute({
      sql: `SELECT a.*, u.name as author_name, u.username as author_username, c.name as category_name FROM articles a LEFT JOIN users u ON a.author_id = u.id LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ?`,
      args: [Number(result.lastInsertRowid)]
    });

    return NextResponse.json({ message: 'Artikel berhasil dibuat', article: article.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}