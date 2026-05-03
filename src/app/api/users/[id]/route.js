import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDatabase from '@/lib/db';
import { authenticate, isAdmin, unauthorized, forbidden } from '@/lib/auth';

export async function GET(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();
  if (!isAdmin(user)) return forbidden();

  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: 'SELECT id, username, name, role, created_at, updated_at FROM users WHERE id = ?',
      args: [parseInt(params.id)]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();
  if (!isAdmin(user)) return forbidden();

  try {
    const db = getDatabase();
    const { username, password, name, role } = await request.json();
    const userId = parseInt(params.id);

    const existing = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    if (username) {
      const checkUser = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [username] });
      if (checkUser.rows.length > 0 && Number(checkUser.rows[0].id) !== userId) {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
      }
      await db.execute({ sql: 'UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [username, userId] });
    }
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      await db.execute({ sql: 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [hashedPassword, userId] });
    }
    if (name !== undefined) {
      await db.execute({ sql: 'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [name, userId] });
    }
    if (role && ['admin', 'penulis'].includes(role)) {
      await db.execute({ sql: 'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [role, userId] });
    }

    const updatedUser = await db.execute({ sql: 'SELECT id, username, name, role, created_at, updated_at FROM users WHERE id = ?', args: [userId] });

    return NextResponse.json({ message: 'User berhasil diupdate', user: updatedUser.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();
  if (!isAdmin(user)) return forbidden();

  try {
    const db = getDatabase();
    const userId = parseInt(params.id);

    if (userId === user.id) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 });
    }

    const existing = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] });
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] });

    return NextResponse.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}