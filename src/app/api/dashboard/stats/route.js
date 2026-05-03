import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';

export async function GET(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const db = getDatabase();

    const reportsCount = await db.execute('SELECT COUNT(*) as count FROM reports');
    const articlesCount = await db.execute("SELECT COUNT(*) as count FROM articles WHERE status = 'published'");
    const usersCount = await db.execute('SELECT COUNT(*) as count FROM users');
    const registrationsCount = await db.execute('SELECT COUNT(*) as count FROM registrations');

    return NextResponse.json({
      stats: {
        totalReports: reportsCount.rows[0].count,
        totalArticles: articlesCount.rows[0].count,
        totalUsers: usersCount.rows[0].count,
        totalRegistrations: registrationsCount.rows[0].count,
        visitors: Math.floor(Math.random() * 1000) + 500,
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}