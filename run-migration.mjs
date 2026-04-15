import { createConnection } from 'mysql2/promise';

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

async function runMigration() {
  let connection;
  try {
    connection = await createConnection(config);
    console.log('✅ Connected to database');

    // Execute migration
    const sql = 'ALTER TABLE `statusProtocolo` MODIFY COLUMN `clienteId` int;';
    console.log(`📝 Executing: ${sql}`);
    
    await connection.execute(sql);
    console.log('✅ Migration executed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
