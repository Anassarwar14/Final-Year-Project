"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { YoutubeChapterPlayer } from "@/components/learning-hub/youtube-chapter-player";
import {
  CERTIFICATION_PASS_PERCENT,
  addCertificationStudyEngagedSeconds,
  certStudySegmentKey,
  certificationStudyVideoId,
  getExamQuestionsForCert,
  loadCertificationStudyProgress,
  recordCertificationExamAttempt,
  type CertificationStudyTrack,
  upsertCertificationStudySegment,
} from "@/lib/learning-certifications";
import { cn } from "@/lib/utils";

type StudyProps = {
  track: CertificationStudyTrack | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function CertificationStudyDialog({ track, open, onOpenChange, onSaved }: StudyProps) {
  const [selectedVideoSlug, setSelectedVideoSlug] = useState<string | null>(null);
  const [livePct, setLivePct] = useState(0);
  const sessionStartRef = useRef(0);

  useEffect(() => {
    if (!open || !track?.videos.length) {
      if (!open) setSelectedVideoSlug(null);
      return;
    }
    const map = loadCertificationStudyProgress();
    const firstIncomplete = track.videos.find((v) => {
      const k = certStudySegmentKey(track.certSlug, v.videoSlug);
      return (map[k]?.watchPercent ?? 0) < 100;
    });
    const pick = firstIncomplete ?? track.videos[0];
    setSelectedVideoSlug(pick.videoSlug);
  }, [open, track]);

  const effectiveVideoSlug = selectedVideoSlug ?? track?.videos[0]?.videoSlug ?? null;

  const selectedVideo = useMemo(() => {
    if (!track || !effectiveVideoSlug) return null;
    return track.videos.find((v) => v.videoSlug === effectiveVideoSlug) ?? null;
  }, [track, effectiveVideoSlug]);

  const seekSeconds = useMemo(() => {
    if (!open || !track || !selectedVideo) return 0;
    const k = certStudySegmentKey(track.certSlug, selectedVideo.videoSlug);
    const p = loadCertificationStudyProgress()[k]?.watchPercent ?? 0;
    if (p <= 0 || p >= 100) return 0;
    return Math.floor((p / 100) * selectedVideo.estimatedDurationSeconds);
  }, [open, track, selectedVideo]);

  useEffect(() => {
    if (!open || !track || !selectedVideo) return;
    sessionStartRef.current = Date.now();
    const k = certStudySegmentKey(track.certSlug, selectedVideo.videoSlug);
    const rec = loadCertificationStudyProgress()[k];
    setLivePct(rec?.watchPercent ?? 0);
  }, [open, track, selectedVideo]);

  useEffect(() => {
    if (!open || !track || !selectedVideo) return;
    const certSlug = track.certSlug;
    const videoSlug = selectedVideo.videoSlug;
    return () => {
      const sec = Math.round((Date.now() - sessionStartRef.current) / 1000);
      if (sec > 0) addCertificationStudyEngagedSeconds(certSlug, videoSlug, sec);
      onSaved();
    };
  }, [open, track, selectedVideo, onSaved]);

  const onProgress = useCallback(
    (pct: number) => {
      if (!track || !selectedVideo) return;
      setLivePct((p) => Math.max(p, pct));
      upsertCertificationStudySegment(track.certSlug, selectedVideo.videoSlug, { watchPercent: pct });
    },
    [track, selectedVideo]
  );

  const onEnded = useCallback(() => {
    if (!track || !selectedVideo) return;
    upsertCertificationStudySegment(track.certSlug, selectedVideo.videoSlug, { watchPercent: 100 });
    setLivePct(100);
    onSaved();
  }, [track, selectedVideo, onSaved]);

  const mergedPercents = useMemo(() => {
    if (!track) return {} as Record<string, number>;
    const map = loadCertificationStudyProgress();
    const out: Record<string, number> = {};
    for (const v of track.videos) {
      const k = certStudySegmentKey(track.certSlug, v.videoSlug);
      let p = map[k]?.watchPercent ?? 0;
      if (v.videoSlug === effectiveVideoSlug) p = Math.max(p, livePct);
      out[v.videoSlug] = p;
    }
    return out;
  }, [track, effectiveVideoSlug, livePct, open]);

  const trackAvg =
    track && track.videos.length > 0
      ? Math.round(
          track.videos.reduce((s, v) => s + (mergedPercents[v.videoSlug] ?? 0), 0) /
            track.videos.length
        )
      : 0;

  const allComplete =
    track &&
    track.videos.length > 0 &&
    track.videos.every((v) => (mergedPercents[v.videoSlug] ?? 0) >= 100);

  if (!track || !selectedVideo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{track.sectionTitle}</DialogTitle>
          <DialogDescription>{track.sectionDescription}</DialogDescription>
        </DialogHeader>

        {track.videos.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Videos in this pack</p>
            <div className="flex flex-col gap-2">
              {track.videos.map((v) => {
                const pct = mergedPercents[v.videoSlug] ?? 0;
                const isSel = v.videoSlug === effectiveVideoSlug;
                return (
                  <button
                    key={v.videoSlug}
                    type="button"
                    onClick={() => setSelectedVideoSlug(v.videoSlug)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      isSel ? "border-primary bg-primary/5" : "hover:bg-muted/60"
                    )}
                  >
                    <span className="font-medium">{v.title}</span>
                    <span className="tabular-nums text-muted-foreground">{pct}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{selectedVideo.title}</p>
          {selectedVideo.description ? (
            <p className="text-sm text-muted-foreground">{selectedVideo.description}</p>
          ) : null}
        </div>

        <div className="space-y-4">
          <YoutubeChapterPlayer
            key={`${track.certSlug}-${selectedVideo.videoSlug}-${open}-${seekSeconds}`}
            videoId={certificationStudyVideoId(selectedVideo)}
            startSeconds={seekSeconds}
            onProgress={onProgress}
            onEnded={onEnded}
          />
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>This video</span>
              <span className="tabular-nums">{livePct}%</span>
            </div>
            <Progress value={livePct} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Whole pack (average)</span>
              <span className="tabular-nums">{trackAvg}%</span>
            </div>
            <Progress value={trackAvg} className="h-2" />
            <p className="text-xs text-muted-foreground">
              The certification exam unlocks when <strong>every</strong> video here has reached
              100%.
              {allComplete ? " You are ready to take the exam." : ""}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ExamProps = {
  certSlug: string;
  certTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function CertificationExamDialog({
  certSlug,
  certTitle,
  open,
  onOpenChange,
  onSaved,
}: ExamProps) {
  const questions = useMemo(() => getExamQuestionsForCert(certSlug), [certSlug]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scorePercent, setScorePercent] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAnswers({});
    setSubmitted(false);
    setScorePercent(null);
    setPassed(false);
  }, [open, certSlug]);

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [questions, answers]
  );

  const canSubmit =
    questions.length > 0 && answeredCount === questions.length && !submitted;

  const handleSubmit = () => {
    if (!canSubmit) return;
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    const pct = Math.round((correct / questions.length) * 100);
    recordCertificationExamAttempt(certSlug, pct);
    setScorePercent(pct);
    setPassed(pct >= CERTIFICATION_PASS_PERCENT);
    setSubmitted(true);
    onSaved();
  };

  const handleTryAgain = () => {
    setAnswers({});
    setSubmitted(false);
    setScorePercent(null);
    setPassed(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certification exam — {certTitle}</DialogTitle>
          <DialogDescription>
            Multiple choice. Your score is shown only after you submit. You need at least{" "}
            {CERTIFICATION_PASS_PERCENT}% to earn this certificate. You can retake the exam anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium leading-snug">
                {idx + 1}. {q.prompt}
              </p>
              <RadioGroup
                value={answers[q.id]?.toString() ?? ""}
                onValueChange={(v) => {
                  if (submitted) return;
                  setAnswers((prev) => ({ ...prev, [q.id]: Number.parseInt(v, 10) }));
                }}
                disabled={submitted}
                className="gap-2"
              >
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2 space-y-0">
                    <RadioGroupItem value={String(oi)} id={`${q.id}-${oi}`} />
                    <Label htmlFor={`${q.id}-${oi}`} className="cursor-pointer font-normal">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>

        {submitted && scorePercent !== null && (
          <div
            className={cn(
              "rounded-lg border p-4 text-sm",
              passed
                ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            )}
          >
            <p className="font-semibold">Your score: {scorePercent}%</p>
            {passed ? (
              <p className="mt-1">
                You passed. This certificate is now marked as earned on this device.
              </p>
            ) : (
              <p className="mt-1">
                You did not reach {CERTIFICATION_PASS_PERCENT}%. You are not eligible for this
                certification yet. Review the study material and try again.
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          {submitted ? (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="button" onClick={handleTryAgain}>
                Take exam again
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
                Submit test
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
