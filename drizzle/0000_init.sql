CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_unique` ON `brands` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text DEFAULT 'contact' NOT NULL,
	`vehicle_id` integer,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`message` text,
	`meta` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `inquiries_status_idx` ON `inquiries` (`status`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`kind` text DEFAULT 'image' NOT NULL,
	`name` text,
	`width` integer,
	`height` integer,
	`size` integer,
	`blur_data_url` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text,
	`body` text,
	`icon` text DEFAULT 'sparkles' NOT NULL,
	`cover_image` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author` text NOT NULL,
	`role` text,
	`quote` text NOT NULL,
	`rating` integer DEFAULT 5 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` integer NOT NULL,
	`last_login_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vehicle_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_id` integer NOT NULL,
	`url` text NOT NULL,
	`width` integer,
	`height` integer,
	`blur_data_url` text,
	`alt` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `vehicle_images_vehicle_idx` ON `vehicle_images` (`vehicle_id`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`brand_id` integer,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`price_on_request` integer DEFAULT false NOT NULL,
	`condition` text DEFAULT 'Used' NOT NULL,
	`mileage_km` integer,
	`body_style` text,
	`drivetrain` text,
	`transmission` text,
	`fuel_type` text,
	`engine` text,
	`horsepower` integer,
	`exterior_color` text,
	`interior_color` text,
	`vin` text,
	`stock_number` text,
	`summary` text,
	`description` text,
	`highlights` text DEFAULT '[]' NOT NULL,
	`video_url` text,
	`status` text DEFAULT 'available' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_slug_unique` ON `vehicles` (`slug`);--> statement-breakpoint
CREATE INDEX `vehicles_status_idx` ON `vehicles` (`status`);--> statement-breakpoint
CREATE INDEX `vehicles_brand_idx` ON `vehicles` (`brand_id`);