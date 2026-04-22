import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  console.log('Aplicando migração 0018...');
  
  await connection.execute('ALTER TABLE `processos` ADD COLUMN `isArchived` tinyint NOT NULL DEFAULT 0');
  console.log('✓ isArchived adicionado');
  
  await connection.execute('ALTER TABLE `processos` ADD COLUMN `dataArquivamento` timestamp');
  console.log('✓ dataArquivamento adicionado');
  
  console.log('\nMigração aplicada com sucesso!');
} catch (e) {
  if (e.message.includes('Duplicate column')) {
    console.log('✓ Colunas já existem');
  } else {
    console.error('Erro:', e.message);
  }
}

await connection.end();
