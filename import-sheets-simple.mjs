import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createConnection } from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple CSV parser
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const records = [];
  let i = 1;
  
  while (i < lines.length) {
    let line = lines[i];
    let record = {};
    let inQuotes = false;
    let currentField = '';
    let fieldIndex = 0;
    
    // Simple CSV parsing (handles quoted fields with newlines)
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        record[headers[fieldIndex]] = currentField.replace(/^"|"$/g, '').trim();
        currentField = '';
        fieldIndex++;
      } else {
        currentField += char;
      }
    }
    
    // Handle last field
    if (fieldIndex < headers.length) {
      record[headers[fieldIndex]] = currentField.replace(/^"|"$/g, '').trim();
    }
    
    // Check if we have enough fields and skip empty records
    if (Object.keys(record).length > 0 && record['PROTOCOLO']) {
      records.push(record);
    }
    
    i++;
  }
  
  return records;
}

// Read CSV file
const csvPath = path.join(__dirname, '../sheets_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const records = parseCSV(csvContent);
console.log(`📊 Parsed ${records.length} records from CSV`);

// Get database URL from environment
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

// Parse database URL
const urlObj = new URL(dbUrl);
const config = {
  host: urlObj.hostname,
  user: urlObj.username,
  password: urlObj.password,
  database: urlObj.pathname.slice(1),
  port: urlObj.port || 3306,
  ssl: {
    rejectUnauthorized: false,
  },
};

console.log(`🔗 Connecting to database: ${config.host}:${config.port}/${config.database}`);

// Connect and import
async function importData() {
  let connection;
  try {
    connection = await createConnection(config);
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
      if (cleaned.includes('exigência')) return 'Reivindicado';
      if (cleaned.includes('aguardando')) return 'Reivindicado';
      if (cleaned.includes('analisando')) return 'Pronto';
      if (cleaned.includes('devolvida')) return 'Vencido';
      return 'Pronto';
    }

    // Insert records
    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const record of records) {
      try {
        const numeroProtocolo = record['PROTOCOLO']?.trim() || '';
        const tipoProcesso = record['Tipo de Processo']?.trim() || 'Georreferenciamento';
        const dataAbertura = parseDate(record['Data de Abertura']);
        const status = cleanStatus(record['Status do Processo']);
        const cartorio = record['Cartório']?.trim() || '';
        const ultimaAtualizacao = parseDate(record['Última Atualização']);

        // Skip if numeroProtocolo is empty
        if (!numeroProtocolo) {
          skipped++;
          continue;
        }

        // Validate tipoProcesso
        const validTipos = ['Georreferenciamento', 'Certidão de Localização', 'Averbação de Qualificação'];
        const normalizedTipo = validTipos.find(t => tipoProcesso.includes(t)) || 'Georreferenciamento';

        // Insert into database
        try {
          await connection.execute(
            `INSERT INTO statusProtocolo (numeroProtocolo, tipoProcesso, dataAbertura, status, cartorio, ultimaAtualizacao, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE
             tipoProcesso = VALUES(tipoProcesso),
             dataAbertura = VALUES(dataAbertura),
             status = VALUES(status),
             cartorio = VALUES(cartorio),
             ultimaAtualizacao = VALUES(ultimaAtualizacao),
             updatedAt = NOW()`,
            [numeroProtocolo, normalizedTipo, dataAbertura, status, cartorio, ultimaAtualizacao]
          );

          inserted++;
          if (inserted % 10 === 0) {
            console.log(`📝 Inserted ${inserted} records...`);
          }
        } catch (dbError) {
          if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
            // Skip foreign key errors
            skipped++;
          } else {
            errors++;
            console.error(`❌ Error inserting record ${numeroProtocolo}:`, dbError.message);
          }
        }
      } catch (error) {
        errors++;
        console.error('❌ Error processing record:', error.message);
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   - Inserted: ${inserted}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Errors: ${errors}`);
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

importData();
