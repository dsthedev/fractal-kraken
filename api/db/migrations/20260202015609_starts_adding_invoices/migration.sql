-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InvoicePaymentStatus" AS ENUM ('UNPAID', 'OUTSTANDING', 'PAID');

-- AlterTable
ALTER TABLE "BillableItem" ADD COLUMN     "invoiceUuid" TEXT;

-- CreateTable
CREATE TABLE "Invoice" (
    "uuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "payStatus" "InvoicePaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "jobStartedAt" TIMESTAMP(3),
    "jobFinishedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "payorEntityId" INTEGER NOT NULL,
    "payeeEntityId" INTEGER NOT NULL,
    "sourceEstimateId" INTEGER,
    "sourceInstallerEntityId" INTEGER,
    "sourceClientEntityId" INTEGER,
    "sourceRetailerEntityId" INTEGER,
    "payeeAddressLine1" TEXT,
    "payeeAddressLine2" TEXT,
    "payeeCity" TEXT,
    "payeeState" TEXT,
    "payeePostalCode" TEXT,
    "payeeCountry" TEXT DEFAULT 'US',
    "payorAddressLine1" TEXT,
    "payorAddressLine2" TEXT,
    "payorCity" TEXT,
    "payorState" TEXT,
    "payorPostalCode" TEXT,
    "payorCountry" TEXT DEFAULT 'US',
    "jobAddressLine1" TEXT,
    "jobAddressLine2" TEXT,
    "jobCity" TEXT,
    "jobState" TEXT,
    "jobPostalCode" TEXT,
    "jobCountry" TEXT DEFAULT 'US',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "entityId" INTEGER,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_authorId_idx" ON "Invoice"("authorId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- AddForeignKey
ALTER TABLE "BillableItem" ADD CONSTRAINT "BillableItem_invoiceUuid_fkey" FOREIGN KEY ("invoiceUuid") REFERENCES "Invoice"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_payorEntityId_fkey" FOREIGN KEY ("payorEntityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_payeeEntityId_fkey" FOREIGN KEY ("payeeEntityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_sourceEstimateId_fkey" FOREIGN KEY ("sourceEstimateId") REFERENCES "Estimate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_sourceInstallerEntityId_fkey" FOREIGN KEY ("sourceInstallerEntityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_sourceClientEntityId_fkey" FOREIGN KEY ("sourceClientEntityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_sourceRetailerEntityId_fkey" FOREIGN KEY ("sourceRetailerEntityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
