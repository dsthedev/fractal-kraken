-- CreateEnum
CREATE TYPE "UnitDimension" AS ENUM ('LINEAR', 'SQUARE', 'CUBIC', 'VOLUME', 'TEMPORAL', 'COUNT', 'AREA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "UnitCategory" AS ENUM ('LENGTH', 'AREA', 'VOLUME', 'TIME', 'COUNT', 'CUSTOM');

-- CreateTable
CREATE TABLE "MeasurementUnit" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "pluralName" TEXT NOT NULL,
    "shortName" TEXT,
    "symbol" TEXT,
    "notation" TEXT,
    "dimension" "UnitDimension" NOT NULL,
    "description" TEXT,
    "conversionFactor" DOUBLE PRECISION,
    "category" "UnitCategory" NOT NULL,
    "baseUnit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementUnit_pkey" PRIMARY KEY ("id")
);
