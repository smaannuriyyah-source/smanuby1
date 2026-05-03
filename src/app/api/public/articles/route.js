import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    let query = `SELECT a.*, u.name as author_name, c.name as category_name FROM articles a LEFT JOIN users u ON a.author_id = u.id LEFT JOIN categories c ON a.category_id = c.id WHERE a.status = 'published'`;
    let countQuery = `SELECT COUNT(*) as total FROM articles a WHERE a.status = 'published'`;
    const args = [];

    if (category_id) {
      query += ` AND a.category_id = ?`;
      countQuery += ` AND a.category_id = ?`;
      args.push(parseInt(category_id));
    }

    if (search) {
      query += ` AND (a.title LIKE ? OR a.content LIKE ?)`;
      countQuery += ` AND (a.title LIKE ? OR a.content LIKE ?)`;
      args.push(`%${search}%`, `%${search}%`);
    }

    const totalResult = await db.execute({ sql: countQuery, args: args.slice() });
    const total = totalResult.rows[0]?.total || 0;

    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);

    const result = await db.execute({ sql: query, args });

    return NextResponse.json({
      articles: result.rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get public articles error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}