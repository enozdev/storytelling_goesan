-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "adminID" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_adminID_idx" ON "Session"("adminID");
