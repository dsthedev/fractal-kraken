/*
  Warnings:

  - You are about to drop the column `baseUnit` on the `MeasurementUnit` table. All the data in the column will be lost.
  - You are about to drop the column `conversionFactor` on the `MeasurementUnit` table. All the data in the column will be lost.
  - You are about to drop the column `dimension` on the `MeasurementUnit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MeasurementUnit" DROP COLUMN "baseUnit",
DROP COLUMN "conversionFactor",
DROP COLUMN "dimension";
