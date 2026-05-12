"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { CourseChapterDetail } from "@/lib/learning-hub-api";
import { postChapterComplete } from "@/lib/learning-hub-api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: CourseChapterDetail | null;
  onPassed: () => void;
};

export function ChapterQuizModal({ open, onOpenChange, chapter, onPassed }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = chapter?.quiz.questions ?? [];

  const chapterId = chapter?.id;
  useEffect(() => {
    if (open && chapterId) {
      setAnswers({});
      setError(null);
    }
  }, [open, chapterId]);

  const handleSubmit = async () => {
    if (!chapter) return;
    setSubmitting(true);
    setError(null);
    try {
      const numeric: Record<string, number> = {};
      for (const q of questions) {
        const v = answers[q.id];
        if (v === undefined) {
          setError("Please answer every question.");
          setSubmitting(false);
          return;
        }
        numeric[q.id] = Number.parseInt(v, 10);
      }
      await postChapterComplete(chapter.id, numeric);
      onPassed();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quiz could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const autoCompleteEmpty = async () => {
    if (!chapter) return;
    setSubmitting(true);
    setError(null);
    try {
      await postChapterComplete(chapter.id, {});
      onPassed();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark chapter complete.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chapter check-in</DialogTitle>
          <DialogDescription>
            {questions.length > 0
              ? "Answer the questions below to mark this chapter as finished."
              : "Confirm to mark this chapter as finished."}
          </DialogDescription>
        </DialogHeader>

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This chapter has no quiz questions. You can complete it with one click.
          </p>
        ) : (
          <div className="max-h-[50vh] space-y-6 overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <Label className="text-sm font-medium">
                  {idx + 1}. {q.prompt}
                </Label>
                <RadioGroup
                  value={answers[q.id] ?? ""}
                  onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                  className="gap-2"
                >
                  {q.options.map((opt, i) => (
                    <div key={`${q.id}-${i}`} className="flex items-center gap-2">
                      <RadioGroupItem value={String(i)} id={`${q.id}-${i}`} />
                      <Label htmlFor={`${q.id}-${i}`} className="font-normal cursor-pointer">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Later
          </Button>
          {questions.length === 0 ? (
            <Button type="button" onClick={autoCompleteEmpty} disabled={submitting}>
              {submitting ? "Saving…" : "Mark complete"}
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Checking…" : "Submit answers"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
