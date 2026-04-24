import { createConnection } from 'mysql2/promise';

const conn = await createConnection('mysql://root:fBBnBNMoKhouqhcshloztbkJeTTVKewI@monorail.proxy.rlwy.net:19333/railway');

// Criar tabela checklistTemplates
await conn.execute(`
  CREATE TABLE IF NOT EXISTS checklistTemplates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuarioId INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
  )
`);
console.log('Tabela checklistTemplates criada!');

// Adicionar coluna ordem ao checklistItens se não existir
const [cols] = await conn.execute('DESCRIBE checklistItens');
const hasOrdem = cols.some(c => c.Field === 'ordem');
if (hasOrdem) {
  console.log('Coluna ordem já existe no checklistItens!');
} else {
  await conn.execute('ALTER TABLE checklistItens ADD COLUMN ordem INT DEFAULT 0 NOT NULL');
  console.log('Coluna ordem adicionada ao checklistItens!');
  await conn.execute('UPDATE checklistItens SET ordem = id');
  console.log('Ordem inicializada com base no id!');
}

// Verificar tabelas criadas
const [tables] = await conn.execute("SHOW TABLES LIKE '%checklist%'");
console.log('Tabelas checklist:', tables.map(t => Object.values(t)[0]));

await conn.end();
console.log('Migração concluída!');
