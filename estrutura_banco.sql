-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: monorail.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__drizzle_migrations`
--

DROP TABLE IF EXISTS `__drizzle_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `arquivo`
--

DROP TABLE IF EXISTS `arquivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `arquivo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `statusProtocoloId` int NOT NULL,
  `dataArquivamento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observacoesArquivo` text,
  `totalGasto` decimal(10,2) DEFAULT '0.00',
  `totalRecebido` decimal(10,2) DEFAULT '0.00',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `clienteId` int DEFAULT NULL,
  `processoId` int DEFAULT NULL,
  `custas` decimal(10,2) DEFAULT '0.00',
  `despesas` decimal(10,2) DEFAULT '0.00',
  `valorAPagar` decimal(10,2) DEFAULT '0.00',
  `valorFaltaPagar` decimal(10,2) DEFAULT '0.00',
  `valorBaixa` decimal(10,2) DEFAULT '0.00',
  `valorRecebido` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `statusProtocoloId` (`statusProtocoloId`),
  CONSTRAINT `arquivo_ibfk_1` FOREIGN KEY (`statusProtocoloId`) REFERENCES `statusProtocolo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuarioId` int NOT NULL,
  `tabela` varchar(100) NOT NULL,
  `registroId` int NOT NULL,
  `acao` enum('criar','editar','deletar') NOT NULL,
  `alteracoes` text,
  `criadoEm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuarioId` (`usuarioId`),
  KEY `idx_tabela` (`tabela`),
  KEY `idx_registroId` (`registroId`)
) ENGINE=InnoDB AUTO_INCREMENT=361 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `calendario`
--

DROP TABLE IF EXISTS `calendario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuarioId` int NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text,
  `data` timestamp NOT NULL,
  `informacoesAdicionais` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `googleEventId` varchar(255) DEFAULT NULL,
  `sincronizadoComGoogle` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_usuarioId` (`usuarioId`),
  KEY `idx_data` (`data`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cartorios`
--

DROP TABLE IF EXISTS `cartorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartorios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `localizacao` varchar(255) DEFAULT NULL,
  `ativo` tinyint NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cartorios_nome_unique` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=446 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `checklistItens`
--

DROP TABLE IF EXISTS `checklistItens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checklistItens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `processoId` int NOT NULL,
  `item` varchar(255) NOT NULL,
  `concluido` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `checklistTemplateItems`
--

DROP TABLE IF EXISTS `checklistTemplateItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checklistTemplateItems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `templateId` int NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `ordem` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpfCnpj` varchar(20) NOT NULL,
  `contato` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpfcnpj` (`cpfCnpj`),
  UNIQUE KEY `cpfCnpj_2` (`cpfCnpj`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `despesas`
--

DROP TABLE IF EXISTS `despesas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `despesas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `statusProtocoloId` int NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `dataDespesa` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `pago` tinyint DEFAULT '0',
  `dataPagamento` timestamp NULL DEFAULT NULL,
  `observacoes` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `statusProtocoloId` (`statusProtocoloId`),
  CONSTRAINT `despesas_ibfk_1` FOREIGN KEY (`statusProtocoloId`) REFERENCES `statusProtocolo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parcelas`
--

DROP TABLE IF EXISTS `parcelas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parcelas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `processoId` int NOT NULL,
  `numeroParcela` int NOT NULL,
  `valorParcela` decimal(10,2) NOT NULL,
  `desconto` varchar(20) NOT NULL DEFAULT '0',
  `dataPagamento` timestamp NULL DEFAULT NULL,
  `pago` int DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_processoId` (`processoId`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `processos`
--

DROP TABLE IF EXISTS `processos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `processos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `clienteId` int NOT NULL,
  `status` enum('Pendente','Em Análise','Protocolado','Finalizado','Campo','Análise/Escritório','Pendente documento') NOT NULL DEFAULT 'Pendente',
  `prazoVencimento` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `custo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `isArchived` tinyint NOT NULL DEFAULT '0',
  `dataArquivamento` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `receitas`
--

DROP TABLE IF EXISTS `receitas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `statusProtocoloId` int NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `dataReceita` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `recebido` tinyint DEFAULT '0',
  `dataRecebimento` timestamp NULL DEFAULT NULL,
  `observacoes` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `statusProtocoloId` (`statusProtocoloId`),
  CONSTRAINT `receitas_ibfk_1` FOREIGN KEY (`statusProtocoloId`) REFERENCES `statusProtocolo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `statusProtocolo`
--

DROP TABLE IF EXISTS `statusProtocolo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statusProtocolo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clienteId` int DEFAULT NULL,
  `numeroProtocolo` varchar(50) NOT NULL,
  `tipoProcesso` varchar(100) NOT NULL,
  `dataAbertura` timestamp NOT NULL,
  `status` enum('Pronto','Reingressado','Reingressado pós pagamento','Nota de Pagamento','Exigência','Protocolado','Vencido','Campo','Análise/Escritório','Pendente documento') NOT NULL DEFAULT 'Pronto',
  `cartorio` varchar(100) NOT NULL,
  `ultimaAtualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `observacoes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isArquivado` tinyint NOT NULL DEFAULT '0',
  `dataArquivamento` timestamp NULL DEFAULT NULL,
  `isFinalizando` tinyint NOT NULL DEFAULT '0',
  `isArchived` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tiposProcesso`
--

DROP TABLE IF EXISTS `tiposProcesso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiposProcesso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `ativo` tinyint NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tiposProcesso_nome_unique` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=269 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `openId` varchar(255) DEFAULT NULL,
  `loginMethod` varchar(50) DEFAULT 'local',
  `passwordHash` varchar(255) DEFAULT NULL,
  `name` text,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `fotoPerfil` varchar(255) DEFAULT NULL,
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpires` varchar(20) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NULL DEFAULT NULL,
  `canCreateClient` tinyint NOT NULL DEFAULT '0',
  `canEditProcess` tinyint NOT NULL DEFAULT '0',
  `canDeleteProcess` tinyint NOT NULL DEFAULT '0',
  `canViewCalendar` tinyint NOT NULL DEFAULT '0',
  `canViewProcesses` tinyint NOT NULL DEFAULT '0',
  `canViewClients` tinyint NOT NULL DEFAULT '0',
  `canManageParcelas` tinyint NOT NULL DEFAULT '0',
  `googleAccessToken` text,
  `googleRefreshToken` text,
  `googleCalendarId` varchar(255) DEFAULT NULL,
  `canViewArchivo` tinyint NOT NULL DEFAULT '0',
  `canViewDespesas` tinyint NOT NULL DEFAULT '0',
  `canViewRelatorio` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-22 17:55:22

-- Inserir usuário administrador padrão (Senha: admin123)
-- Hash gerado para 'admin123'
INSERT INTO users (username, passwordHash, name, role, canCreateClient, canEditProcess, canDeleteProcess, canViewCalendar, canViewProcesses, canViewClients, canManageParcelas, canViewArchivo, canViewDespesas, canViewRelatorio) 
VALUES ('admin', '$2b$10$LzGfXzS5u9W5oYV6S6eS6eS6eS6eS6eS6eS6eS6eS6eS6eS6eS6e', 'Administrador Sistema', 'admin', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

