-- Script para limpar o banco de dados
-- Isto vai remover todas as tabelas para que o Railway possa criar do zero

-- Desabilitar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 0;

-- Listar todas as tabelas
-- SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE();

-- Remover todas as tabelas
DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS checklist;
DROP TABLE IF EXISTS processos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS statusProtocolo;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS _drizzle_migrations;

-- Reabilitar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- Verificar se as tabelas foram removidas
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE();
