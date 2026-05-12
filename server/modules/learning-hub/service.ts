import type { CourseInteractionType, HubCourseCategory } from "@prisma/client";
import { prisma } from "@/server/lib/db";
import { gradeQuiz, parseStoredQuiz, toPublicQuiz } from "./quiz";
import { extractYoutubeVideoId } from "./youtube";

function progressPercent(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export const learningHubService = {
  async listCourses(userId: string | null, category?: HubCourseCategory) {
    const courses = await prisma.course.findMany({
      where: {
        published: true,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        chapters: { select: { id: true }, orderBy: { order: "asc" } },
        ...(userId
          ? {
              interactions: { where: { userId } },
            }
          : {}),
      },
    });

    const allChapterIds = courses.flatMap((c) => c.chapters.map((ch) => ch.id));
    const completedRows =
      userId && allChapterIds.length > 0
        ? await prisma.userProgress.findMany({
            where: {
              userId,
              completedAt: { not: null },
              chapterId: { in: allChapterIds },
            },
            select: { chapterId: true },
          })
        : [];

    const completedByChapter = new Set(completedRows.map((r) => r.chapterId));

    return courses.map((c) => {
      const total = c.chapters.length;
      const completed = c.chapters.filter((ch) =>
        completedByChapter.has(ch.id)
      ).length;
      const interactions =
        "interactions" in c && Array.isArray(c.interactions)
          ? c.interactions
          : [];
      const resumeChapterId =
        c.chapters.find((ch) => !completedByChapter.has(ch.id))?.id ?? null;
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        thumbnail: c.thumbnail,
        chapterCount: total,
        progressPercent: progressPercent(completed, total),
        isFavorite: interactions.some((i) => i.type === "FAVORITE"),
        isWatchLater: interactions.some((i) => i.type === "WATCH_LATER"),
        resumeChapterId,
      };
    });
  },

  async getCourseDetail(courseId: string, userId: string | null) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, published: true },
      include: {
        chapters: { orderBy: { order: "asc" } },
        ...(userId
          ? {
              interactions: { where: { userId } },
            }
          : {}),
      },
    });
    if (!course) return null;

    const completedIds = userId
      ? new Set(
          (
            await prisma.userProgress.findMany({
              where: {
                userId,
                chapterId: { in: course.chapters.map((ch) => ch.id) },
                completedAt: { not: null },
              },
              select: { chapterId: true },
            })
          ).map((r) => r.chapterId)
        )
      : new Set<string>();

    const interactions = "interactions" in course && Array.isArray(course.interactions)
      ? course.interactions
      : [];

    const total = course.chapters.length;
    const completed = course.chapters.filter((ch) =>
      completedIds.has(ch.id)
    ).length;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      thumbnail: course.thumbnail,
      progressPercent: progressPercent(completed, total),
      isFavorite: interactions.some((i) => i.type === "FAVORITE"),
      isWatchLater: interactions.some((i) => i.type === "WATCH_LATER"),
      chapters: course.chapters.map((ch) => {
        const quiz = parseStoredQuiz(ch.quizJson);
        const videoId = extractYoutubeVideoId(ch.youtubeUrl);
        return {
          id: ch.id,
          title: ch.title,
          youtubeUrl: ch.youtubeUrl,
          youtubeVideoId: videoId,
          order: ch.order,
          quiz: toPublicQuiz(quiz),
          isCompleted: completedIds.has(ch.id),
        };
      }),
    };
  },

  async setInteraction(
    userId: string,
    courseId: string,
    type: CourseInteractionType,
    active: boolean
  ) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, published: true },
      select: { id: true },
    });
    if (!course) return { ok: false as const, error: "Course not found" };

    if (active) {
      await prisma.userCourseInteraction.upsert({
        where: {
          userId_courseId_type: { userId, courseId, type },
        },
        create: { userId, courseId, type },
        update: {},
      });
    } else {
      await prisma.userCourseInteraction.deleteMany({
        where: { userId, courseId, type },
      });
    }
    return { ok: true as const, active };
  },

  async completeChapter(
    userId: string,
    chapterId: string,
    answers: Record<string, number>
  ) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: { select: { published: true } } },
    });
    if (!chapter || !chapter.course.published) {
      return { ok: false as const, error: "Chapter not found" };
    }

    const quiz = parseStoredQuiz(chapter.quizJson);
    const graded = gradeQuiz(quiz, answers);
    if (!graded.ok) {
      return { ok: false as const, error: graded.reason };
    }

    await prisma.userProgress.upsert({
      where: {
        userId_chapterId: { userId, chapterId },
      },
      create: {
        userId,
        chapterId,
        completedAt: new Date(),
      },
      update: {
        completedAt: new Date(),
      },
    });

    const total = await prisma.chapter.count({
      where: { courseId: chapter.courseId },
    });
    const completed = await prisma.userProgress.count({
      where: {
        userId,
        completedAt: { not: null },
        chapter: { courseId: chapter.courseId },
      },
    });

    return {
      ok: true as const,
      courseId: chapter.courseId,
      progressPercent: progressPercent(completed, total),
    };
  },
};
