"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { YoutubeChapterPlayer } from "@/components/learning-hub/youtube-chapter-player";
import type { BasicsLessonDefinition, BasicsLessonRecord } from "@/lib/learning-basics";
import {
  addEngagedSeconds,
  basicsLessonVideoId,
  formatDateTime,
  formatDurationSeconds,
  loadBasicsProgress,
  upsertBasicsLesson,
} from "@/lib/learning-basics";

type PlayProps = {
  lesson: BasicsLessonDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function BasicsPlayDialog({ lesson, open, onOpenChange, onSaved }: PlayProps) {
  const [livePct, setLivePct] = useState(0);
  const sessionStartRef = useRef(0);

  const seekSeconds = useMemo(() => {
    if (!open || !lesson) return 0;
    const p = loadBasicsProgress()[lesson.slug]?.watchPercent ?? 0;
    if (p <= 0 || p >= 100) return 0;
    return Math.floor((p / 100) * lesson.estimatedDurationSeconds);
  }, [open, lesson]);

  useEffect(() => {
    if (!open || !lesson) return;
    sessionStartRef.current = Date.now();
    const rec = loadBasicsProgress()[lesson.slug];
    setLivePct(rec?.watchPercent ?? 0);
  }, [open, lesson]);

  useEffect(() => {
    if (!open || !lesson) return;
    return () => {
      const sec = Math.round((Date.now() - sessionStartRef.current) / 1000);
      if (sec > 0) addEngagedSeconds(lesson.slug, sec);
      onSaved();
    };
  }, [open, lesson, onSaved]);

  const onProgress = useCallback(
    (pct: number) => {
      if (!lesson) return;
      setLivePct((p) => Math.max(p, pct));
      upsertBasicsLesson(lesson.slug, { watchPercent: pct });
    },
    [lesson]
  );

  const onEnded = useCallback(() => {
    if (!lesson) return;
    upsertBasicsLesson(lesson.slug, { watchPercent: 100 });
    setLivePct(100);
    onSaved();
  }, [lesson, onSaved]);

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lesson.title}</DialogTitle>
          <DialogDescription>{lesson.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <YoutubeChapterPlayer
            key={`${lesson.slug}-${open}-${seekSeconds}`}
            videoId={basicsLessonVideoId(lesson)}
            startSeconds={seekSeconds}
            onProgress={onProgress}
            onEnded={onEnded}
          />
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Watch progress</span>
              <span className="tabular-nums">{livePct}%</span>
            </div>
            <Progress value={livePct} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Reaches 100% when the video finishes. You can close anytime — progress is saved.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ReviewProps = {
  lesson: BasicsLessonDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BasicsReviewDialog({ lesson, open, onOpenChange }: ReviewProps) {
  const [record, setRecord] = useState<BasicsLessonRecord | null>(null);

  useEffect(() => {
    if (!open || !lesson) return;
    setRecord(loadBasicsProgress()[lesson.slug] ?? null);
  }, [open, lesson]);

  if (!lesson) return null;

  const pct = record?.watchPercent ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lesson report: {lesson.title}</DialogTitle>
          <DialogDescription>Mini progress summary from this device</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium tabular-nums">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
            <div>
              <p className="text-muted-foreground">Time in lessons (tracked)</p>
              <p className="font-medium">
                {formatDurationSeconds(record?.secondsEngaged ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">First opened</p>
              <p className="font-medium">{formatDateTime(record?.startedAt ?? null)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Completed at</p>
              <p className="font-medium">{formatDateTime(record?.completedAt ?? null)}</p>
            </div>
          </div>
          <div>
            <p className="mb-2 font-medium">What you covered</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              {lesson.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
