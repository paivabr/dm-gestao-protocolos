import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  console.log('Verificando observações nos protocolos...');
  const [protocolos] = await connection.execute('SELECT id, numeroProtocolo, observacoes FROM statusProtocolo LIMIT 5');
  
  protocolos.forEach(p => {
    console.log(`ID: ${p.id}, Protocolo: ${p.numeroProtocolo}, Observações: ${p.observacoes || '(vazio)'}`);
  });
  
} catch (e) {
  console.error('Erro:', e.message);
}

await connection.end();
