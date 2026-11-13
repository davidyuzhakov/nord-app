-- AlterTable
ALTER TABLE "User" ADD COLUMN "activeChurchId" UUID;

-- CreateTable
CREATE TABLE "Church" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "inviteToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchMember" (
    "userId" UUID NOT NULL,
    "churchId" UUID NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurchMember_pkey" PRIMARY KEY ("userId", "churchId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Church_inviteToken_key" ON "Church"("inviteToken");

-- CreateIndex
CREATE INDEX "ChurchMember_churchId_idx" ON "ChurchMember"("churchId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeChurchId_fkey" FOREIGN KEY ("activeChurchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Church" ADD CONSTRAINT "Church_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchMember" ADD CONSTRAINT "ChurchMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchMember" ADD CONSTRAINT "ChurchMember_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
