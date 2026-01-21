/*
  Warnings:

  - You are about to drop the column `serviceId` on the `BillableItem` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `Rate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BillableItem" DROP CONSTRAINT "BillableItem_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Rate" DROP CONSTRAINT "Rate_serviceId_fkey";

-- DropIndex
DROP INDEX "Rate_authorId_serviceId_unitId_key";

-- DropIndex
DROP INDEX "Rate_serviceId_unitId_idx";

-- AlterTable
ALTER TABLE "BillableItem" DROP COLUMN "serviceId";

-- AlterTable
ALTER TABLE "Rate" DROP COLUMN "serviceId";
