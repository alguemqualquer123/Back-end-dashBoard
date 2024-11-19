-- CreateTable
CREATE TABLE `Licenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resource` VARCHAR(191) NOT NULL,
    `license` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `time` DATETIME(3) NOT NULL,
    `expiredIn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Licenses_license_key`(`license`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
