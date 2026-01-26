-- DropForeignKey
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_authorId_fkey";

-- AlterTable
ALTER TABLE "Entity" ALTER COLUMN "authorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
