"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { BookOpen } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  fetchLearningCourses,
  type CourseListItem,
  type HubCourseCategory,
} from "@/lib/learning-hub-api";
import {
  catalogItemsForTab,
  resolveCatalogProgressPercent,
  type CoursesTab,
} from "@/lib/learning-hub-catalog";
import { loadBasicsProgress } from "@/lib/learning-basics";
import { loadAdvancedProgress } from "@/lib/learning-advanced";
import { loadCertificationStudyProgress } from "@/lib/learning-certifications";
import { LearningCourseCard } from "@/components/learning-hub/course-card";
import { LearningCatalogCourseCard } from "@/components/learning-hub/catalog-course-card";

async function listFetcher(tab: CoursesTab) {
  if (tab === "upcoming") return [] as CourseListItem[];
  const cat: HubCourseCategory | "all" | undefined =
    tab === "all" ? "all" : (tab as HubCourseCategory);
  const { courses } = await fetchLearningCourses(cat);
  return courses;
}

function CoursesPageInner() {
  const { user } = useCurrentUser();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<CoursesTab>("all");
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [progressTick, setProgressTick] = useState(0);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const bump = () => setProgressTick((x) => x + 1);
    window.addEventListener("focus", bump);
    return () => window.removeEventListener("focus", bump);
  }, []);

  useEffect(() => {
    const c = searchParams.get("category");
    const u = c?.toUpperCase();
    if (u === "CRYPTO" || u === "TRADING" || u === "FINANCE") {
      setTab(u as CoursesTab);
      return;
    }
    if (c?.toLowerCase() === "upcoming") {
      setTab("upcoming");
    }
  }, [searchParams]);

  const swrKey = useMemo(
    () => (tab === "upcoming" ? null : (["learning-courses", tab] as const)),
    [tab]
  );
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    ([, t]) => listFetcher(t as CoursesTab),
    { revalidateOnFocus: true }
  );

  const progressCtx = useMemo(() => {
    void progressTick;
    if (!hydrated) return null;
    return {
      basicsMap: loadBasicsProgress(),
      advancedMap: loadAdvancedProgress(),
      certStudyMap: loadCertificationStudyProgress(),
    };
  }, [hydrated, progressTick]);

  const apiList = tab === "upcoming" ? [] : (data ?? []);

  const catalogList = useMemo(() => catalogItemsForTab(tab), [tab]);

  const filteredApi = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apiList;
    return apiList.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [apiList, query]);

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalogList;
    return catalogList.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [catalogList, query]);

  const catalogWithProgress = useMemo(() => {
    return filteredCatalog.map((item) => ({
      item,
      progress:
        progressCtx && !item.comingSoon
          ? resolveCatalogProgressPercent(item, progressCtx)
          : 0,
    }));
  }, [filteredCatalog, progressCtx]);

  const showLoading = tab !== "upcoming" && isLoading;
  const showError = tab !== "upcoming" && error;

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border" />
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Learning Hub</h1>
        </div>
        <div className="ml-auto flex min-w-[200px] flex-1 basis-full sm:basis-auto sm:max-w-xs">
          <Input
            placeholder="Search courses…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9"
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <p className="text-sm text-muted-foreground">
          Video courses (quizzes) plus the same lessons as{" "}
          <span className="font-medium text-foreground">Market Basics</span>,{" "}
          <span className="font-medium text-foreground">Advanced Strategies</span>, and{" "}
          <span className="font-medium text-foreground">Certifications</span>, grouped by topic.
        </p>

        <Tabs value={tab} onValueChange={(v) => setTab(v as CoursesTab)} className="space-y-4">
          <TabsList className="flex h-auto w-full flex-wrap gap-1 sm:grid sm:max-w-3xl sm:grid-cols-5">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">
              All
            </TabsTrigger>
            <TabsTrigger value="CRYPTO" className="flex-1 sm:flex-none">
              Crypto
            </TabsTrigger>
            <TabsTrigger value="TRADING" className="flex-1 sm:flex-none">
              Trading
            </TabsTrigger>
            <TabsTrigger value="FINANCE" className="flex-1 sm:flex-none">
              Finance
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1 sm:flex-none">
              To be announced
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {showLoading && <p className="text-sm text-muted-foreground">Loading courses…</p>}
        {showError && (
          <p className="text-sm text-destructive">
            Unable to load video courses
            {error instanceof Error && error.message ? `: ${error.message}` : ""}. Curated lessons
            below still work. If the database is empty, run the Learning Hub seed.
          </p>
        )}
        {!showLoading && !showError && filteredApi.length === 0 && catalogWithProgress.length === 0 && (
          <p className="text-sm text-muted-foreground">No courses match your filters.</p>
        )}

        {filteredApi.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Video courses (hub)</h2>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredApi.map((course: CourseListItem) => (
                <LearningCourseCard
                  key={course.id}
                  course={course}
                  signedIn={Boolean(user)}
                  onMutate={() => void mutate()}
                />
              ))}
            </div>
          </div>
        )}

        {catalogWithProgress.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {tab === "upcoming"
                ? "Coming later"
                : "Market Basics, Advanced & certifications (on-site lessons)"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {catalogWithProgress.map(({ item, progress }) => (
                <LearningCatalogCourseCard key={item.id} item={item} progressPercent={progress} />
              ))}
            </div>
          </div>
        )}
      </div>
    </SidebarInset>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <SidebarInset>
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Loading…
          </div>
        </SidebarInset>
      }
    >
      <CoursesPageInner />
    </Suspense>
  );
}
