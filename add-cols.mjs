import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

const sqls = [
  'ALTER TABLE `users` ADD `canViewDespesas` tinyint DEFAULT 0 NOT NULL',
  'ALTER TABLE `users` ADD `canViewRelatorio` tinyint DEFAULT 0 NOT NULL'
];

for (const sql of sqls) {
  try {
    await conn.execute(sql);
    console.log('✅', sql.substring(0, 50));
  } catch (e) {
    if (e.message.includes('Duplicate column')) {
      console.log('⚠️ Coluna já existe:', sql.substring(0, 50));
    } else {
      console.log('❌ Erro:', e.message);
    }
  }
}

await conn.end();
