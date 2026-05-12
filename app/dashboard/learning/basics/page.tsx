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
  DollarSign,
  PieChart,
  Shield,
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
  BASICS_LESSONS,
  loadBasicsProgress,
  resetBasicsTrackForDemo,
  type BasicsLessonDefinition,
} from "@/lib/learning-basics";
import {
  BasicsPlayDialog,
  BasicsReviewDialog,
} from "@/components/learning-basics/basics-lesson-dialogs";

const icons = {
  TrendingUp,
  Shield,
  PieChart,
  DollarSign,
} as const;

function lessonIcon(def: BasicsLessonDefinition) {
  const I = icons[def.iconKey];
  return I;
}

export default function MarketBasicsPage() {
  const [tick, setTick] = useState(0);
  const [playLesson, setPlayLesson] = useState<BasicsLessonDefinition | null>(null);
  const [reviewLesson, setReviewLesson] = useState<BasicsLessonDefinition | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const merged = useMemo(() => {
    void tick;
    const map = hydrated ? loadBasicsProgress() : {};
    return BASICS_LESSONS.map((def) => {
      const r = map[def.slug];
      const pct = r?.watchPercent ?? 0;
      const completed = pct >= 100;
      return { def, progress: pct, completed };
    });
  }, [hydrated, tick]);

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
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Market Basics progress?</AlertDialogTitle>
            <AlertDialogDescription>
              Clears saved watch progress for <strong>all</strong> basics lessons on this browser.
              Use this before a demo so lessons start from 0% again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetBasicsTrackForDemo();
                refresh();
              }}
            >
              Reset progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BasicsPlayDialog
        lesson={playLesson}
        open={Boolean(playLesson)}
        onOpenChange={(o) => {
          if (!o) setPlayLesson(null);
        }}
        onSaved={refresh}
      />
      <BasicsReviewDialog
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
          <h1 className="text-lg font-semibold">Market Basics</h1>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4">
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-balance text-3xl font-bold">Market Basics</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  Short YouTube lessons with saved watch progress on this device
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-sm text-muted-foreground">Track progress</div>
                <div className="text-2xl font-bold text-primary tabular-nums">
                  {hydrated ? overview.avg : 0}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {hydrated ? `${overview.done} of ${overview.total} lessons completed` : "Loading…"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">4 lessons</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Core ideas before you move to advanced strategies
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
                  Pause anytime; the bar tracks how much of the video you have watched
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Beginner friendly</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Curated videos — swap IDs in code if you want different sources
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                Demo / reset (this browser only)
              </CardTitle>
              <CardDescription>
                Clears all basics lesson progress so you can walk through from 0% again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="outline" size="sm" onClick={() => setResetOpen(true)}>
                Reset all basics lessons
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Course lessons</h3>
            <div className="grid gap-4">
              {merged.map(({ def, progress, completed }) => {
                const Icon = lessonIcon(def);
                return (
                  <Card key={def.slug} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-4 sm:items-center">
                          <div className="rounded-lg bg-primary/10 p-3">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold">{def.title}</h4>
                              {completed && (
                                <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                              )}
                            </div>
                            <p className="mb-3 text-sm text-muted-foreground">{def.description}</p>
                            <div className="mb-3 flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {def.durationLabel}
                              </div>
                              <Badge variant="secondary">{def.difficulty}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="flex-1" />
                              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                                {progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 justify-end sm:flex-col">
                          {completed ? (
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

          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Ready for more?
              </CardTitle>
              <CardDescription>Continue with advanced strategies in the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gap-2">
                <Link href="/dashboard/learning/advanced">
                  Explore advanced strategies
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  );
}
