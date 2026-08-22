CREATE TABLE `firmwares` (
	`id` text PRIMARY KEY NOT NULL,
	`model` text NOT NULL,
	`version` integer NOT NULL,
	`sha256` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`url` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `firmwares_model_version_idx` ON `firmwares` (`model`,`version`);