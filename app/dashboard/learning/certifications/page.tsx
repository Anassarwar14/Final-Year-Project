"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  RotateCcw,
  ExternalLink,
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
  CERTIFICATION_PASS_PERCENT,
  CERTIFICATIONS,
  advancedCertificateEarnedDate,
  advancedCourseProgressPercent,
  basicsCertificateEarnedDate,
  basicsCourseProgressPercent,
  isAdvancedCertificateEarned,
  isBasicsCertificateEarned,
  certStudyTrackProgressPercent,
  isCertStudyPrepComplete,
  loadCertificationExamProgress,
  loadCertificationStudyProgress,
  resetCertificationStudyAndExams,
  studyTrackByCertSlug,
  type CertificationDefinition,
  type CertificationExamRecord,
  type CertificationStudyRecord,
} from "@/lib/learning-certifications";
import { loadAdvancedProgress, type AdvancedLessonRecord } from "@/lib/learning-advanced";
import { formatDateTime, loadBasicsProgress, type BasicsLessonRecord } from "@/lib/learning-basics";
import {
  CertificationExamDialog,
  CertificationStudyDialog,
} from "@/components/learning-certifications/certification-study-exam-dialogs";

function getLevelColor(level: string) {
  switch (level) {
    case "Beginner":
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
    case "Intermediate":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
    case "Advanced":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

type CertVm = {
  def: CertificationDefinition;
  earned: boolean;
  preparationPct: number;
  earnedDateLabel: string;
  examAttempts: number;
  examPassed: boolean;
  examBest: number;
};

export default function CertificationsPage() {
  const [tick, setTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [studySlug, setStudySlug] = useState<string | null>(null);
  const [examSlug, setExamSlug] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const { basicsMap, advancedMap, studyMap, examMap } = useMemo(() => {
    void tick;
    if (!hydrated) {
      return {
        basicsMap: {} as Record<string, BasicsLessonRecord>,
        advancedMap: {} as Record<string, AdvancedLessonRecord>,
        studyMap: {} as Record<string, CertificationStudyRecord>,
        examMap: {} as Record<string, CertificationExamRecord>,
      };
    }
    return {
      basicsMap: loadBasicsProgress(),
      advancedMap: loadAdvancedProgress(),
      studyMap: loadCertificationStudyProgress(),
      examMap: loadCertificationExamProgress(),
    };
  }, [hydrated, tick]);

  const rows: CertVm[] = useMemo(() => {
    return CERTIFICATIONS.map((def) => {
      if (def.kind === "course_basics") {
        const earned = isBasicsCertificateEarned(basicsMap);
        return {
          def,
          earned,
          preparationPct: basicsCourseProgressPercent(basicsMap),
          earnedDateLabel: formatDateTime(basicsCertificateEarnedDate(basicsMap)),
          examAttempts: 0,
          examPassed: false,
          examBest: 0,
        };
      }
      if (def.kind === "course_advanced") {
        const earned = isAdvancedCertificateEarned(advancedMap);
        return {
          def,
          earned,
          preparationPct: advancedCourseProgressPercent(advancedMap),
          earnedDateLabel: formatDateTime(advancedCertificateEarnedDate(advancedMap)),
          examAttempts: 0,
          examPassed: false,
          examBest: 0,
        };
      }
      const ex = examMap[def.slug];
      const prep = certStudyTrackProgressPercent(def.slug, studyMap);
      return {
        def,
        earned: Boolean(ex?.passed),
        preparationPct: prep,
        earnedDateLabel: formatDateTime(ex?.passedAt ?? null),
        examAttempts: ex?.attempts ?? 0,
        examPassed: Boolean(ex?.passed),
        examBest: ex?.bestScore ?? 0,
      };
    });
  }, [basicsMap, advancedMap, studyMap, examMap]);

  const earnedRows = rows.filter((r) => r.earned);
  const availableRows = rows.filter((r) => !r.earned);

  const inProgressCount = availableRows.filter(
    (r) => r.preparationPct > 0 || (r.def.kind === "study_exam" && r.examAttempts > 0)
  ).length;

  const studyCertsTotal = rows.filter((r) => r.def.kind === "study_exam").length;
  const studyPassedCount = rows.filter((r) => r.def.kind === "study_exam" && r.examPassed).length;
  const successRateLabel =
    studyCertsTotal > 0 ? `${Math.round((studyPassedCount / studyCertsTotal) * 100)}%` : "—";

  const studyTrack = studySlug ? studyTrackByCertSlug(studySlug) ?? null : null;
  const examDef = examSlug ? rows.find((r) => r.def.slug === examSlug)?.def : null;

  return (
    <>
      <CertificationStudyDialog
        track={studyTrack}
        open={Boolean(studyTrack)}
        onOpenChange={(o) => {
          if (!o) setStudySlug(null);
        }}
        onSaved={refresh}
      />
      {examDef && (
        <CertificationExamDialog
          certSlug={examDef.slug}
          certTitle={examDef.title}
          open={Boolean(examSlug)}
          onOpenChange={(o) => {
            if (!o) setExamSlug(null);
          }}
          onSaved={refresh}
        />
      )}

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset certification prep & exams?</AlertDialogTitle>
            <AlertDialogDescription>
              Clears study video progress and exam scores for the <strong>four</strong> study-guide
              certifications on this browser. Course-based certificates (Market Basics / Advanced
              Strategies) follow progress on those pages — reset them there if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetCertificationStudyAndExams();
                refresh();
              }}
            >
              Reset study & exams
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Certifications</h1>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setResetOpen(true)}>
              <RotateCcw className="h-4 w-4" />
              Reset study & exams
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificates earned</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hydrated ? earnedRows.length : "—"}
                  <span className="text-sm text-muted-foreground">/6</span>
                </div>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hydrated ? inProgressCount : "—"}</div>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study exams passed</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hydrated ? successRateLabel : "—"}</div>
                <p className="text-xs text-muted-foreground">
                  {hydrated ? `${studyPassedCount}/${studyCertsTotal} study certs` : ""}
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recognition</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Verified</div>
                <p className="text-xs text-muted-foreground">Tracked on this device</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Earned certificates
              </CardTitle>
              <CardDescription>
                Course certificates unlock from lesson progress; study certificates require a
                passing exam score ({CERTIFICATION_PASS_PERCENT}%+).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earnedRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  None yet — complete Market Basics, Advanced Strategies, or pass a study exam.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {earnedRows.map((r) => (
                    <div
                      key={r.def.id}
                      className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={r.def.badge || "/placeholder.svg"}
                          alt={r.def.title}
                          className="h-16 w-16 rounded-lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                            <h3 className="font-semibold">{r.def.title}</h3>
                            <Badge className={getLevelColor(r.def.level)}>{r.def.level}</Badge>
                          </div>
                          <p className="mb-3 text-sm text-muted-foreground">{r.def.description}</p>
                          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>Earned: {r.earnedDateLabel}</span>
                            {r.def.kind === "study_exam" && (
                              <span>Best score: {r.examBest}%</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {r.def.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available certifications</CardTitle>
              <CardDescription>Credentials you can still earn on this account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableRows.map((r) => (
                  <AvailableCertCard
                    key={r.def.id}
                    row={r}
                    studyMap={studyMap}
                    hydrated={hydrated}
                    onStudy={() => setStudySlug(r.def.slug)}
                    onExam={() => setExamSlug(r.def.slug)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  );
}

function AvailableCertCard({
  row,
  studyMap,
  hydrated,
  onStudy,
  onExam,
}: {
  row: CertVm;
  studyMap: Record<string, CertificationStudyRecord>;
  hydrated: boolean;
  onStudy: () => void;
  onExam: () => void;
}) {
  const { def, preparationPct, examAttempts, examBest } = row;
  const isCourse = def.kind !== "study_exam";
  const prepLabel = isCourse ? "Course progress" : "Preparation progress";
  const examUnlocked =
    def.kind === "study_exam" ? isCertStudyPrepComplete(def.slug, studyMap) : false;

  const courseHref =
    def.kind === "course_basics"
      ? "/dashboard/learning/basics"
      : def.kind === "course_advanced"
        ? "/dashboard/learning/advanced"
        : null;

  return (
    <div className="rounded-lg border p-4 transition-colors hover:bg-accent/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <img
          src={def.badge || "/placeholder.svg"}
          alt={def.title}
          className="h-16 w-16 shrink-0 rounded-lg opacity-80"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-semibold">{def.title}</h3>
            <Badge className={getLevelColor(def.level)}>{def.level}</Badge>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">{def.description}</p>

          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {isCourse ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Automatic — complete all lessons in the linked track
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Study videos + MCQ exam (pass {CERTIFICATION_PASS_PERCENT}%+)
                </span>
                {examAttempts > 0 && (
                  <span>
                    Attempts: {examAttempts}
                    {examBest > 0 ? ` · Best ${examBest}%` : ""}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="mb-3">
            <div className="mb-1 flex justify-between text-xs">
              <span>{prepLabel}</span>
              <span className="tabular-nums">{hydrated ? `${preparationPct}%` : "—"}</span>
            </div>
            <Progress value={hydrated ? preparationPct : 0} className="h-2" />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Requirements</h4>
            <div className="flex flex-wrap gap-1">
              {def.prerequisites.map((prereq) => (
                <Badge key={prereq} variant="outline" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
            <h4 className="text-sm font-medium">Skills validated</h4>
            <div className="flex flex-wrap gap-1">
              {def.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              {isCourse
                ? preparationPct >= 100
                  ? "All lessons complete — certificate should appear above"
                  : "Finish every lesson in the course track"
                : examUnlocked
                  ? "Ready for the exam"
                  : "Finish every study video to the end first"}
            </span>
            <div className="flex flex-wrap gap-2">
              {courseHref && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={courseHref} className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open course
                  </Link>
                </Button>
              )}
              {def.kind === "study_exam" && (
                <>
                  <Button variant="outline" size="sm" className="gap-2" onClick={onStudy}>
                    <BookOpen className="h-4 w-4" />
                    Study guide
                  </Button>
                  <Button size="sm" className="gap-2" disabled={!hydrated || !examUnlocked} onClick={onExam}>
                    <Award className="h-4 w-4" />
                    Take exam
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
