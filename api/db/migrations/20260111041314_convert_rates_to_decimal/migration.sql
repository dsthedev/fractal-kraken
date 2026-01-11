/*
  Warnings:

  - You are about to alter the column `subAmount` on the `Rate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `retailAmount` on the `Rate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('SUB', 'RETAIL');

-- AlterTable
ALTER TABLE "Rate" ALTER COLUMN "subAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "retailAmount" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "BillableItem" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "pricingType" "PricingType" NOT NULL,
    "quantity" DECIMAL(10,4) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "estimatedMinutesPerUnit" INTEGER,
    "notes" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillableItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BillableItem" ADD CONSTRAINT "BillableItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillableItem" ADD CONSTRAINT "BillableItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillableItem" ADD CONSTRAINT "BillableItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
