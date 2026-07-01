import { NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { authenticate, unauthorized } from '@/lib/auth';
import { handleUpload } from '@/lib/upload';
import { MAX_FILE_SIZE } from '@/lib/config';

export async function POST(request) {
  const user = authenticate(request);
  if (!user) return unauthorized();

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: 'Tidak ada file yang diupload' }, { status: 400 });
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });
    }

    const result = await handleUpload(imageFile);

    return NextResponse.json({
      message: 'Gambar berhasil diupload',
      url: result.url,
      filename: result.filename,
      originalName: result.originalName,
      size: result.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Gagal mengupload gambar' }, { status: 500 });
  }
}