-- CreateTable
CREATE TABLE "QuizSet" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "QuizSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "quizSetId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "questionOrder" INTEGER NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adminLogin" (
    "ID" SERIAL NOT NULL,
    "adminID" VARCHAR(20) NOT NULL,
    "adminPWD" VARCHAR(20) NOT NULL,

    CONSTRAINT "adminLogin_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "adminID" VARCHAR(20) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quiz_quizSetId_idx" ON "Quiz"("quizSetId");

-- CreateIndex
CREATE INDEX "session_adminID_idx" ON "session"("adminID");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
