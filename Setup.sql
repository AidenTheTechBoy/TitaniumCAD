CREATE DATABASE IF NOT EXISTS CAD;
USE CAD;

CREATE TABLE `Verification` (
    `user_id` INT,
    `member_id` INT,
    `code` VARCHAR(255) NOT NULL,
    `expiration` BIGINT NOT NULL 
);

CREATE TABLE `ForgotPassword` (
    `user_id` INT,
    `member_id` INT,
    `code` VARCHAR(255) NOT NULL,
    `expiration` BIGINT NOT NULL 
);

CREATE TABLE `Cookies` (
    `user_id` INT,
    `member_id` INT,
    `session` VARCHAR(255) NOT NULL,
    `expiration` BIGINT NOT NULL
);

CREATE TABLE `Users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `username` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `customer_id` VARCHAR(50) UNIQUE,
    `subscription_id` VARCHAR(50) UNIQUE,
    `verified` BOOLEAN NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `Communities` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255),
    `user_id` INT NOT NULL,
    `access_code` VARCHAR(255) NOT NULL UNIQUE,
    `plan` INT NOT NULL,
    `status` VARCHAR(255),
    `public` BOOLEAN,
    `webhook_global` VARCHAR(100),
    `webhook_calls` VARCHAR(100),
    `code_available` VARCHAR(15),
    `code_unavailable` VARCHAR(15),
    `code_busy` VARCHAR(15),
    `code_enroute` VARCHAR(15),
    `code_onscene` VARCHAR(15),
    PRIMARY KEY (`id`)
);

CREATE TABLE `Servers` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `community_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `ip` VARCHAR(100),
    `secret` VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
);

CREATE TABLE `Members` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `community_id` INT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `verified` BOOLEAN NOT NULL,
    `permission_manage_settings` BOOLEAN,
    `permission_manage_servers` BOOLEAN,
    `permission_manage_members` BOOLEAN,
    `permission_manage_departments` BOOLEAN,
    `permission_manage_codes` BOOLEAN,
    `permission_civilian` BOOLEAN,
    `permission_police_mdt` BOOLEAN,
    `permission_fire_mdt` BOOLEAN,
    `permission_dispatch` BOOLEAN,
    PRIMARY KEY (`id`)
);

CREATE TABLE `Civilians` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `member_id` INT NOT NULL,
    `community_id` INT NOT NULL,
    `first_name` VARCHAR(30) NOT NULL,
    `last_name` VARCHAR(30) NOT NULL,
    `middle_initial` VARCHAR(1),
    `date_of_birth` VARCHAR(10) NOT NULL,
    `place_of_residence` VARCHAR(50),
    `zip_code` VARCHAR(10),
    `occupation` VARCHAR(50),
    `height` VARCHAR(10),
    `weight` VARCHAR(10),
    `hair_color` VARCHAR(15),
    `eye_color` VARCHAR(15),
    
    `license_type` VARCHAR(20),
    `license_expiration` VARCHAR(20),
    `license_status` VARCHAR(20),

    PRIMARY KEY (`id`)
);

CREATE TABLE `Vehicles` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `community_id` INT NOT NULL,
    `civilian_id` INT NOT NULL,
    `plate` VARCHAR(10) NOT NULL,
    `color` VARCHAR(20) NOT NULL,
    `make` VARCHAR(30) NOT NULL,
    `model` VARCHAR(30) NOT NULL,
    `year` INT NOT NULL,
    `registration` VARCHAR(20) NOT NULL,
    `insurance` VARCHAR(20) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `Firearms` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `community_id` INT NOT NULL,
    `civilian_id` INT NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `registration` VARCHAR(20) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `Departments` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `community_id` INT NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    -- ^ police / fire / civilian
    PRIMARY KEY (`id`)
);

CREATE TABLE `911` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `server_id` INT NOT NULL,
    `caller` VARCHAR(100) NOT NULL,
    `details` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `timestamp` VARCHAR(20) NOT NULL,
    `active` BOOLEAN NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `Units` (
    `server_id` INT NOT NULL,
    `member_id` INT NOT NULL,
    `ingame_id` INT NOT NULL,
    `current_call` INT,
    `callsign` VARCHAR(20),
    `name` VARCHAR(30) NOT NULL,
    `location` VARCHAR(30),
    `status` VARCHAR(20) NOT NULL,
    `last_update` VARCHAR(20) NOT NULL
);

CREATE TABLE `Bolos` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `server_id` INT NOT NULL,
    `plate` VARCHAR(255),
    `vehicle` VARCHAR(255),
    `charges` VARCHAR(255),
    `flags` VARCHAR(255),
    PRIMARY KEY (`id`)
);

CREATE TABLE `Codes` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `community_id` INT NOT NULL,
    `code` VARCHAR(10),
    `meaning` VARCHAR(30),
    PRIMARY KEY (`id`)
);

CREATE TABLE `Calls` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `server_id` INT NOT NULL,
    `origin` VARCHAR(20), --Called In / Officer Initiated / Dispatched / 
    `status` VARCHAR(20), --Pending / Active / Closed
    `priority` VARCHAR(3), -- 1 / 2 / 3
    `address` VARCHAR(100),
    `postal` VARCHAR(50),
    `title` VARCHAR(50),
    `code` VARCHAR(40),
    `primary` VARCHAR(20),
    `description` TEXT,
    `notes` TEXT,
    PRIMARY KEY (`id`)
);