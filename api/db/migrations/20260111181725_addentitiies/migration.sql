-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('CONTRACTOR', 'INSTALLER', 'CLIENT', 'RETAILER', 'SUPPLIER', 'COMPANY', 'INDIVIDUAL', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultEntityId" INTEGER,
ADD COLUMN     "defaultRetailerEntityId" INTEGER;

-- CreateTable
CREATE TABLE "Entity" (
    "id" SERIAL NOT NULL,
    "type" "EntityType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'US',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultEntityId_fkey" FOREIGN KEY ("defaultEntityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultRetailerEntityId_fkey" FOREIGN KEY ("defaultRetailerEntityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
