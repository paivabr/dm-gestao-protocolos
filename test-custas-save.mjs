import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

// Tentar inserir uma custa de teste
try {
  const [result] = await conn.execute(
    'INSERT INTO despesas (statusProtocoloId, descricao, valor, dataDespesa, pago) VALUES (?, ?, ?, NOW(), 0)',
    [115, 'Teste de Salvamento', '999.99']
  );
  console.log('✅ Custa inserida com sucesso:', result.insertId);
  
  // Verificar se foi salva
  const [despesas] = await conn.execute('SELECT * FROM despesas WHERE id = ?', [result.insertId]);
  console.log('✅ Custa recuperada:', despesas[0]);
} catch (error) {
  console.error('❌ Erro ao salvar custa:', error.message);
}

await conn.end();
