CREATE TABLE `arquivo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`statusProtocoloId` int NOT NULL,
	`processoId` int,
	`dataArquivamento` timestamp NOT NULL DEFAULT (now()),
	`observacoes` text,
	`totalGasto` decimal(10,2) DEFAULT '0',
	`totalRecebido` decimal(10,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `arquivo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `despesas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`statusProtocoloId` int NOT NULL,
	`processoId` int,
	`descricao` varchar(255) NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`pago` tinyint NOT NULL DEFAULT 0,
	`dataPagamento` timestamp,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `despesas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `receitas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`statusProtocoloId` int NOT NULL,
	`processoId` int,
	`descricao` varchar(255) NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`recebido` tinyint NOT NULL DEFAULT 0,
	`dataRecebimento` timestamp,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `receitas_id` PRIMARY KEY(`id`)
);
