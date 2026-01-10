-- CreateEnum
CREATE TYPE "ServiceAction" AS ENUM ('INSTALL', 'REMOVE', 'REPLACE', 'REPAIR', 'FINISH', 'PREPARE', 'CLEAN', 'MOVE', 'INSPECT', 'CUSTOM');

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "action" "ServiceAction" NOT NULL,
    "material" TEXT NOT NULL,
    "context" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);
