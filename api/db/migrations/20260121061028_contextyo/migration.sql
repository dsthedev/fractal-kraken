/*
  Warnings:

  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Rate" ADD COLUMN     "context" TEXT;

-- DropTable
DROP TABLE "Service";

-- DropEnum
DROP TYPE "ServiceAction";
