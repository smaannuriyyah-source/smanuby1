import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDatabase from '@/lib/db';
import { authenticate, generateToken, unauthorized } from '@/lib/auth';

export async function POST(request) {
  try {
    const db = getDatabase();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password harus diisi' }, { status: 400 });
    }

    const result = await db.execute({ sql: 'SELECT * FROM users WHERE username = ?', args: [username] });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const user = result.rows[0];
    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const token = generateToken(user);

    return NextResponse.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}