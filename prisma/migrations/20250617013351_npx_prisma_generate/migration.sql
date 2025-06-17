/*
  Warnings:

  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `teamName` on table `QuizSet` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "QuizSet" ALTER COLUMN "teamName" SET NOT NULL;

-- DropTable
DROP TABLE "session";

-- CreateTable
CREATE TABLE "userLogin" (
    "idx" SERIAL NOT NULL,
    "userName" VARCHAR(20) NOT NULL,
    "userPWD" VARCHAR(20) NOT NULL,

    CONSTRAINT "userLogin_pkey" PRIMARY KEY ("idx")
);
