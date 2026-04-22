import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

const [rows] = await conn.execute('SELECT * FROM arquivo LIMIT 5');
console.log('Dados em Arquivo:');
rows.forEach(r => {
  console.log(`ID: ${r.id}, StatusProtocoloId: ${r.statusProtocoloId}, ClienteId: ${r.clienteId}, ProcessoId: ${r.processoId}, DataArquivamento: ${r.dataArquivamento}, Valor: ${r.valor}`);
});

await conn.end();
