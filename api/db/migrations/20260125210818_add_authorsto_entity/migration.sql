-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "authorId" TEXT;

-- DropEnum
DROP TYPE "UnitDimension";

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
