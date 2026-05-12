"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Bookmark, BookOpen, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CourseListItem, HubCourseCategory } from "@/lib/learning-hub-api";
import {
  coursePlayerHref,
  postCourseFavorite,
  postCourseWatchLater,
} from "@/lib/learning-hub-api";
import { toast } from "sonner";

const categoryLabel: Record<HubCourseCategory, string> = {
  CRYPTO: "Crypto",
  TRADING: "Trading",
  FINANCE: "Finance",
};

export function LearningCourseCard({
  course,
  signedIn,
  onMutate,
}: {
  course: CourseListItem;
  signedIn: boolean;
  onMutate: () => void;
}) {
  const href = coursePlayerHref(course.id, course.resumeChapterId);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!signedIn) {
      toast.message("Sign in to save favorites.");
      return;
    }
    try {
      await postCourseFavorite(course.id, !course.isFavorite);
      onMutate();
      toast.success(course.isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Could not update favorite.");
    }
  };

  const toggleWatchLater = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!signedIn) {
      toast.message("Sign in to use watch later.");
      return;
    }
    try {
      await postCourseWatchLater(course.id, !course.isWatchLater);
      onMutate();
      toast.success(course.isWatchLater ? "Removed from watch later" : "Saved to watch later");
    } catch {
      toast.error("Could not update watch later.");
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative aspect-video w-full bg-muted">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <BookOpen className="h-10 w-10" />
            </div>
          )}
          <div className="pointer-events-none absolute left-2 top-2 flex gap-1">
            <Badge variant="secondary">{categoryLabel[course.category]}</Badge>
          </div>
          {course.progressPercent > 0 && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-background/90 px-3 py-2">
              <div className="mb-1 flex justify-between text-xs">
                <span>Progress</span>
                <span>{course.progressPercent}%</span>
              </div>
              <Progress value={course.progressPercent} className="h-1" />
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>
      </Link>
      <CardContent className="flex items-center justify-between gap-2 pt-0">
        <span className="text-xs text-muted-foreground">
          {course.chapterCount} chapter{course.chapterCount === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label={course.isFavorite ? "Remove favorite" : "Add favorite"}
            onClick={toggleFavorite}
          >
            <Heart className={`h-4 w-4 ${course.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label={course.isWatchLater ? "Remove watch later" : "Watch later"}
            onClick={toggleWatchLater}
          >
            <Bookmark className={`h-4 w-4 ${course.isWatchLater ? "fill-primary text-primary" : ""}`} />
          </Button>
          <Button size="sm" className="gap-1" asChild>
            <Link href={href}>
              {course.progressPercent > 0 ? (
                <>
                  <Play className="h-4 w-4" />
                  Continue
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Start
                </>
              )}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
