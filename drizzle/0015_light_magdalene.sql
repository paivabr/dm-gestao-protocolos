CREATE TABLE `arquivo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`statusProtocoloId` int,
	`processoId` int,
	`clienteId` int,
	`dataArquivamento` timestamp NOT NULL DEFAULT (now()),
	`observacoesArquivo` text,
	`totalGasto` decimal(10,2) DEFAULT '0.00',
	`totalRecebido` decimal(10,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `arquivo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `despesas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`statusProtocoloId` int NOT NULL,
	`descricao` varchar(255) NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`dataDespesa` timestamp NOT NULL DEFAULT (now()),
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
	`descricao` varchar(255) NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`dataReceita` timestamp NOT NULL DEFAULT (now()),
	`recebido` tinyint NOT NULL DEFAULT 0,
	`dataRecebimento` timestamp,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `receitas_id` PRIMARY KEY(`id`)
);
