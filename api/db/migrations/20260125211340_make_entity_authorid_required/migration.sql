/*
  Warnings:

  - Made the column `authorId` on table `Entity` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_authorId_fkey";

-- AlterTable
ALTER TABLE "Entity" ALTER COLUMN "authorId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Entity_authorId_idx" ON "Entity"("authorId");

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
