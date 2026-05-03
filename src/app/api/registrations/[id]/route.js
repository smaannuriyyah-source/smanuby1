import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();
    const result = await db.execute({ sql: 'DELETE FROM registrations WHERE id = ?', args: [parseInt(params.id)] });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Data pendaftar tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Data pendaftar berhasil dihapus' });
  } catch (error) {
    console.error('Delete registration error:', error);
    return NextResponse.json({ error: 'Gagal menghapus data pendaftar' }, { status: 500 });
  }
}