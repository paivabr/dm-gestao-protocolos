import { createConnection } from 'mysql2/promise';

const conn = await createConnection('mysql://root:fBBnBNMoKhouqhcshloztbkJeTTVKewI@monorail.proxy.rlwy.net:19333/railway');

// Adicionar coluna valorPago à tabela parcelas se não existir
const [cols] = await conn.execute('DESCRIBE parcelas');
const hasValorPago = cols.some(c => c.Field === 'valorPago');

if (hasValorPago) {
  console.log('Coluna valorPago já existe na tabela parcelas!');
} else {
  await conn.execute('ALTER TABLE parcelas ADD COLUMN valorPago VARCHAR(20) DEFAULT "0" NOT NULL');
  console.log('Coluna valorPago adicionada à tabela parcelas!');
  
  // Sincronizar valorPago com valorParcela - desconto para parcelas já pagas
  await conn.execute(`
    UPDATE parcelas 
    SET valorPago = CAST(CAST(valorParcela AS DECIMAL(10,2)) - CAST(desconto AS DECIMAL(10,2)) AS CHAR)
    WHERE pago = 1
  `);
  console.log('Valores pagos sincronizados para parcelas já concluídas!');
}

await conn.end();
console.log('Migração das parcelas concluída!');
