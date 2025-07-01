-- CreateTable
CREATE TABLE "admin" (
    "ID" SERIAL NOT NULL,
    "adminID" VARCHAR(20) NOT NULL,
    "adminPWD" VARCHAR(20) NOT NULL,

    CONSTRAINT "adminLogin_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "user" (
    "idx" SERIAL NOT NULL,
    "group" VARCHAR(255) NOT NULL,
    "userTeamName" VARCHAR(255) NOT NULL,
    "userTeamPassword" VARCHAR(255) NOT NULL,
    "access_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userLogin_pkey" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "group" (
    "idx" SERIAL NOT NULL,
    "school" VARCHAR NOT NULL,

    CONSTRAINT "group_pk" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "ar_video" (
    "idx" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "file_data" VARCHAR,

    CONSTRAINT "ar_video_pk" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "quiz_hongdo" (
    "idx" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "topic" VARCHAR NOT NULL,
    "quizzes" JSON,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "quiz_hongdo_pk" PRIMARY KEY ("idx")
);

-- CreateTable
CREATE TABLE "quiz_walk" (
    "idx" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "topic" VARCHAR NOT NULL,
    "quizzes" JSON,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "quiz_walk_pk" PRIMARY KEY ("idx")
);
