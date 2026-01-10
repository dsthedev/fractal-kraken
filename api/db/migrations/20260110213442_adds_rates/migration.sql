-- CreateTable
CREATE TABLE "Rate" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "subAmount" DECIMAL(65,30) NOT NULL,
    "retailAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "authorId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rate_authorId_idx" ON "Rate"("authorId");

-- CreateIndex
CREATE INDEX "Rate_serviceId_unitId_idx" ON "Rate"("serviceId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Rate_authorId_serviceId_unitId_key" ON "Rate"("authorId", "serviceId", "unitId");

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
