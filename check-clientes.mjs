import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'monorail.proxy.rlwy.net',
  port: 19333,
  user: 'root',
  password: 'fBBnBNMoKhouqhcshloztbkJeTTVKewI',
  database: 'railway'
});

try {
  console.log('Verificando tabela clientes...');
  const [clientes] = await connection.execute('SELECT id, nome, cpfCnpj, contato FROM clientes LIMIT 10');
  console.log(`Total de clientes: ${clientes.length}`);
  clientes.forEach(c => {
    console.log(`  - ID: ${c.id}, Nome: ${c.nome}, CPF/CNPJ: ${c.cpfCnpj}, Contato: ${c.contato}`);
  });
} catch (e) {
  console.error('Erro:', e.message);
}

await connection.end();
