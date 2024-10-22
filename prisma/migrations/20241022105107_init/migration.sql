/*
  Warnings:

  - You are about to drop the column `calltype_id` on the `calls` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_id` on the `calls` table. All the data in the column will be lost.
  - Added the required column `task_id` to the `Calls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Calls` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `calls` DROP FOREIGN KEY `Calls_calltype_id_fkey`;

-- DropForeignKey
ALTER TABLE `calls` DROP FOREIGN KEY `Calls_schedule_id_fkey`;

-- AlterTable
ALTER TABLE `calls` DROP COLUMN `calltype_id`,
    DROP COLUMN `schedule_id`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `task_id` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `Status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Status_type_key`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status_id` INTEGER NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `info` JSON NOT NULL,
    `calltype_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Calls` ADD CONSTRAINT `Calls_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tasks` ADD CONSTRAINT `Tasks_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `Status`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tasks` ADD CONSTRAINT `Tasks_calltype_id_fkey` FOREIGN KEY (`calltype_id`) REFERENCES `CallType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
