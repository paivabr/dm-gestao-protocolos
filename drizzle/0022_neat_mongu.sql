CREATE TABLE `cartorios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`localizacao` varchar(255),
	`ativo` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cartorios_id` PRIMARY KEY(`id`),
	CONSTRAINT `cartorios_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `tiposProcesso` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`ativo` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tiposProcesso_id` PRIMARY KEY(`id`),
	CONSTRAINT `tiposProcesso_nome_unique` UNIQUE(`nome`)
);
