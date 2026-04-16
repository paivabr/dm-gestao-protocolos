ALTER TABLE `users` DROP INDEX `users_username_unique`;--> statement-breakpoint
ALTER TABLE `statusProtocolo` MODIFY COLUMN `status` enum('Pronto','Reingressado','Reingressado pós pagamento','Nota de Pagamento','Exigência','Protocolado','Vencido') NOT NULL DEFAULT 'Pronto';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `username` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `fotoPerfil` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `resetPasswordExpires` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `loginMethod` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_openId_unique` UNIQUE(`openId`);