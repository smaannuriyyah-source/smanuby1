import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';

export async function PUT(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Password lama dan baru harus diisi' }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'Password baru minimal 4 karakter' }, { status: 400 });
    }

    const result = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [user.id] });
    const dbUser = result.rows[0];

    if (!bcrypt.compareSync(currentPassword, dbUser.password)) {
      return NextResponse.json({ error: 'Password lama tidak sesuai' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await db.execute({ sql: 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [hashedPassword, user.id] });

    return NextResponse.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}