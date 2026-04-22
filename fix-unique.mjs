import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  // Remover constraint UNIQUE
  await conn.execute('ALTER TABLE statusProtocolo DROP INDEX numeroProtocolo');
  console.log('✅ Constraint UNIQUE removido de numeroProtocolo');
  
  // Verificar schema
  const [columns] = await conn.execute("SHOW INDEX FROM statusProtocolo WHERE Column_name = 'numeroProtocolo'");
  if (columns.length === 0) {
    console.log('✅ Verificado: numeroProtocolo não tem mais constraint UNIQUE');
  }
} catch (error) {
  console.error('❌ Erro:', error.message);
}

await conn.end();
