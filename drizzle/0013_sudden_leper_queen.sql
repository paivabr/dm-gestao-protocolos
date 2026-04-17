ALTER TABLE `calendario` ADD `googleEventId` varchar(255);--> statement-breakpoint
ALTER TABLE `calendario` ADD `sincronizadoComGoogle` tinyint DEFAULT 0 NOT NULL;