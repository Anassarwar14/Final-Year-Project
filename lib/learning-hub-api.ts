/**
 * Prefer NEXT_PUBLIC_API_URL; in the browser fall back to the current origin so
 * Learning Hub works even when the env var was not set at build time.
 */
export function learningHubApiOrigin(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

const base = () => learningHubApiOrigin();

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) throw new Error(text || res.statusText);
    throw new Error("Invalid JSON from server");
  }
  if (!res.ok) {
    const err =
      typeof data === "object" &&
      data &&
      "error" in data &&
      typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : res.statusText;
    throw new Error(err);
  }
  return data as T;
}

export type HubCourseCategory = "CRYPTO" | "TRADING" | "FINANCE";

export type CourseListItem = {
  id: string;
  title: string;
  description: string;
  category: HubCourseCategory;
  thumbnail: string | null;
  chapterCount: number;
  progressPercent: number;
  isFavorite: boolean;
  isWatchLater: boolean;
  /** First incomplete chapter in order; use for ?chapter= deep links */
  resumeChapterId: string | null;
};

export type CourseChapterDetail = {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeVideoId: string | null;
  order: number;
  quiz: { questions: { id: string; prompt: string; options: string[] }[] };
  isCompleted: boolean;
};

export type CourseDetail = {
  id: string;
  title: string;
  description: string;
  category: HubCourseCategory;
  thumbnail: string | null;
  progressPercent: number;
  isFavorite: boolean;
  isWatchLater: boolean;
  chapters: CourseChapterDetail[];
};

export function coursePlayerHref(courseId: string, resumeChapterId?: string | null) {
  const q = resumeChapterId
    ? `?chapter=${encodeURIComponent(resumeChapterId)}`
    : "";
  return `/dashboard/learning/courses/${courseId}${q}`;
}

export async function fetchLearningCourses(category?: HubCourseCategory | "all") {
  const q =
    category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`${base()}/api/learning-hub/courses${q}`, {
    credentials: "include",
  });
  return parseJson<{ courses: CourseListItem[] }>(res);
}

export async function fetchLearningCourse(courseId: string) {
  const res = await fetch(`${base()}/api/learning-hub/courses/${courseId}`, {
    credentials: "include",
  });
  return parseJson<{ course: CourseDetail }>(res);
}

export async function postChapterComplete(chapterId: string, answers: Record<string, number>) {
  const res = await fetch(`${base()}/api/learning-hub/chapters/${chapterId}/complete`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  return parseJson<{ progressPercent: number; courseId: string }>(res);
}

export async function postCourseFavorite(courseId: string, active: boolean) {
  const res = await fetch(`${base()}/api/learning-hub/courses/${courseId}/favorite`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
  return parseJson<{ active: boolean }>(res);
}

export async function postCourseWatchLater(courseId: string, active: boolean) {
  const res = await fetch(`${base()}/api/learning-hub/courses/${courseId}/watch-later`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
  return parseJson<{ active: boolean }>(res);
}
