import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse CSV file
const csvPath = path.join(__dirname, '../sheets_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

console.log(`📊 Parsed ${records.length} records from CSV`);

// Connect to database
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dm_gestao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('✅ Connected to database');

// Parse date function
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  const [day, month, year] = dateStr.trim().split('/');
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

// Clean status
function cleanStatus(status) {
  if (!status) return 'Pronto';
  const cleaned = status.trim().toLowerCase();
  if (cleaned.includes('pronto')) return 'Pronto';
  if (cleaned.includes('vencido')) return 'Vencido';
  if (cleaned.includes('reivindicado') || cleaned.includes('reingressado')) return 'Reivindicado';
  if (cleaned.includes('exigência')) return 'Em Exigência';
  if (cleaned.includes('aguardando')) return 'Aguardando Pagamento';
  if (cleaned.includes('analisando')) return 'Analisando';
  if (cleaned.includes('devolvida')) return 'Devolvida';
  return 'Pronto';
}

// Insert records
let inserted = 0;
let skipped = 0;

for (const record of records) {
  try {
    const protocolo = record['PROTOCOLO']?.trim() || '';
    const cliente = record['Nome do Cliente']?.trim() || '';
    const tipo = record['Tipo de Processo']?.trim() || '';
    const data = parseDate(record['Data de Abertura']);
    const status = cleanStatus(record['Status do Processo']);
    const cartorio = record['Cartório']?.trim() || '';
    const dataAtualizacao = parseDate(record['Última Atualização']);

    // Skip if protocolo or cliente is empty
    if (!protocolo || !cliente) {
      skipped++;
      continue;
    }

    // Insert into database
    await connection.execute(
      `INSERT INTO statusProtocolo (protocolo, cliente, tipo, data, status, cartorio, dataAtualizacao, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
       cliente = VALUES(cliente),
       tipo = VALUES(tipo),
       data = VALUES(data),
       status = VALUES(status),
       cartorio = VALUES(cartorio),
       dataAtualizacao = VALUES(dataAtualizacao),
       updatedAt = NOW()`,
      [protocolo, cliente, tipo, data, status, cartorio, dataAtualizacao]
    );

    inserted++;
    if (inserted % 10 === 0) {
      console.log(`📝 Inserted ${inserted} records...`);
    }
  } catch (error) {
    console.error('❌ Error inserting record:', record, error.message);
  }
}

console.log(`\n✅ Import complete!`);
console.log(`   - Inserted: ${inserted}`);
console.log(`   - Skipped: ${skipped}`);

await connection.end();
