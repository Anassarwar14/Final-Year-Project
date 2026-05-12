"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, ListVideo } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { fetchLearningCourse } from "@/lib/learning-hub-api";
import type { CourseChapterDetail, CourseDetail } from "@/lib/learning-hub-api";
import { YoutubeChapterPlayer } from "./youtube-chapter-player";
import { ChapterQuizModal } from "./chapter-quiz-modal";

async function courseFetcher(id: string) {
  const { course } = await fetchLearningCourse(id);
  return course;
}

export function LearningCoursePlayer({
  courseId,
  initialChapterId,
}: {
  courseId: string;
  initialChapterId?: string | null;
}) {
  const { data, error, isLoading, mutate } = useSWR<CourseDetail>(
    courseId ? ["learning-course", courseId] : null,
    () => courseFetcher(courseId),
    { revalidateOnFocus: true }
  );

  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizChapter, setQuizChapter] = useState<CourseChapterDetail | null>(null);
  const seededChapterRef = useRef(false);

  const chapters = useMemo(() => data?.chapters ?? [], [data?.chapters]);
  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId) ?? chapters[0] ?? null,
    [chapters, activeChapterId]
  );

  useEffect(() => {
    seededChapterRef.current = false;
  }, [courseId]);

  useEffect(() => {
    if (!chapters.length) return;
    if (!seededChapterRef.current) {
      if (
        initialChapterId &&
        chapters.some((c) => c.id === initialChapterId)
      ) {
        setActiveChapterId(initialChapterId);
      } else {
        setActiveChapterId(chapters[0].id);
      }
      seededChapterRef.current = true;
      return;
    }
    if (!activeChapterId || !chapters.some((c) => c.id === activeChapterId)) {
      setActiveChapterId(chapters[0].id);
    }
  }, [chapters, activeChapterId, initialChapterId]);

  const openQuizForChapter = useCallback((ch: CourseChapterDetail | null) => {
    if (!ch || ch.isCompleted) return;
    setQuizChapter(ch);
    setQuizOpen(true);
  }, []);

  const handleVideoEnded = useCallback(() => {
    if (!activeChapter || activeChapter.isCompleted) return;
    openQuizForChapter(activeChapter);
  }, [activeChapter, openQuizForChapter]);

  const handleQuizPassed = useCallback(() => {
    void mutate();
  }, [mutate]);

  if (isLoading) {
    return (
      <SidebarInset>
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          Loading course…
        </div>
      </SidebarInset>
    );
  }

  if (error || !data) {
    return (
      <SidebarInset>
        <div className="flex flex-1 items-center justify-center p-8 text-destructive">
          Could not load this course.
        </div>
      </SidebarInset>
    );
  }

  return (
    <>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/dashboard/learning/courses" aria-label="Back to courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{data.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Progress value={data.progressPercent} className="h-1.5 flex-1 max-w-xs" />
              <span className="text-xs text-muted-foreground tabular-nums">
                {data.progressPercent}%
              </span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-0 lg:p-0">
          <aside className="w-full shrink-0 border-b lg:w-80 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-medium">
              <ListVideo className="h-4 w-4" />
              Chapters
            </div>
            <ScrollArea className="h-[220px] lg:h-[calc(100vh-3.5rem)]">
              <ul className="p-2">
                {chapters.map((ch) => (
                  <li key={ch.id}>
                    <button
                      type="button"
                      onClick={() => setActiveChapterId(ch.id)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                        ch.id === activeChapter?.id ? "bg-accent" : "hover:bg-muted/80"
                      )}
                    >
                      {ch.isCompleted ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="line-clamp-2">{ch.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </aside>

          <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
            {activeChapter ? (
              <>
                <div>
                  <h2 className="text-xl font-semibold">{activeChapter.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    When the video ends, a short quiz opens. You must pass it to mark this chapter
                    complete.
                  </p>
                </div>
                <YoutubeChapterPlayer
                  key={activeChapter.id}
                  videoId={activeChapter.youtubeVideoId}
                  onEnded={handleVideoEnded}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!activeChapter || activeChapter.isCompleted}
                    onClick={() => openQuizForChapter(activeChapter)}
                  >
                    Take chapter quiz
                  </Button>
                </div>
              </>
            ) : null}
          </main>
        </div>
      </SidebarInset>

      <ChapterQuizModal
        open={quizOpen}
        onOpenChange={setQuizOpen}
        chapter={quizChapter}
        onPassed={handleQuizPassed}
      />
    </>
  );
}
