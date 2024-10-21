/*
  Warnings:

  - You are about to drop the column `is_notified` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `calls` MODIFY `call_result` JSON NULL,
    MODIFY `call_status` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `schedule` DROP COLUMN `is_notified`,
    DROP COLUMN `result`;
