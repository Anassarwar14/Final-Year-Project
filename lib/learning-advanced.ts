/**
 * Advanced Strategies — same localStorage pattern as Market Basics.
 * Lessons 3–4 stay locked until the first two lessons (see ADVANCED_UNLOCK_SLUGS) are 100% complete.
 */

export type AdvancedLessonDefinition = {
  slug: string;
  title: string;
  description: string;
  durationLabel: string;
  difficulty: string;
  youtubeVideoId: string;
  youtubeUrl?: string;
  estimatedDurationSeconds: number;
  takeaways: string[];
  iconKey: "BarChart3" | "Target" | "Zap" | "TrendingUp";
  /**
   * When true, lesson stays locked until every slug in ADVANCED_UNLOCK_SLUGS has watchPercent >= 100.
   */
  gated: boolean;
};

/** First two advanced videos must be finished before gated lessons unlock. */
export const ADVANCED_UNLOCK_SLUGS = ["technical-analysis", "options-strategies"] as const;

export const ADVANCED_LESSONS: AdvancedLessonDefinition[] = [
  {
    slug: "technical-analysis",
    title: "Technical Analysis Mastery",
    description:
      "Learn to read charts, identify patterns, and make data-driven investment decisions.",
    durationLabel: "78 min",
    difficulty: "Advanced",
    youtubeVideoId: "eynxyoKgpng",
    estimatedDurationSeconds: 1560,
    takeaways: [
      "Price and volume reflect collective market expectations.",
      "Trend, support, and resistance frame many charting approaches.",
      "Indicators are tools — context and risk management still matter.",
    ],
    iconKey: "BarChart3",
    gated: false,
  },
  {
    slug: "options-strategies",
    title: "Trading Strategies For Advanced Traders",
    description:
      "Income, hedging, and defined-risk ideas used with exchange-traded options.",
    durationLabel: "545 min",
    difficulty: "Advanced",
    youtubeVideoId: "9Zxfq0As4tU",
    estimatedDurationSeconds: 32700,
    takeaways: [
      "Calls and puts encode rights, not obligations, for buyers.",
      "Spreads and covered strategies cap risk or generate premium.",
      "Liquidity, spreads, and assignment risk matter in practice.",
    ],
    iconKey: "Target",
    gated: false,
  },
  {
    slug: "algorithmic-trading",
    title: "Algorithmic Trading Basics",
    description:
      "Introduction to rules-based execution, backtests, and what “systematic” really means.",
    durationLabel: "11 min",
    difficulty: "Expert",
    youtubeVideoId: "w3BGQNsNFdk",
    estimatedDurationSeconds: 660,
    takeaways: [
      "Algorithms encode rules; garbage in still means garbage out.",
      "Backtests are historical — forward performance can differ sharply.",
      "Infrastructure, slippage, and fees eat edge at small scale.",
    ],
    iconKey: "Zap",
    gated: true,
  },
  {
    slug: "alternative-investments",
    title: "Alternative Investments",
    description:
      "REITs, commodities, crypto, and other sleeves beyond core stocks and bonds.",
    durationLabel: "3 min",
    difficulty: "Advanced",
    youtubeVideoId: "d3NWBvKQEdE",
    estimatedDurationSeconds: 180,
    takeaways: [
      "Alternatives can diversify but often add complexity and fees.",
      "Liquidity and valuation differ widely across structures.",
      "Size any sleeve to your plan and risk tolerance.",
    ],
    iconKey: "TrendingUp",
    gated: true,
  },
];

export type AdvancedLessonRecord = {
  watchPercent: number;
  secondsEngaged: number;
  startedAt: string | null;
  completedAt: string | null;
};

const STORAGE_KEY = "fyp-learning-advanced-progress-v1";

export function loadAdvancedProgress(): Record<string, AdvancedLessonRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, AdvancedLessonRecord>;
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

export function saveAdvancedProgress(all: Record<string, AdvancedLessonRecord>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function emptyRecord(): AdvancedLessonRecord {
  return {
    watchPercent: 0,
    secondsEngaged: 0,
    startedAt: null,
    completedAt: null,
  };
}

export function upsertAdvancedLesson(slug: string, patch: Partial<AdvancedLessonRecord>) {
  const all = loadAdvancedProgress();
  const prev = all[slug] ?? emptyRecord();
  const watchPercent =
    patch.watchPercent !== undefined
      ? Math.min(100, Math.max(prev.watchPercent, patch.watchPercent))
      : prev.watchPercent;
  const startedAt =
    prev.startedAt ??
    patch.startedAt ??
    (watchPercent > 0 ? new Date().toISOString() : null);
  const completedAt =
    watchPercent >= 100
      ? prev.completedAt ?? patch.completedAt ?? new Date().toISOString()
      : null;
  all[slug] = {
    watchPercent,
    secondsEngaged: patch.secondsEngaged ?? prev.secondsEngaged,
    startedAt,
    completedAt,
  };
  saveAdvancedProgress(all);
}

export function addAdvancedEngagedSeconds(slug: string, deltaSeconds: number) {
  if (deltaSeconds <= 0) return;
  const all = loadAdvancedProgress();
  const prev = all[slug] ?? emptyRecord();
  all[slug] = {
    ...prev,
    secondsEngaged: Math.round(prev.secondsEngaged + deltaSeconds),
    startedAt: prev.startedAt ?? new Date().toISOString(),
  };
  saveAdvancedProgress(all);
}

export function advancedPrerequisitesMet(
  progress: Record<string, AdvancedLessonRecord>
): boolean {
  return ADVANCED_UNLOCK_SLUGS.every(
    (slug) => (progress[slug]?.watchPercent ?? 0) >= 100
  );
}

export function isAdvancedLessonLocked(
  lesson: AdvancedLessonDefinition,
  progress: Record<string, AdvancedLessonRecord>
): boolean {
  if (!lesson.gated) return false;
  return !advancedPrerequisitesMet(progress);
}

/**
 * Clear only the two foundation lessons (technical analysis + options).
 * Expert lessons become **locked** again, but any saved progress on lessons 3–4 stays in storage
 * until you open them again after unlocking.
 */
export function resetAdvancedFoundationProgress(): void {
  const all = { ...loadAdvancedProgress() };
  for (const slug of ADVANCED_UNLOCK_SLUGS) {
    delete all[slug];
  }
  saveAdvancedProgress(all);
}

/**
 * Clear progress on gated lessons (algorithmic + alternative) only.
 * Use with {@link resetAdvancedFoundationProgress} for a fully clean demo.
 */
export function resetAdvancedGatedLessonsProgress(): void {
  const all = { ...loadAdvancedProgress() };
  for (const lesson of ADVANCED_LESSONS) {
    if (lesson.gated) delete all[lesson.slug];
  }
  saveAdvancedProgress(all);
}

/**
 * Foundation + gated lessons cleared — shows locked expert track and 0% everywhere on this page.
 * Best for walking a teacher through the flow from scratch.
 */
export function resetAdvancedTrackForDemo(): void {
  resetAdvancedFoundationProgress();
  resetAdvancedGatedLessonsProgress();
}

/** Remove every saved advanced lesson on this device. */
export function clearAllAdvancedProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function parseAdvancedYoutubeInput(value: string): string {
  const t = value.trim();
  if (!t) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(t)) return t;
  const m = t.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i
  );
  return m?.[1] ?? "";
}

export function advancedLessonVideoId(lesson: AdvancedLessonDefinition): string {
  const fromUrl = lesson.youtubeUrl ? parseAdvancedYoutubeInput(lesson.youtubeUrl) : "";
  if (fromUrl) return fromUrl;
  return parseAdvancedYoutubeInput(lesson.youtubeVideoId) || lesson.youtubeVideoId;
}
