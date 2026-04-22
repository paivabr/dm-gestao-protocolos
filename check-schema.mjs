import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [columns] = await connection.execute(`DESCRIBE users`);
  console.log('Colunas da tabela users:');
  columns.forEach(col => {
    console.log(`  - ${col.Field}: ${col.Type}`);
  });
} catch (e) {
  console.error('✗ Erro:', e.message);
}

await connection.end();
