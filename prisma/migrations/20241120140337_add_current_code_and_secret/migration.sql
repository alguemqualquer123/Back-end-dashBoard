-- AlterTable
ALTER TABLE `user` ADD COLUMN `currentCode` VARCHAR(191) NULL,
    ADD COLUMN `secret` VARCHAR(191) NULL;
