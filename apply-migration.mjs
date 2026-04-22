import mysql from 'mysql2/promise';
import fs from 'fs';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

const sql = fs.readFileSync('drizzle/0019_cooing_infant_terrible.sql', 'utf-8');
const statements = sql.split(';').filter(s => s.trim());

for (const stmt of statements) {
  if (stmt.trim()) {
    try {
      await conn.execute(stmt);
      console.log('✅ Executado:', stmt.substring(0, 50) + '...');
    } catch (e) {
      console.log('⚠️ Erro:', e.message);
    }
  }
}

await conn.end();
console.log('✅ Migração concluída!');
