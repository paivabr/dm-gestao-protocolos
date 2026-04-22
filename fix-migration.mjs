import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // Executar a migração
  await connection.execute(`ALTER TABLE \`users\` ADD COLUMN \`canViewArchivo\` tinyint DEFAULT 0 NOT NULL`);
  console.log('✓ Coluna canViewArchivo adicionada com sucesso!');
} catch (e) {
  if (e.code === 'ER_DUP_FIELDNAME') {
    console.log('✓ Coluna canViewArchivo já existe');
  } else {
    console.error('✗ Erro:', e.message);
  }
}

await connection.end();
