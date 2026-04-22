import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  console.log('Verificando schema de statusProtocolo...');
  const [columns] = await connection.execute('DESCRIBE statusProtocolo');
  console.log('Colunas:');
  columns.forEach(col => {
    console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'NOT NULL'})`);
  });
  
  console.log('\nVerificando schema de arquivo...');
  const [arqColumns] = await connection.execute('DESCRIBE arquivo');
  console.log('Colunas:');
  arqColumns.forEach(col => {
    console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'NOT NULL'})`);
  });
} catch (e) {
  console.error('Erro:', e.message);
}

await connection.end();
