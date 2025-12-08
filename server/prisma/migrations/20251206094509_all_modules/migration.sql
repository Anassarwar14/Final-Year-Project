/*
  Warnings:

  - The primary key for the `account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `account` table. All the data in the column will be lost.
  - The primary key for the `invitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `invitation` table. All the data in the column will be lost.
  - The primary key for the `member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `member` table. All the data in the column will be lost.
  - The primary key for the `organization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `organization` table. All the data in the column will be lost.
  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `session` table. All the data in the column will be lost.
  - The primary key for the `twoFactor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `twoFactor` table. All the data in the column will be lost.
  - The primary key for the `verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - The required column `id` was added to the `account` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `id` to the `invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `twoFactor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "AiChatRole" AS ENUM ('USER', 'MODEL');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'CRYPTO', 'ETF', 'MUTUAL_FUND', 'COMMODITY');

-- CreateEnum
CREATE TYPE "LearningStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NewsSentiment" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "member" DROP CONSTRAINT "member_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "member" DROP CONSTRAINT "member_userId_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- DropForeignKey
ALTER TABLE "twoFactor" DROP CONSTRAINT "twoFactor_userId_fkey";

-- AlterTable
ALTER TABLE "account" DROP CONSTRAINT "account_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "invitation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "member" DROP CONSTRAINT "member_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "member_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "organization" DROP CONSTRAINT "organization_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "organization_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "session" DROP CONSTRAINT "session_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "twoFactor" DROP CONSTRAINT "twoFactor_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "verification" DROP CONSTRAINT "verification_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "twoFactorEnabled" BOOLEAN,
    "role" "UserRole" DEFAULT 'USER',
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchange" TEXT,
    "currency" TEXT,
    "logoUrl" TEXT,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "AiChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "sources" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cashBalance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holding" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "averageBuyPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "pricePerUnit" DECIMAL(65,30) NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalValue" DECIMAL(65,30) NOT NULL,
    "cashValue" DECIMAL(65,30) NOT NULL,
    "holdingsValue" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "LearningCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "LearningArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "status" "LearningStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "virtualBalance" DECIMAL(65,30) NOT NULL DEFAULT 100000.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulatorHolding" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "averageBuyPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "SimulatorHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulatorTransaction" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "pricePerUnit" DECIMAL(65,30) NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulatorTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulatorSnapshot" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalValue" DECIMAL(65,30) NOT NULL,
    "cashValue" DECIMAL(65,30) NOT NULL,
    "holdingsValue" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "SimulatorSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT,
    "author" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    "sentiment" "NewsSentiment" NOT NULL DEFAULT 'NEUTRAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssetToNewsArticle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssetToNewsArticle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_symbol_key" ON "Asset"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Holding_portfolioId_assetId_key" ON "Holding"("portfolioId", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioSnapshot_portfolioId_date_key" ON "PortfolioSnapshot"("portfolioId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "LearningCategory_name_key" ON "LearningCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProgress_userId_articleId_key" ON "LearningProgress"("userId", "articleId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulatorProfile_userId_key" ON "SimulatorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulatorHolding_profileId_assetId_key" ON "SimulatorHolding"("profileId", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulatorSnapshot_profileId_date_key" ON "SimulatorSnapshot"("profileId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_url_key" ON "NewsArticle"("url");

-- CreateIndex
CREATE INDEX "_AssetToNewsArticle_B_index" ON "_AssetToNewsArticle"("B");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatSession" ADD CONSTRAINT "AiChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatMessage" ADD CONSTRAINT "AiChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AiChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningArticle" ADD CONSTRAINT "LearningArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LearningCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "LearningArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatorProfile" ADD CONSTRAINT "SimulatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatorHolding" ADD CONSTRAINT "SimulatorHolding_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SimulatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatorHolding" ADD CONSTRAINT "SimulatorHolding_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatorTransaction" ADD CONSTRAINT "SimulatorTransaction_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SimulatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatorTransaction" ADD CONSTRAINT "SimulatorTransaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatorSnapshot" ADD CONSTRAINT "SimulatorSnapshot_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SimulatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetToNewsArticle" ADD CONSTRAINT "_AssetToNewsArticle_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetToNewsArticle" ADD CONSTRAINT "_AssetToNewsArticle_B_fkey" FOREIGN KEY ("B") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
