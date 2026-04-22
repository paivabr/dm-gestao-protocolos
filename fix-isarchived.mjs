import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  console.log('Sincronizando campos isArchived e isArquivado...');
  
  // Copiar valores de isArquivado para isArchived se isArchived estiver vazio
  await connection.execute('UPDATE statusProtocolo SET isArchived = isArquivado WHERE isArchived = 0 AND isArquivado = 1');
  console.log('✓ Sincronização concluída');
  
  // Verificar dados
  const [result] = await connection.execute('SELECT COUNT(*) as total, SUM(isArchived) as arquivados FROM statusProtocolo');
  console.log(`Total de protocolos: ${result[0].total}`);
  console.log(`Protocolos arquivados: ${result[0].arquivados || 0}`);
  
} catch (e) {
  console.error('Erro:', e.message);
}

await connection.end();
