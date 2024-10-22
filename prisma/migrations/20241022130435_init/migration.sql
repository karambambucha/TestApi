/*
  Warnings:

  - A unique constraint covering the columns `[calltask_id]` on the table `Calls` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Calls_calltask_id_key` ON `Calls`(`calltask_id`);
