-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "recurring_rule_userId_transactionType_isActive_idx" ON "recurring_rule"("userId", "transactionType", "isActive");

-- CreateIndex
CREATE INDEX "transaction_userId_type_date_idx" ON "transaction"("userId", "type", "date");

-- CreateIndex
CREATE INDEX "transaction_userId_categoryId_idx" ON "transaction"("userId", "categoryId");
