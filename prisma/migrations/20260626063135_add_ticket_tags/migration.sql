-- CreateTable
CREATE TABLE "TicketTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TicketToTicketTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TicketToTicketTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketTag_name_key" ON "TicketTag"("name");

-- CreateIndex
CREATE INDEX "_TicketToTicketTag_B_index" ON "_TicketToTicketTag"("B");

-- AddForeignKey
ALTER TABLE "_TicketToTicketTag" ADD CONSTRAINT "_TicketToTicketTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketToTicketTag" ADD CONSTRAINT "_TicketToTicketTag_B_fkey" FOREIGN KEY ("B") REFERENCES "TicketTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
