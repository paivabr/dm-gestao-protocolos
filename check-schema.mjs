import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

// Verificar schema
const [columns] = await conn.execute("DESCRIBE statusProtocolo");
console.log('📋 Colunas da tabela statusProtocolo:');
columns.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));

// Verificar últimos protocolos criados
const [protocolos] = await conn.execute('SELECT id, numeroProtocolo, tipoProcesso, status, createdAt FROM statusProtocolo ORDER BY createdAt DESC LIMIT 5');
console.log('\n📝 Últimos 5 protocolos:');
protocolos.forEach(p => console.log(`  ID: ${p.id}, Protocolo: ${p.numeroProtocolo}, Tipo: ${p.tipoProcesso}, Status: ${p.status}, Data: ${p.createdAt}`));

// Verificar tipos de processo disponíveis
const [tipos] = await conn.execute('SELECT DISTINCT tipoProcesso FROM statusProtocolo');
console.log('\n🔍 Tipos de processo no banco:');
tipos.forEach(t => console.log(`  - ${t.tipoProcesso}`));

await conn.end();
