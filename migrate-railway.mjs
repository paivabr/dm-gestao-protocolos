import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  console.log('Conectando ao banco Railway...');
  
  // Verificar se coluna já existe
  const [columns] = await connection.execute(`DESCRIBE users`);
  const hasColumn = columns.some(col => col.Field === 'canViewArchivo');
  
  if (hasColumn) {
    console.log('✓ Coluna canViewArchivo já existe');
  } else {
    console.log('Adicionando coluna canViewArchivo...');
    await connection.execute(`ALTER TABLE users ADD COLUMN canViewArchivo tinyint DEFAULT 0 NOT NULL`);
    console.log('✓ Coluna canViewArchivo adicionada com sucesso!');
  }
  
  // Verificar schema
  const [updatedColumns] = await connection.execute(`DESCRIBE users`);
  console.log('\nColunas da tabela users:');
  updatedColumns.forEach(col => {
    if (col.Field.includes('can') || col.Field === 'id' || col.Field === 'username') {
      console.log(`  - ${col.Field}: ${col.Type}`);
    }
  });
  
} catch (e) {
  console.error('✗ Erro:', e.message);
}

await connection.end();
