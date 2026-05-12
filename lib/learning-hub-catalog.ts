import type { HubCourseCategory } from "@/lib/learning-hub-api";
import {
  ADVANCED_LESSONS,
  advancedLessonVideoId,
  type AdvancedLessonDefinition,
} from "@/lib/learning-advanced";
import {
  BASICS_LESSONS,
  basicsLessonVideoId,
  type BasicsLessonDefinition,
} from "@/lib/learning-basics";
import {
  CERTIFICATIONS,
  certStudyTrackProgressPercent,
  type CertificationStudyRecord,
} from "@/lib/learning-certifications";

export type CatalogProgressRef =
  | { kind: "basics"; slug: string }
  | { kind: "advanced"; slug: string }
  | { kind: "certStudy"; certSlug: string };

/** Shown on Learning Hub → Courses alongside API-backed courses. */
export type LearningCatalogItem = {
  id: string;
  title: string;
  description: string;
  category: HubCourseCategory;
  thumbnail: string | null;
  chapterCount: number;
  href: string;
  /** e.g. Market Basics, Advanced, Certification */
  sourceLabel: string;
  comingSoon?: boolean;
  progressRef?: CatalogProgressRef;
};

function ytThumb(videoId: string): string {
  const id = videoId.trim();
  if (!id || id.length !== 11) return "";
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

function basicsItem(
  lesson: BasicsLessonDefinition,
  category: HubCourseCategory
): LearningCatalogItem {
  const vid = basicsLessonVideoId(lesson);
  return {
    id: `catalog-basics-${lesson.slug}`,
    title: lesson.title,
    description: lesson.description,
    category,
    thumbnail: ytThumb(vid) || null,
    chapterCount: 1,
    href: "/dashboard/learning/basics",
    sourceLabel: "Market Basics",
    progressRef: { kind: "basics", slug: lesson.slug },
  };
}

function advancedItem(
  lesson: AdvancedLessonDefinition,
  category: HubCourseCategory
): LearningCatalogItem {
  const vid = advancedLessonVideoId(lesson);
  return {
    id: `catalog-advanced-${lesson.slug}`,
    title: lesson.title,
    description: lesson.description,
    category,
    thumbnail: ytThumb(vid) || null,
    chapterCount: 1,
    href: "/dashboard/learning/advanced",
    sourceLabel: "Advanced Strategies",
    progressRef: { kind: "advanced", slug: lesson.slug },
  };
}

/** Map each advanced lesson to the tab it belongs in. */
function categoryForAdvancedLesson(slug: string): HubCourseCategory {
  if (slug === "alternative-investments") return "CRYPTO";
  return "TRADING";
}

/** Map each certification to the tab it fits best. */
function categoryForCertification(slug: string): HubCourseCategory {
  if (slug === "cryptocurrency-specialist") return "CRYPTO";
  if (slug === "technical-analysis-expert") return "TRADING";
  return "FINANCE";
}

function certificationItem(
  slug: string,
  title: string,
  description: string,
  badge: string
): LearningCatalogItem {
  const category = categoryForCertification(slug);
  return {
    id: `catalog-cert-${slug}`,
    title,
    description,
    category,
    thumbnail: badge || null,
    chapterCount: 1,
    href: "/dashboard/learning/certifications",
    sourceLabel: "Certifications",
    progressRef: { kind: "certStudy", certSlug: slug },
  };
}

/** Curated items aligned with Market Basics, Advanced Strategies, and Certifications. */
export function getLearningCatalogItems(): LearningCatalogItem[] {
  const basics = BASICS_LESSONS.map((l) => basicsItem(l, "FINANCE"));

  const advanced = ADVANCED_LESSONS.map((l) =>
    advancedItem(l, categoryForAdvancedLesson(l.slug))
  );

  const certs = CERTIFICATIONS.map((c) =>
    certificationItem(c.slug, c.title, c.description, c.badge)
  );

  return [...basics, ...advanced, ...certs];
}

/** Placeholder courses for a future catalog (To be announced tab only). */
export const LEARNING_CATALOG_COMING_SOON: LearningCatalogItem[] = [
  {
    id: "catalog-tba-defi-risk",
    title: "DeFi protocols & risk",
    description:
      "Smart contracts, liquidity pools, and how to evaluate protocol risk — coming to the Learning Hub.",
    category: "CRYPTO",
    thumbnail: null,
    chapterCount: 1,
    href: "#",
    sourceLabel: "To be announced",
    comingSoon: true,
  },
  {
    id: "catalog-tba-options-math",
    title: "Options pricing intuition",
    description:
      "Greeks, implied volatility, and payoff diagrams in plain language — planned module.",
    category: "TRADING",
    thumbnail: null,
    chapterCount: 1,
    href: "#",
    sourceLabel: "To be announced",
    comingSoon: true,
  },
  {
    id: "catalog-tba-tax-efficient",
    title: "Tax-efficient investing",
    description:
      "Withdrawal ordering, asset location, and planning across accounts — scheduled release.",
    category: "FINANCE",
    thumbnail: null,
    chapterCount: 1,
    href: "#",
    sourceLabel: "To be announced",
    comingSoon: true,
  },
  {
    id: "catalog-tba-esg",
    title: "ESG & sustainable portfolios",
    description:
      "Frameworks, data quality, and portfolio implementation — coming later this year.",
    category: "FINANCE",
    thumbnail: null,
    chapterCount: 1,
    href: "#",
    sourceLabel: "To be announced",
    comingSoon: true,
  },
];

export type CoursesTab = "all" | HubCourseCategory | "upcoming";

export function catalogItemsForTab(tab: CoursesTab): LearningCatalogItem[] {
  const curated = getLearningCatalogItems();
  const upcoming = LEARNING_CATALOG_COMING_SOON;
  if (tab === "upcoming") return upcoming;
  if (tab === "all") return curated;
  return curated.filter((c) => c.category === tab);
}

export function resolveCatalogProgressPercent(
  item: LearningCatalogItem,
  ctx: {
    basicsMap: Record<string, { watchPercent?: number }>;
    advancedMap: Record<string, { watchPercent?: number }>;
    certStudyMap: Record<string, CertificationStudyRecord>;
  }
): number {
  const ref = item.progressRef;
  if (!ref) return 0;
  if (ref.kind === "basics") return ctx.basicsMap[ref.slug]?.watchPercent ?? 0;
  if (ref.kind === "advanced") return ctx.advancedMap[ref.slug]?.watchPercent ?? 0;
  if (ref.kind === "certStudy") {
    return certStudyTrackProgressPercent(ref.certSlug, ctx.certStudyMap);
  }
  return 0;
}
