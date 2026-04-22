import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  await conn.execute('ALTER TABLE `users` ADD `canViewRelatorio` tinyint DEFAULT 0 NOT NULL');
  console.log('✅ Coluna canViewRelatorio adicionada');
} catch (e) {
  console.log('⚠️ Coluna pode já existir:', e.message);
}

await conn.end();
