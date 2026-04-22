ALTER TABLE `processos` ADD `isArchived` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `processos` ADD `dataArquivamento` timestamp;