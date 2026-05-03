import { initDatabase } from './db.js';

async function main() {
  console.log('Initializing database...');
  try {
    await initDatabase();
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

main();