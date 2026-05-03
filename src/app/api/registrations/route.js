import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDatabase();
    const body = await request.json();
    const {
      full_name, gender, nisn, birth_place, birth_date,
      nik, religion, father_name, mother_name,
      address, phone_number, origin_school
    } = body;

    if (!full_name || !gender || !birth_place || !birth_date || !phone_number) {
      return NextResponse.json({ error: 'Mohon lengkapi data wajib (*)' }, { status: 400 });
    }

    await db.execute({
      sql: `INSERT INTO registrations (full_name, gender, nisn, birth_place, birth_date, nik, religion, father_name, mother_name, address, phone_number, origin_school) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [full_name, gender, nisn || '', birth_place, birth_date, nik || '', religion, father_name, mother_name, address, phone_number, origin_school]
    });

    return NextResponse.json({ message: 'Pendaftaran berhasil dikirim!' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server saat menyimpan data' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const db = getDatabase();
    const result = await db.execute('SELECT * FROM registrations ORDER BY created_at DESC');
    return NextResponse.json({ registrations: result.rows });
  } catch (error) {
    console.error('List registrations error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pendaftar' }, { status: 500 });
  }
}