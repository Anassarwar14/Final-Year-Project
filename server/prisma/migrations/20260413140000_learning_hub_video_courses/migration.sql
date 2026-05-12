-- CreateEnum
CREATE TYPE "HubCourseCategory" AS ENUM ('CRYPTO', 'TRADING', 'FINANCE');

-- CreateEnum
CREATE TYPE "CourseInteractionType" AS ENUM ('FAVORITE', 'WATCH_LATER');

-- CreateTable
CREATE TABLE "learning_hub_course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "HubCourseCategory" NOT NULL,
    "thumbnail" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_hub_course_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "learning_hub_course_category_idx" ON "learning_hub_course"("category");

-- CreateTable
CREATE TABLE "learning_hub_chapter" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "quizJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_hub_chapter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "learning_hub_chapter_courseId_order_key" ON "learning_hub_chapter"("courseId", "order");

ALTER TABLE "learning_hub_chapter" ADD CONSTRAINT "learning_hub_chapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "learning_hub_course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "learning_hub_user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "learning_hub_user_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "learning_hub_user_progress_userId_chapterId_key" ON "learning_hub_user_progress"("userId", "chapterId");
CREATE INDEX "learning_hub_user_progress_userId_idx" ON "learning_hub_user_progress"("userId");

ALTER TABLE "learning_hub_user_progress" ADD CONSTRAINT "learning_hub_user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_hub_user_progress" ADD CONSTRAINT "learning_hub_user_progress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "learning_hub_chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "learning_hub_user_course_interaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "type" "CourseInteractionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_hub_user_course_interaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "learning_hub_user_course_interaction_userId_courseId_type_key" ON "learning_hub_user_course_interaction"("userId", "courseId", "type");
CREATE INDEX "learning_hub_user_course_interaction_userId_idx" ON "learning_hub_user_course_interaction"("userId");

ALTER TABLE "learning_hub_user_course_interaction" ADD CONSTRAINT "learning_hub_user_course_interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_hub_user_course_interaction" ADD CONSTRAINT "learning_hub_user_course_interaction_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "learning_hub_course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
