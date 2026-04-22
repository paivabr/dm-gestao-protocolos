import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  console.log('Testando arquivamento...');
  
  // Pegar um protocolo não arquivado
  const [protocolos] = await connection.execute('SELECT id, numeroProtocolo FROM statusProtocolo WHERE isArchived = 0 LIMIT 1');
  
  if (protocolos.length === 0) {
    console.log('Nenhum protocolo não arquivado encontrado');
    return;
  }
  
  const protocolo = protocolos[0];
  console.log(`Testando com protocolo: ${protocolo.numeroProtocolo} (ID: ${protocolo.id})`);
  
  // Simular arquivamento
  await connection.execute('INSERT INTO arquivo (statusProtocoloId, clienteId, totalGasto, totalRecebido) VALUES (?, ?, ?, ?)', 
    [protocolo.id, 1, '0.00', '0.00']);
  console.log('✓ Inserido em arquivo');
  
  await connection.execute('UPDATE statusProtocolo SET isArchived = 1 WHERE id = ?', [protocolo.id]);
  console.log('✓ Marcado como arquivado');
  
  // Verificar
  const [check] = await connection.execute('SELECT * FROM arquivo WHERE statusProtocoloId = ?', [protocolo.id]);
  console.log(`✓ Arquivo criado: ${check.length} registro(s)`);
  
  const [checkStatus] = await connection.execute('SELECT isArchived FROM statusProtocolo WHERE id = ?', [protocolo.id]);
  console.log(`✓ Status: isArchived = ${checkStatus[0].isArchived}`);
  
} catch (e) {
  console.error('Erro:', e.message);
}

await connection.end();
