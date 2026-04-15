CREATE TABLE `statusProtocolo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`numeroProtocolo` varchar(50) NOT NULL,
	`tipoProcesso` enum('Georreferenciamento','Certidão de Localização','Averbação de Qualificação') NOT NULL,
	`dataAbertura` timestamp NOT NULL,
	`status` enum('Pronto','Reivindicado','Vencido') NOT NULL DEFAULT 'Pronto',
	`cartorio` varchar(100) NOT NULL,
	`ultimaAtualizacao` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `statusProtocolo_id` PRIMARY KEY(`id`),
	CONSTRAINT `statusProtocolo_numeroProtocolo_unique` UNIQUE(`numeroProtocolo`)
);
