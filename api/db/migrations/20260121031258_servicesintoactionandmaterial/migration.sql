-- DropForeignKey
ALTER TABLE "BillableItem" DROP CONSTRAINT "BillableItem_serviceId_fkey";

-- AlterTable
ALTER TABLE "BillableItem" ALTER COLUMN "serviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BillableItem" ADD CONSTRAINT "BillableItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
