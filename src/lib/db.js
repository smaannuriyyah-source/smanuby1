import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

let turso = null;
let dbInitialized = false;
let initPromise = null;

export function getDatabase() {
  if (!turso) {
    turso = createClient({
      url: process.env.TURSO_DB_URL || 'file:local.db',
      authToken: process.env.TURSO_DB_AUTH_TOKEN || '',
    });
  }
  return turso;
}

export async function ensureInitialized() {
  if (dbInitialized) return;
  if (initPromise) return initPromise;

  initPromise = initDatabase();
  await initPromise;
}

async function initDatabase() {
  const db = getDatabase();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT CHECK(role IN ('admin', 'penulis')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      thumbnail TEXT,
      category_id INTEGER,
      author_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      photo TEXT,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      gender TEXT CHECK(gender IN ('Laki-laki', 'Perempuan')) NOT NULL,
      nisn TEXT,
      birth_place TEXT NOT NULL,
      birth_date DATE NOT NULL,
      nik TEXT NOT NULL,
      religion TEXT NOT NULL,
      father_name TEXT NOT NULL,
      mother_name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      origin_school TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      pdf_url TEXT,
      csv_data TEXT,
      countdown_date DATETIME,
      status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS data_laporan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      file_url TEXT,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  const result = await db.execute({ sql: "SELECT id FROM users WHERE username = ?", args: ['admin'] });
  if (result.rows.length === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await db.execute({
      sql: "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)",
      args: ['admin', hashedPassword, 'Administrator', 'admin']
    });
  }

  dbInitialized = true;
  console.log('✅ Database tables initialized');
  return db;
}

export { initDatabase };
export default getDatabase;