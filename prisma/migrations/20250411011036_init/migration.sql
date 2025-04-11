-- CreateTable
CREATE TABLE "QuizDB" (
    "quizID" SERIAL NOT NULL,
    "quizIP" VARCHAR(100) NOT NULL,
    "quizQR" TEXT NOT NULL,
    "quizQ" TEXT NOT NULL,
    "quizAA" TEXT NOT NULL,
    "quizAB" TEXT NOT NULL,
    "quizAC" TEXT NOT NULL,
    "quizAD" TEXT NOT NULL,
    "quizAns" TEXT NOT NULL,

    CONSTRAINT "QuizDB_pkey" PRIMARY KEY ("quizID")
);

-- CreateTable
CREATE TABLE "adminLogin" (
    "ID" SERIAL NOT NULL,
    "adminID" VARCHAR(20) NOT NULL,
    "adminPWD" VARCHAR(20) NOT NULL,

    CONSTRAINT "adminLogin_pkey" PRIMARY KEY ("ID")
);
