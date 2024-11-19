-- AlterTable
ALTER TABLE `licenses` ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Licenses` ADD CONSTRAINT `Licenses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
