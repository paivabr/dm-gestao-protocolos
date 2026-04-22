import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

const [cols] = await conn.execute('DESCRIBE arquivo');
console.log('Schema da tabela arquivo:');
cols.forEach(c => {
  console.log(`${c.Field}: ${c.Type} (Null: ${c.Null}, Default: ${c.Default})`);
});

await conn.end();
