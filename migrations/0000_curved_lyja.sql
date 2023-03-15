CREATE TABLE `users` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`username` varchar(60) NOT NULL DEFAULT '',
	`password` varchar(256) NOT NULL DEFAULT 'no-password-specified',
	`useAsDisplayName` enum('username','email','realName') NOT NULL DEFAULT 'username',
	`admin` boolean NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX usernameIndex ON users (`username`);