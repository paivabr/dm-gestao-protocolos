ALTER TABLE `clientes` DROP INDEX `clientes_cpfCnpj_unique`;--> statement-breakpoint
ALTER TABLE `clientes` ADD `cpfcnpj` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `statusProtocolo` ADD `tipoprocesso` enum('Georreferenciamento','Certidão de Localização','Averbação de Qualificação') NOT NULL;--> statement-breakpoint
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_cpfcnpj_unique` UNIQUE(`cpfcnpj`);--> statement-breakpoint
ALTER TABLE `clientes` DROP COLUMN `cpfCnpj`;--> statement-breakpoint
ALTER TABLE `statusProtocolo` DROP COLUMN `tipoProcesso`;