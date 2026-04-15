-- Script para limpar o banco e criar usuário admin DMconsultoria
-- Email: topografiadm@gmail.com
-- Senha: dm01012025
-- Com todas as permissões de administrador

SET FOREIGN_KEY_CHECKS = 0;

-- Remover todas as tabelas
DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS checklist;
DROP TABLE IF EXISTS processos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS statusProtocolo;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS _drizzle_migrations;

SET FOREIGN_KEY_CHECKS = 1;

-- Criar tabela users com todos os campos
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`username` varchar(255),
	`passwordHash` varchar(255),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`canCreateClient` boolean NOT NULL DEFAULT false,
	`canEditProcess` boolean NOT NULL DEFAULT false,
	`canDeleteProcess` boolean NOT NULL DEFAULT false,
	`canViewCalendar` boolean NOT NULL DEFAULT false,
	`canViewProcesses` boolean NOT NULL DEFAULT false,
	`canViewClients` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

-- Criar tabela clientes
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`telefone` varchar(20),
	`endereco` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);

-- Criar tabela processos
CREATE TABLE `processos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`numeroProcesso` varchar(255) NOT NULL,
	`descricao` text,
	`status` varchar(50),
	`dataInicio` timestamp NOT NULL DEFAULT (now()),
	`dataFim` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processos_id` PRIMARY KEY(`id`),
	CONSTRAINT `processos_clienteId_fk` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE
);

-- Criar tabela checklist
CREATE TABLE `checklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processoId` int NOT NULL,
	`item` text NOT NULL,
	`concluido` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklist_id` PRIMARY KEY(`id`),
	CONSTRAINT `checklist_processoId_fk` FOREIGN KEY (`processoId`) REFERENCES `processos`(`id`) ON DELETE CASCADE
);

-- Criar tabela statusProtocolo
CREATE TABLE `statusProtocolo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int,
	`numeroProtocolo` varchar(50),
	`cartorio` varchar(255),
	`status` varchar(50),
	`dataAtualizacao` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `statusProtocolo_id` PRIMARY KEY(`id`),
	CONSTRAINT `statusProtocolo_clienteId_fk` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE SET NULL
);

-- Criar tabela auditoria
CREATE TABLE `auditoria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(50) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`changes` json,
	`status` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditoria_id` PRIMARY KEY(`id`),
	CONSTRAINT `auditoria_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Criar tabela _drizzle_migrations
CREATE TABLE `_drizzle_migrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hash` text NOT NULL,
	`created_at` bigint,
	CONSTRAINT `_drizzle_migrations_id` PRIMARY KEY(`id`)
);

-- Inserir usuário admin DMconsultoria
-- Email: topografiadm@gmail.com
-- Senha: dm01012025 (será hasheada no login)
INSERT INTO `users` (
	`openId`,
	`name`,
	`email`,
	`username`,
	`loginMethod`,
	`role`,
	`canCreateClient`,
	`canEditProcess`,
	`canDeleteProcess`,
	`canViewCalendar`,
	`canViewProcesses`,
	`canViewClients`,
	`createdAt`,
	`updatedAt`,
	`lastSignedIn`
) VALUES (
	'dm-consultoria-admin-001',
	'DMconsultoria',
	'topografiadm@gmail.com',
	'DMconsultoria',
	'local',
	'admin',
	true,
	true,
	true,
	true,
	true,
	true,
	NOW(),
	NOW(),
	NOW()
);

-- Verificar se o usuário foi criado
SELECT id, name, email, username, role FROM users WHERE name = 'DMconsultoria';

-- Verificar todas as tabelas
SHOW TABLES;

-- Contar registros
SELECT COUNT(*) as total_users FROM users;
