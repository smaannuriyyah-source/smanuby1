import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, isAdmin, unauthorized, forbidden } from '@/lib/auth';

export async function GET(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [parseInt(params.id)] });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ category: result.rows[0] });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();
  if (!isAdmin(user)) return forbidden();

  try {
    const db = getDatabase();
    const { name, description } = await request.json();
    const categoryId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [categoryId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    if (name) await db.execute({ sql: 'UPDATE categories SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [name, categoryId] });
    if (description !== undefined) await db.execute({ sql: 'UPDATE categories SET description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [description, categoryId] });

    const updated = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [categoryId] });

    return NextResponse.json({ message: 'Kategori berhasil diupdate', category: updated.rows[0] });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();
  if (!isAdmin(user)) return forbidden();

  try {
    const db = getDatabase();
    const categoryId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [categoryId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    await db.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [categoryId] });

    return NextResponse.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}