import { createConnection } from 'mysql2/promise';
import * as crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL nao definida');
  process.exit(1);
}

// Parse connection string
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  port: url.port || 3306,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Hash password function (same as in auth.ts)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

async function seedTestUser() {
  let connection;
  try {
    connection = await createConnection(config);

    const username = 'Dmconsultoria';
    const email = 'admin@dmconsultoria.com.br';
    const password = 'DM01012025';
    const name = 'DM Engenharia e Consultoria';
    const passwordHash = hashPassword(password);

    // Check if user already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      console.log('✅ Usuario ja existe. Atualizando senha...');
      await connection.execute(
        'UPDATE users SET passwordHash = ?, email = ?, name = ? WHERE username = ?',
        [passwordHash, email, name, username]
      );
      console.log('✅ Usuario atualizado com sucesso!');
    } else {
      console.log('✅ Criando novo usuario...');
      await connection.execute(
        'INSERT INTO users (username, email, passwordHash, name, role, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())',
        [username, email, passwordHash, name, 'admin']
      );
      console.log('✅ Usuario criado com sucesso!');
    }

    console.log('\n📋 Credenciais de Teste:');
    console.log(`   Usuario: ${username}`);
    console.log(`   Senha: ${password}`);
    console.log('\n✨ Voce pode fazer login no sistema agora!');

    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao criar usuario:', error.message);
    process.exit(1);
  }
}

seedTestUser();
