import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, isAdmin, unauthorized, forbidden } from '@/lib/auth';

export async function GET(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute('SELECT id, username, name, role, created_at, updated_at FROM users ORDER BY created_at DESC');
    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();
  if (!isAdmin(user)) return forbidden();

  try {
    const db = getDatabase();
    const { username, password, name } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password harus diisi' }, { status: 400 });
    }

    const existing = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [username] });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
    }

    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = await db.execute({
      sql: 'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      args: [username, hashedPassword, name || username, 'penulis']
    });

    const newUser = await db.execute({ sql: 'SELECT id, username, name, role, created_at FROM users WHERE id = ?', args: [Number(result.lastInsertRowid)] });

    return NextResponse.json({ message: 'Akun penulis berhasil dibuat', user: newUser.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}