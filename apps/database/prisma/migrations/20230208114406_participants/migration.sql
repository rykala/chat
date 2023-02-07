/*
  Warnings:

  - You are about to drop the column `read` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "read";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status";

-- DropEnum
DROP TYPE "UserStatus";
