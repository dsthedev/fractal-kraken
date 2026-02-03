-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "isBusiness" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usesNickname" BOOLEAN NOT NULL DEFAULT false;
