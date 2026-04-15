ALTER TABLE `users` ADD `fotoPerfil` text;--> statement-breakpoint
ALTER TABLE `users` ADD `resetPasswordToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `resetPasswordExpires` timestamp;