"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Lock,
  Unlock,
  RotateCcw,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ADVANCED_LESSONS,
  ADVANCED_UNLOCK_SLUGS,
  advancedPrerequisitesMet,
  isAdvancedLessonLocked,
  loadAdvancedProgress,
  resetAdvancedFoundationProgress,
  resetAdvancedTrackForDemo,
  type AdvancedLessonDefinition,
} from "@/lib/learning-advanced";
import {
  AdvancedPlayDialog,
  AdvancedReviewDialog,
} from "@/components/learning-advanced/advanced-lesson-dialogs";

const icons = {
  BarChart3,
  Target,
  Zap,
  TrendingUp,
} as const;

function lessonIcon(def: AdvancedLessonDefinition) {
  return icons[def.iconKey];
}

export default function AdvancedStrategiesPage() {
  const [tick, setTick] = useState(0);
  const [playLesson, setPlayLesson] = useState<AdvancedLessonDefinition | null>(null);
  const [reviewLesson, setReviewLesson] = useState<AdvancedLessonDefinition | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [resetConfirm, setResetConfirm] = useState<null | "foundation" | "full">(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const progressMap = useMemo(() => {
    void tick;
    return hydrated ? loadAdvancedProgress() : {};
  }, [hydrated, tick]);

  const prereqsMet = useMemo(
    () => advancedPrerequisitesMet(progressMap),
    [progressMap]
  );

  const prereqCompleteCount = useMemo(() => {
    return ADVANCED_UNLOCK_SLUGS.filter(
      (slug) => (progressMap[slug]?.watchPercent ?? 0) >= 100
    ).length;
  }, [progressMap]);

  const merged = useMemo(() => {
    return ADVANCED_LESSONS.map((def) => {
      const r = progressMap[def.slug];
      const pct = r?.watchPercent ?? 0;
      const completed = pct >= 100;
      const locked = isAdvancedLessonLocked(def, progressMap);
      return { def, progress: pct, completed, locked };
    });
  }, [progressMap]);

  const overview = useMemo(() => {
    const total = merged.length;
    const done = merged.filter((m) => m.completed).length;
    const avg =
      total > 0
        ? Math.round(merged.reduce((s, m) => s + m.progress, 0) / total)
        : 0;
    return { total, done, avg };
  }, [merged]);

  return (
    <>
      <AlertDialog
        open={resetConfirm === "foundation"}
        onOpenChange={(open) => {
          if (!open) setResetConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset first two lessons?</AlertDialogTitle>
            <AlertDialogDescription>
              Clears progress for <strong>Technical Analysis</strong> and{" "}
              <strong>Options Strategies</strong> only. The last two courses will show as{" "}
              <strong>locked</strong> again. Any progress you had on those two will still be saved
              until you use a full reset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetAdvancedFoundationProgress();
                refresh();
              }}
            >
              Reset progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={resetConfirm === "full"}
        onOpenChange={(open) => {
          if (!open) setResetConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset full advanced track?</AlertDialogTitle>
            <AlertDialogDescription>
              Clears <strong>all four</strong> advanced lessons on this device (foundation +
              expert). Use this to show your teacher the flow from locked → unlocked from scratch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetAdvancedTrackForDemo();
                refresh();
              }}
            >
              Reset progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdvancedPlayDialog
        lesson={playLesson}
        open={Boolean(playLesson)}
        onOpenChange={(o) => {
          if (!o) setPlayLesson(null);
        }}
        onSaved={refresh}
      />
      <AdvancedReviewDialog
        lesson={reviewLesson}
        open={Boolean(reviewLesson)}
        onOpenChange={(o) => {
          if (!o) setReviewLesson(null);
        }}
      />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border" />
          <h1 className="text-lg font-semibold">Advanced Strategies</h1>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4">
          <div className="rounded-xl bg-gradient-to-r from-accent/10 via-accent/5 to-primary/10 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-balance text-3xl font-bold">Advanced Strategies</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  YouTube lessons with saved progress. Expert tracks unlock after the first two
                  lessons hit 100%.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-sm text-muted-foreground">Foundation (unlock gate)</div>
                <div className="text-lg font-semibold text-primary">
                  {hydrated
                    ? `${prereqCompleteCount}/${ADVANCED_UNLOCK_SLUGS.length} complete`
                    : "—"}
                </div>
                <div className="text-sm text-green-600">
                  {hydrated && prereqsMet ? "Expert lessons unlocked" : hydrated ? "Keep going" : ""}
                </div>
              </div>
            </div>
          </div>

          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Star className="h-5 w-5" />
                Advanced content
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Complete <strong>Technical Analysis</strong> and <strong>Options Strategies</strong>{" "}
                (watch each video to the end) to unlock Algorithmic Trading and Alternative
                Investments.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">4 courses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {hydrated ? `${overview.done} completed · avg ${overview.avg}%` : "Loading…"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Self-paced</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Progress bar tracks watch position like Market Basics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Gated expert track</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {prereqsMet ? "All lessons available" : "Finish the first two to unlock the rest"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Advanced courses</h3>
            <div className="grid gap-4">
              {merged.map(({ def, progress, completed, locked }) => {
                const Icon = lessonIcon(def);
                return (
                  <Card
                    key={def.slug}
                    className={`transition-shadow hover:shadow-md ${locked ? "opacity-70" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-4 sm:items-center">
                          <div
                            className={`rounded-lg p-3 ${locked ? "bg-muted" : "bg-primary/10"}`}
                          >
                            {locked ? (
                              <Lock className="h-6 w-6 text-muted-foreground" />
                            ) : (
                              <Icon className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold">{def.title}</h4>
                              {completed && (
                                <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                              )}
                              {locked && (
                                <Badge variant="outline" className="text-xs">
                                  Locked — finish first two lessons
                                </Badge>
                              )}
                              {!locked && def.gated && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                  <Unlock className="h-3 w-3" />
                                  Unlocked
                                </Badge>
                              )}
                            </div>
                            <p className="mb-3 text-sm text-muted-foreground">{def.description}</p>
                            <div className="mb-3 flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {def.durationLabel}
                              </div>
                              <Badge
                                variant={def.difficulty === "Expert" ? "destructive" : "secondary"}
                              >
                                {def.difficulty}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={locked ? 0 : progress} className="flex-1" />
                              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                                {locked ? "—" : `${progress}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 justify-end sm:flex-col">
                          {locked ? (
                            <Button type="button" variant="secondary" disabled className="gap-2">
                              <Lock className="h-4 w-4" />
                              Locked
                            </Button>
                          ) : completed ? (
                            <Button
                              type="button"
                              className="gap-2"
                              onClick={() => setReviewLesson(def)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Review
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              className="gap-2"
                              onClick={() => setPlayLesson(def)}
                            >
                              <Play className="h-4 w-4" />
                              {progress > 0 ? "Continue" : "Start"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                Demo / reset (this browser only)
              </CardTitle>
              <CardDescription>
                Use before a presentation so the gate and unlock behavior are easy to show.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetConfirm("foundation")}
              >
                Reset first 2 lessons (re-lock expert)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetConfirm("full")}
              >
                Full reset (all 4 lessons)
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {prereqsMet ? "Expert track open" : "Unlock expert content"}
              </CardTitle>
              <CardDescription>
                {prereqsMet
                  ? "You can start any advanced lesson below."
                  : "Complete Technical Analysis and Options Strategies (100% each) to unlock the last two courses."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/dashboard/learning/basics">
                    Market basics
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/learning/certifications">Certifications</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  );
}
