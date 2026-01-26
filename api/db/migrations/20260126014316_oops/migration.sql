-- CreateTable
CREATE TABLE "_entityUsers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_entityUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_entityUsers_B_index" ON "_entityUsers"("B");

-- AddForeignKey
ALTER TABLE "_entityUsers" ADD CONSTRAINT "_entityUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_entityUsers" ADD CONSTRAINT "_entityUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
