import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticate(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function unauthorized(message = 'Token tidak ditemukan') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Akses ditolak. Hanya admin yang diizinkan.') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function isAdmin(user) {
  return user?.role === 'admin';
}