import { drizzle } from "drizzle-orm/mysql2";
import { tiposProcesso, cartorios } from "./drizzle/schema.ts";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function seed() {
  if (!DATABASE_URL) {
    console.error("DATABASE_URL não definida");
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);

    console.log("🌱 Iniciando seed de dados...");

    // Inserir tipos de processo padrão
    const tiposProcessoPadrao = [
      { nome: "Georreferenciamento", descricao: "Processo de georreferenciamento de imóvel", ativo: 1 },
      { nome: "Certidão de Localização", descricao: "Certidão de localização do imóvel", ativo: 1 },
      { nome: "Averbação de Qualificação", descricao: "Averbação de qualificação", ativo: 1 },
    ];

    for (const tipo of tiposProcessoPadrao) {
      try {
        await db.insert(tiposProcesso).values(tipo);
        console.log(`✅ Tipo de processo criado: ${tipo.nome}`);
      } catch (error) {
        console.log(`⚠️ Tipo de processo já existe: ${tipo.nome}`);
      }
    }

    // Inserir cartórios padrão
    const cartoriosPadrao = [
      { nome: "Colatina", localizacao: "Colatina - ES", ativo: 1 },
      { nome: "Santa Teresa", localizacao: "Santa Teresa - ES", ativo: 1 },
      { nome: "Linares", localizacao: "Linares - ES", ativo: 1 },
      { nome: "João Neiva", localizacao: "João Neiva - ES", ativo: 1 },
      { nome: "Marialândia", localizacao: "Marialândia - ES", ativo: 1 },
    ];

    for (const cartorio of cartoriosPadrao) {
      try {
        await db.insert(cartorios).values(cartorio);
        console.log(`✅ Cartório criado: ${cartorio.nome}`);
      } catch (error) {
        console.log(`⚠️ Cartório já existe: ${cartorio.nome}`);
      }
    }

    console.log("✅ Seed concluído com sucesso!");
    await connection.end();
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  }
}

seed();
