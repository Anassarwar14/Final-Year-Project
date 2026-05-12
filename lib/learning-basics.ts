export type BasicsLessonDefinition = {
  slug: string;
  title: string;
  description: string;
  durationLabel: string;
  difficulty: string;
  /**
   * YouTube **video id** only (11 characters), e.g. from `https://www.youtube.com/watch?v=ZCFkWDdm_G8`
   * → use `ZCFkWDdm_G8`. If `youtubeUrl` is set, it wins and this can be a placeholder.
   */
  youtubeVideoId: string;
  /**
   * Optional full URL or short youtu.be link — easier when copying from the browser.
   * Example: `https://www.youtube.com/watch?v=ZCFkWDdm_G8`
   */
  youtubeUrl?: string;
  /** Used to estimate resume position from saved % */
  estimatedDurationSeconds: number;
  takeaways: string[];
  iconKey: "TrendingUp" | "Shield" | "PieChart" | "DollarSign";
};

/**
 * ### How to use your own YouTube videos
 *
 * 1. Open the video on YouTube.
 * 2. Copy the **video id** from the address bar:
 *    - `https://www.youtube.com/watch?v=VIDEO_ID` → use `VIDEO_ID`
 *    - `https://youtu.be/VIDEO_ID` → use `VIDEO_ID`
 * 3. Put that id in `youtubeVideoId`, **or** paste the full link in optional `youtubeUrl`.
 * 4. Save the file and refresh the app (hard refresh if needed).
 *
 * **"Video unavailable"** usually means: embedding disabled for that video, it was taken down,
 * or it is blocked in your region. Fix: pick another video, or upload your own and in
 * YouTube Studio → **Allow embedding**.
 */
export const BASICS_LESSONS: BasicsLessonDefinition[] = [
  {
    slug: "what-is-investing",
    title: "What is Investing?",
    description:
      "Learn the fundamentals of investing and why it matters for long-term financial goals.",
    durationLabel: "15 min",
    difficulty: "Beginner",
    youtubeVideoId: "Arz_9WX-pn0",
    estimatedDurationSeconds: 300,
    takeaways: [
      "Investing means putting money to work to earn a return over time.",
      "Compound growth rewards consistency and an early start.",
      "Risk and time horizon should guide how you invest.",
    ],
    iconKey: "TrendingUp",
  },
  {
    slug: "risk-and-return",
    title: "Understanding Risk and Return",
    description:
      "Explore how potential returns relate to the risk you take in different investments.",
    durationLabel: "9 min",
    difficulty: "Beginner",
    youtubeVideoId: "7-a-CtCwTRc",
    estimatedDurationSeconds: 540,
    takeaways: [
      "Higher expected return often comes with higher volatility.",
      "Diversification can reduce risk without giving up all return.",
      "Your personal risk tolerance should match your portfolio.",
    ],
    iconKey: "Shield",
  },
  {
    slug: "types-of-investments",
    title: "Types of Investments",
    description:
      "Stocks, bonds, ETFs, and funds — how they differ and when each might fit a plan.",
    durationLabel: "12 min",
    difficulty: "Beginner",
    youtubeVideoId: "i-To1GILOhA",
    estimatedDurationSeconds: 720,
    takeaways: [
      "Equities offer ownership and growth potential with more volatility.",
      "Fixed income can provide income and ballast in diversified portfolios.",
      "Funds and ETFs bundle many holdings for simple diversification.",
    ],
    iconKey: "PieChart",
  },
  {
    slug: "first-portfolio",
    title: "Building Your First Portfolio",
    description:
      "A practical framing for goals, asset mix, and habits when you start investing.",
    durationLabel: "11 min",
    difficulty: "Beginner",
    youtubeVideoId: "j9Q84_Gn_T0",
    estimatedDurationSeconds: 660,
    takeaways: [
      "Start with clear goals and a realistic contribution rhythm.",
      "Broad, low-cost diversification suits many beginners.",
      "Revisit your plan periodically; life and markets change.",
    ],
    iconKey: "DollarSign",
  },
];

/** Accepts a bare 11-char id or a full / short YouTube URL; returns "" if nothing parsed. */
export function parseBasicsYoutubeInput(value: string): string {
  const t = value.trim();
  if (!t) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(t)) return t;
  const m = t.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i
  );
  return m?.[1] ?? "";
}

/** Id passed to the iframe player for a Market Basics lesson. */
export function basicsLessonVideoId(lesson: BasicsLessonDefinition): string {
  const fromUrl = lesson.youtubeUrl ? parseBasicsYoutubeInput(lesson.youtubeUrl) : "";
  if (fromUrl) return fromUrl;
  return parseBasicsYoutubeInput(lesson.youtubeVideoId) || lesson.youtubeVideoId;
}

export type BasicsLessonRecord = {
  watchPercent: number;
  secondsEngaged: number;
  startedAt: string | null;
  completedAt: string | null;
};

const STORAGE_KEY = "fyp-learning-basics-progress-v1";

export function loadBasicsProgress(): Record<string, BasicsLessonRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, BasicsLessonRecord>;
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

export function saveBasicsProgress(all: Record<string, BasicsLessonRecord>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function emptyRecord(): BasicsLessonRecord {
  return {
    watchPercent: 0,
    secondsEngaged: 0,
    startedAt: null,
    completedAt: null,
  };
}

export function upsertBasicsLesson(slug: string, patch: Partial<BasicsLessonRecord>) {
  const all = loadBasicsProgress();
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
  saveBasicsProgress(all);
}

export function addEngagedSeconds(slug: string, deltaSeconds: number) {
  if (deltaSeconds <= 0) return;
  const all = loadBasicsProgress();
  const prev = all[slug] ?? {
    watchPercent: 0,
    secondsEngaged: 0,
    startedAt: null,
    completedAt: null,
  };
  all[slug] = {
    ...prev,
    secondsEngaged: Math.round(prev.secondsEngaged + deltaSeconds),
    startedAt: prev.startedAt ?? new Date().toISOString(),
  };
  saveBasicsProgress(all);
}

export function formatDurationSeconds(total: number) {
  const s = Math.max(0, Math.round(total));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  if (r === 0) return `${m}m`;
  return `${m}m ${r}s`;
}

export function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  } catch {
    return "—";
  }
}

/** Clear every Market Basics lesson on this device (demo / fresh start). */
export function resetBasicsTrackForDemo(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
