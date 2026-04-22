import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

const [despesas] = await conn.execute('SELECT * FROM despesas LIMIT 5');
console.log('Despesas no banco:', despesas.length);
console.log(despesas);

const [schema] = await conn.execute('DESCRIBE despesas');
console.log('\nSchema da tabela despesas:');
schema.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));

await conn.end();
