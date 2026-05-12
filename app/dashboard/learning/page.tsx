"use client";

import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  coursePlayerHref,
  fetchLearningCourses,
  type CourseListItem,
} from "@/lib/learning-hub-api";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  Play,
  CheckCircle,
  TrendingUp,
  Shield,
  Target,
  Zap,
  Loader2,
  Bookmark,
} from "lucide-react";

const categoryLabel: Record<CourseListItem["category"], string> = {
  CRYPTO: "Crypto",
  TRADING: "Trading",
  FINANCE: "Finance",
};

async function allCoursesFetcher() {
  const { courses } = await fetchLearningCourses("all");
  return courses;
}

function pickFeatured(courses: CourseListItem[], limit: number) {
  const copy = [...courses];
  copy.sort((a, b) => {
    const aMid = a.progressPercent > 0 && a.progressPercent < 100 ? 1 : 0;
    const bMid = b.progressPercent > 0 && b.progressPercent < 100 ? 1 : 0;
    if (bMid !== aMid) return bMid - aMid;
    const aWl = a.isWatchLater ? 1 : 0;
    const bWl = b.isWatchLater ? 1 : 0;
    if (bWl !== aWl) return bWl - aWl;
    return b.progressPercent - a.progressPercent;
  });
  return copy.slice(0, limit);
}

function primaryContinueHref(courses: CourseListItem[]) {
  const featured = pickFeatured(courses, 1)[0];
  if (!featured) return "/dashboard/learning/courses";
  return coursePlayerHref(featured.id, featured.resumeChapterId);
}

export default function LearningPage() {
  const { user } = useCurrentUser();
  const username = user?.name || "User";

  const { data: courses, error, isLoading } = useSWR(
    "learning-hub-dashboard-courses",
    allCoursesFetcher,
    { revalidateOnFocus: true }
  );

  const list = useMemo(() => courses ?? [], [courses]);

  const stats = useMemo(() => {
    const total = list.length;
    const completed = list.filter((c) => c.progressPercent >= 100).length;
    const inProgress = list.filter(
      (c) => c.progressPercent > 0 && c.progressPercent < 100
    ).length;
    const watchLater = list.filter((c) => c.isWatchLater).length;
    const avg =
      total > 0
        ? Math.round(
            list.reduce((s, c) => s + c.progressPercent, 0) / total
          )
        : 0;
    return { total, completed, inProgress, watchLater, avg };
  }, [list]);

  const featured = useMemo(() => pickFeatured(list, 4), [list]);

  const achievements = useMemo(() => {
    const anyStart = list.some((c) => c.progressPercent > 0);
    const anyHalf = list.some((c) => c.progressPercent >= 50);
    const anyDone = list.some((c) => c.progressPercent >= 100);
    return [
      { title: "Started a course", icon: BookOpen, earned: anyStart },
      { title: "50% on a course", icon: TrendingUp, earned: anyHalf },
      { title: "Completed a course", icon: Award, earned: anyDone },
      { title: "Saved for later", icon: Bookmark, earned: list.some((c) => c.isWatchLater) },
    ];
  }, [list]);

  const continueHref = useMemo(() => primaryContinueHref(list), [list]);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-sidebar-border" />
        <GraduationCap className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Learning Hub</h1>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="bg-transparent" asChild>
            <Link href="/dashboard/learning/courses">Browse catalog</Link>
          </Button>
          {list.length > 0 ? (
            <Button size="sm" className="gap-2" asChild>
              <Link href={continueHref}>
                <Play className="h-4 w-4" />
                Continue learning
              </Link>
            </Button>
          ) : (
            <Button size="sm" className="gap-2" disabled>
              <Play className="h-4 w-4" />
              Continue learning
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your courses…
          </div>
        )}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="py-3">
              <CardTitle className="text-base text-destructive">
                Could not load courses
              </CardTitle>
              <CardDescription>
                The API returned an error — usually the Learning Hub tables are missing in
                Postgres or the server failed. Apply the Learning Hub SQL migration in Supabase,
                run the seed, then refresh. You can still open the{" "}
                <Link href="/dashboard/learning/courses" className="underline">
                  course catalog
                </Link>{" "}
                to retry.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-balance">Welcome back, {username}!</h2>
              <p className="mt-1 text-muted-foreground">
                Pick up video courses on crypto, trading, and finance. Progress syncs when you are
                signed in.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-sm text-muted-foreground">Average course progress</div>
              <div className="text-3xl font-bold text-primary tabular-nums">{stats.avg}%</div>
              <div className="text-sm text-muted-foreground">
                {stats.completed}/{stats.total || 1} completed
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses available</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Published in the hub</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">100% progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Started, not finished</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Watch later</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{stats.watchLater}</div>
              <p className="text-xs text-muted-foreground">Saved courses</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Continue learning</CardTitle>
                  <CardDescription>Live from your account — open a course to play on YouTube</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/learning/courses">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {!isLoading && !error && featured.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No courses yet. Open the catalog or run the seed script after applying the DB
                    migration.
                  </p>
                )}
                <div className="space-y-3">
                  {featured.map((course) => (
                    <Link
                      key={course.id}
                      href={coursePlayerHref(course.id, course.resumeChapterId)}
                      className="flex gap-4 rounded-lg border p-3 transition-colors hover:bg-accent/60"
                    >
                      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="112px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold leading-snug">{course.title}</h4>
                          <Badge variant="secondary" className="shrink-0">
                            {categoryLabel[course.category]}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {course.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {course.chapterCount} chapters
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {course.progressPercent > 0 ? "Continue" : "Start"}
                          </span>
                        </div>
                        {course.progressPercent > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{course.progressPercent}%</span>
                            </div>
                            <Progress value={course.progressPercent} className="h-1" />
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Browse by topic</CardTitle>
                <CardDescription>Jump to the video course catalog</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/dashboard/learning/courses?category=CRYPTO">
                    <Target className="h-4 w-4" /> Crypto
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/dashboard/learning/courses?category=TRADING">
                    <Zap className="h-4 w-4" /> Trading
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/dashboard/learning/courses?category=FINANCE">
                    <Shield className="h-4 w-4" /> Finance
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>Based on your hub activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.title}
                      className={`flex items-center gap-3 rounded-lg p-2 ${
                        achievement.earned ? "bg-primary/10" : "bg-muted/50"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          achievement.earned
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {achievement.earned ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <achievement.icon className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          achievement.earned ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {achievement.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Link href="/dashboard/learning/courses">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-6 text-center">
                <BookOpen className="mx-auto mb-2 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">All courses</h3>
                <p className="text-sm text-muted-foreground">Grid view & filters</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/learning/courses?category=CRYPTO">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-6 text-center">
                <Target className="mx-auto mb-2 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">Crypto</h3>
                <p className="text-sm text-muted-foreground">Digital assets</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/learning/courses?category=TRADING">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-6 text-center">
                <Zap className="mx-auto mb-2 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">Trading</h3>
                <p className="text-sm text-muted-foreground">Markets & risk</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/learning/certifications">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-6 text-center">
                <Award className="mx-auto mb-2 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">Certifications</h3>
                <p className="text-sm text-muted-foreground">Other learning tracks</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </SidebarInset>
  );
}
