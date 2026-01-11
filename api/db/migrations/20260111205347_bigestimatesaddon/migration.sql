-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "BillableItem" ADD COLUMN     "estimateId" INTEGER;

-- CreateTable
CREATE TABLE "Estimate" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT,
    "status" "EstimateStatus" NOT NULL DEFAULT 'DRAFT',
    "installerEntityId" INTEGER,
    "clientEntityId" INTEGER,
    "retailerEntityId" INTEGER,
    "jobAddressLine1" TEXT,
    "jobAddressLine2" TEXT,
    "jobCity" TEXT,
    "jobState" TEXT,
    "jobPostalCode" TEXT,
    "jobCountry" TEXT DEFAULT 'US',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "estimatedMinutesTotal" INTEGER,
    "authorId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entityId" INTEGER,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_uuid_key" ON "Estimate"("uuid");

-- CreateIndex
CREATE INDEX "Estimate_authorId_idx" ON "Estimate"("authorId");

-- CreateIndex
CREATE INDEX "Estimate_status_idx" ON "Estimate"("status");

-- AddForeignKey
ALTER TABLE "BillableItem" ADD CONSTRAINT "BillableItem_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_installerEntityId_fkey" FOREIGN KEY ("installerEntityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_clientEntityId_fkey" FOREIGN KEY ("clientEntityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_retailerEntityId_fkey" FOREIGN KEY ("retailerEntityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
