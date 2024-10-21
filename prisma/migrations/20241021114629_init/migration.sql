-- CreateTable
CREATE TABLE `CallType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `hours_before_call` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Calls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `calltask_id` INTEGER NOT NULL,
    `schedule_id` INTEGER NOT NULL,
    `calltype_id` INTEGER NOT NULL,
    `call_result` JSON NOT NULL,
    `call_status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Calls` ADD CONSTRAINT `Calls_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Calls` ADD CONSTRAINT `Calls_calltype_id_fkey` FOREIGN KEY (`calltype_id`) REFERENCES `CallType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
