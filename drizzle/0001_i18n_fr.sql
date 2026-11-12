ALTER TABLE `services` ADD `title_fr` text;--> statement-breakpoint
ALTER TABLE `services` ADD `excerpt_fr` text;--> statement-breakpoint
ALTER TABLE `services` ADD `body_fr` text;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `summary_fr` text;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `description_fr` text;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `highlights_fr` text DEFAULT '[]' NOT NULL;