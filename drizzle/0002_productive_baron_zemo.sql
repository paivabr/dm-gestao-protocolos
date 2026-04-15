CREATE TABLE `auditoria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`tabela` varchar(100) NOT NULL,
	`registroId` int NOT NULL,
	`acao` enum('criar','editar','deletar') NOT NULL,
	`alteracoes` text,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditoria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`data` timestamp NOT NULL,
	`informacoesAdicionais` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parcelas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processoId` int NOT NULL,
	`numeroParcela` int NOT NULL,
	`valorParcela` varchar(20) NOT NULL,
	`desconto` varchar(20) NOT NULL DEFAULT '0',
	`dataPagamento` timestamp,
	`pago` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parcelas_id` PRIMARY KEY(`id`)
);
