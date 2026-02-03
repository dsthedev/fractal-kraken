-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "jobName" TEXT,
ADD COLUMN     "payeeName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "payorName" TEXT NOT NULL DEFAULT '';
