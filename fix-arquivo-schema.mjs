import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  console.log('Adicionando campos faltantes na tabela arquivo...');
  
  // Verificar se clienteId existe
  try {
    await connection.execute('ALTER TABLE arquivo ADD COLUMN clienteId int');
    console.log('✓ clienteId adicionado');
  } catch (e) {
    if (e.message.includes('Duplicate column')) {
      console.log('✓ clienteId já existe');
    } else {
      throw e;
    }
  }
  
  // Verificar se processoId existe
  try {
    await connection.execute('ALTER TABLE arquivo ADD COLUMN processoId int');
    console.log('✓ processoId adicionado');
  } catch (e) {
    if (e.message.includes('Duplicate column')) {
      console.log('✓ processoId já existe');
    } else {
      throw e;
    }
  }
  
  console.log('\nSchema de arquivo atualizado!');
} catch (e) {
  console.error('Erro:', e.message);
}

await connection.end();
