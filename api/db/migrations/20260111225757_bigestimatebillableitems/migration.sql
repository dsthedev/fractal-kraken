-- AlterTable
ALTER TABLE "BillableItem" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "BillableItem_estimateId_sortOrder_idx" ON "BillableItem"("estimateId", "sortOrder");
