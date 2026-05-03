import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';

export async function GET(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: 'SELECT id, username, name, role, created_at, updated_at FROM users WHERE id = ?',
      args: [user.id]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const { name, username } = await request.json();

    if (username) {
      const existing = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [username] });
      if (existing.rows.length > 0 && Number(existing.rows[0].id) !== user.id) {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
      }
      await db.execute({ sql: 'UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [username, user.id] });
    }

    if (name !== undefined) {
      await db.execute({ sql: 'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [name, user.id] });
    }

    const updatedUser = await db.execute({ sql: 'SELECT id, username, name, role, created_at, updated_at FROM users WHERE id = ?', args: [user.id] });

    return NextResponse.json({ message: 'Profile berhasil diupdate', user: updatedUser.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}