import { LearningCoursePlayer } from "@/components/learning-hub/learning-course-player";

export default async function LearningCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ chapter?: string }>;
}) {
  const { courseId } = await params;
  const sp = await searchParams;
  return (
    <LearningCoursePlayer
      courseId={courseId}
      initialChapterId={sp.chapter ?? null}
    />
  );
}
