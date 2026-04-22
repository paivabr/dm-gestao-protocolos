import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

const [cols] = await conn.execute('DESCRIBE users');
const colNames = cols.map(c => c.Field);
console.log('Colunas com "View":', colNames.filter(c => c.includes('View')));
console.log('Colunas com "view":', colNames.filter(c => c.includes('view')));

await conn.end();
