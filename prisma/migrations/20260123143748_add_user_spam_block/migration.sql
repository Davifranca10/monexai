-- CreateTable
CREATE TABLE "user_spam_blocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blockedUntil" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_spam_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_spam_blocks_userId_key" ON "user_spam_blocks"("userId");

-- CreateIndex
CREATE INDEX "user_spam_blocks_userId_idx" ON "user_spam_blocks"("userId");

-- AddForeignKey
ALTER TABLE "user_spam_blocks" ADD CONSTRAINT "user_spam_blocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
