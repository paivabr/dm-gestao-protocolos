import mysql from 'mysql2/promise';
import fs from 'fs';

const sql = fs.readFileSync('./drizzle/0016_mature_darwin.sql', 'utf-8');
const connection = await mysql.createConnection(process.env.DATABASE_URL);

const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);
for (const stmt of statements) {
  try {
    await connection.execute(stmt);
    console.log('✓ Executed:', stmt.substring(0, 60));
  } catch (e) {
    console.error('✗ Error:', e.message);
  }
}

await connection.end();
console.log('Migration complete');
