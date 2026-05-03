import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, isAdmin, unauthorized, forbidden } from '@/lib/auth';

export async function GET(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute('SELECT * FROM categories ORDER BY created_at DESC');
    return NextResponse.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();
  if (!isAdmin(user)) return forbidden();

  try {
    const db = getDatabase();
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Nama kategori harus diisi' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'INSERT INTO categories (name, description) VALUES (?, ?)',
      args: [name, description || null]
    });

    const category = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [Number(result.lastInsertRowid)] });

    return NextResponse.json({ message: 'Kategori berhasil dibuat', category: category.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}