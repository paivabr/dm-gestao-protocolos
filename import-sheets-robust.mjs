import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createConnection } from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Robust CSV parser that handles multiline fields
function parseCSVRobust(content) {
  const records = [];
  let currentRecord = {};
  let currentField = '';
  let fieldIndex = 0;
  let inQuotes = false;
  let lineNumber = 0;
  
  const headers = [
    'PROTOCOLO',
    'Nome do Cliente',
    'Tipo de Processo',
    'Data de Abertura',
    'Status do Processo',
    'Cartório',
    'Última Atualização',
    'Status do Processo',
    'Contagem'
  ];

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // Field separator
      currentRecord[headers[fieldIndex]] = currentField.trim();
      currentField = '';
      fieldIndex++;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of line
      if (fieldIndex < headers.length) {
        currentRecord[headers[fieldIndex]] = currentField.trim();
      }
      
      // Skip header line
      if (lineNumber > 0 && currentRecord['PROTOCOLO']) {
        records.push({ ...currentRecord });
      }
      
      currentRecord = {};
      currentField = '';
      fieldIndex = 0;
      lineNumber++;
      
      // Skip \r\n
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentField += char;
    }
  }

  // Handle last record
  if (fieldIndex < headers.length) {
    currentRecord[headers[fieldIndex]] = currentField.trim();
  }
  if (currentRecord['PROTOCOLO']) {
    records.push(currentRecord);
  }

  return records;
}

// Read CSV file
const csvPath = path.join(__dirname, '../sheets_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const records = parseCSVRobust(csvContent);
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
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return null;
      return date;
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

    // Clean protocolo - remove extra characters and limit to 50 chars
    function cleanProtocolo(proto) {
      return proto.trim().substring(0, 50);
    }

    // Insert records
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails = [];

    for (const record of records) {
      try {
        let numeroProtocolo = record['PROTOCOLO']?.trim() || '';
        const tipoProcesso = record['Tipo de Processo']?.trim() || 'Georreferenciamento';
        let dataAbertura = parseDate(record['Data de Abertura']);
        const status = cleanStatus(record['Status do Processo']);
        const cartorio = record['Cartório']?.trim() || '';
        let ultimaAtualizacao = parseDate(record['Última Atualização']);

        // Skip if numeroProtocolo is empty
        if (!numeroProtocolo) {
          skipped++;
          continue;
        }

        // Clean protocolo
        numeroProtocolo = cleanProtocolo(numeroProtocolo);

        // If dataAbertura is null, use ultimaAtualizacao or current date
        if (!dataAbertura) {
          if (ultimaAtualizacao) {
            dataAbertura = ultimaAtualizacao;
          } else {
            dataAbertura = new Date();
          }
        }

        // If ultimaAtualizacao is null, use dataAbertura
        if (!ultimaAtualizacao) {
          ultimaAtualizacao = dataAbertura;
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
          errors++;
          errorDetails.push({
            protocolo: numeroProtocolo,
            erro: dbError.message
          });
        }
      } catch (error) {
        errors++;
        errorDetails.push({
          protocolo: record['PROTOCOLO'],
          erro: error.message
        });
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   - Inserted: ${inserted}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Errors: ${errors}`);

    if (errorDetails.length > 0) {
      console.log(`\n❌ Error details:`);
      errorDetails.forEach(err => {
        console.log(`   - ${err.protocolo}: ${err.erro}`);
      });
    }
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
