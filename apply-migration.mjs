import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  // Executar migração
  await conn.execute("ALTER TABLE `statusProtocolo` DROP INDEX `statusProtocolo_numeroProtocolo_unique`");
  console.log('✅ Índice UNIQUE removido');
  
  await conn.execute("ALTER TABLE `statusProtocolo` MODIFY COLUMN `tipoProcesso` enum('Georreferenciamento','Certidão de Localização') NOT NULL");
  console.log('✅ Enum tipoProcesso atualizado');
  
  console.log('✅ Migração aplicada com sucesso!');
} catch (error) {
  if (error.message.includes('check that column/key exists')) {
    console.log('✅ Índice já foi removido anteriormente');
  } else {
    console.error('❌ Erro:', error.message);
  }
}

await conn.end();
