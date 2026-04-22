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
  const [columns] = await connection.execute(`DESCRIBE statusProtocolo`);
  const hasColumn = columns.some(col => col.Field === 'isArchived');
  
  if (hasColumn) {
    console.log('✓ Coluna isArchived já existe');
  } else {
    console.log('Adicionando coluna isArchived...');
    await connection.execute(`ALTER TABLE statusProtocolo ADD COLUMN isArchived tinyint DEFAULT 0 NOT NULL`);
    console.log('✓ Coluna isArchived adicionada com sucesso!');
  }
  
} catch (e) {
  console.error('✗ Erro:', e.message);
}

await connection.end();
