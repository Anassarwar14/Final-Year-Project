import { ADVANCED_LESSONS } from "@/lib/learning-advanced";
import { BASICS_LESSONS, parseBasicsYoutubeInput } from "@/lib/learning-basics";

/** Minimum score (inclusive) to earn a study-guide certification. */
export const CERTIFICATION_PASS_PERCENT = 70;

export type CertificationKind = "course_basics" | "course_advanced" | "study_exam";

export type CertificationDefinition = {
  id: number;
  slug: string;
  kind: CertificationKind;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  badge: string;
  prerequisites: string[];
  skills: string[];
};

export const CERTIFICATIONS: CertificationDefinition[] = [
  {
    id: 1,
    slug: "certified-investment-fundamentals",
    kind: "course_basics",
    title: "Certified Investment Fundamentals",
    description:
      "Awarded when you finish every lesson in Market Basics. Shows you have completed the full beginner track—goals, risk and return, core asset types, and building a first portfolio.",
    level: "Beginner",
    badge: "/investment-fundamentals-certificate-badge.jpg",
    prerequisites: ["Complete all lessons on Market Basics (watch each video to the end)"],
    skills: ["Investing basics", "Risk vs return", "Asset classes", "Simple portfolio planning"],
  },
  {
    id: 2,
    slug: "advanced-portfolio-manager",
    kind: "course_advanced",
    title: "Advanced Portfolio Manager",
    description:
      "Awarded when you complete the entire Advanced Strategies track—all four videos, including the expert lessons after the unlock gate.",
    level: "Advanced",
    badge: "/portfolio-manager-certificate-badge.jpg",
    prerequisites: ["Complete all lessons on Advanced Strategies (all four courses at 100%)"],
    skills: ["Technical & options context", "Systematic ideas", "Alternative sleeves"],
  },
  {
    id: 3,
    slug: "financial-risk-analyst",
    kind: "study_exam",
    title: "Financial Risk Analyst",
    description:
      "Prepare with a focused study video, then pass a multiple-choice exam (70% or higher). Validates core ideas in market, credit, liquidity, and operational risk at a practical level.",
    level: "Intermediate",
    badge: "/risk-analyst-certificate-badge.jpg",
    prerequisites: ["Watch every study video to 100%", "Score 70% or more on the certification exam"],
    skills: ["Risk types", "Volatility", "Diversification", "Scenario thinking"],
  },
  {
    id: 4,
    slug: "technical-analysis-expert",
    kind: "study_exam",
    title: "Technical Analysis Expert",
    description:
      "Study session plus MCQ exam. Earn the certificate by finishing the prep video and scoring at least 70%—chart reading, trends, and how indicators fit a decision process.",
    level: "Advanced",
    badge: "/technical-analysis-certificate-badge.jpg",
    prerequisites: ["Watch every study video to 100%", "Score 70% or more on the certification exam"],
    skills: ["Trends", "Support & resistance", "Volume", "Indicator literacy"],
  },
  {
    id: 5,
    slug: "cryptocurrency-specialist",
    kind: "study_exam",
    title: "Cryptocurrency Specialist",
    description:
      "Video preparation followed by an exam. Demonstrates foundational knowledge of digital assets, custody, and risks—certificate issued only on a passing score (70%+).",
    level: "Intermediate",
    badge: "/cryptocurrency-specialist-certificate-badge.jpg",
    prerequisites: ["Watch every study video to 100%", "Score 70% or more on the certification exam"],
    skills: ["Blockchain basics", "Wallets & custody", "Volatility", "Security habits"],
  },
  {
    id: 6,
    slug: "retirement-planning-advisor",
    kind: "study_exam",
    title: "Retirement Planning Advisor",
    description:
      "Prep video and timed-style MCQ test. Covers saving rates, tax-advantaged accounts, and long horizons—unlock the exam after the video is fully watched; pass at 70% to certify.",
    level: "Intermediate",
    badge: "/retirement-planning-certificate-badge.jpg",
    prerequisites: ["Watch every study video to 100%", "Score 70% or more on the certification exam"],
    skills: ["Compounding", "401(k) / IRA concepts", "Withdrawal thinking", "Goal planning"],
  },
];

/**
 * One embeddable clip in a certification study track.
 * Add more entries to `videos` on the matching {@link CERTIFICATION_STUDY_TRACKS} item.
 */
export type CertificationStudyVideo = {
  /**
   * Stable id unique within this certification (used in localStorage).
   * Use short kebab-case, e.g. `intro`, `module-2`.
   */
  videoSlug: string;
  title: string;
  description: string;
  /**
   * YouTube **video id** (11 chars) or full/short URL — same rules as Market Basics.
   * Prefer id; use {@link youtubeUrl} if you paste a link from the browser.
   */
  youtubeVideoId: string;
  youtubeUrl?: string;
  /** Used to estimate resume position from saved % */
  estimatedDurationSeconds: number;
};

/**
 * All study clips for one exam-based certification (`certSlug` matches {@link CERTIFICATIONS} `slug`).
 * The exam unlocks only after **every** video here is watched to 100%.
 */
export type CertificationStudyTrack = {
  certSlug: string;
  /** Shown at the top of the study dialog */
  sectionTitle: string;
  sectionDescription: string;
  videos: CertificationStudyVideo[];
};

/**
 * Study content for the four exam-based certifications.
 *
 * ### Adding YouTube videos
 * 1. Find the track with the same `certSlug` as the certificate.
 * 2. Append to `videos` (or add a second track only if it is a separate cert — one track per cert).
 * 3. Set `videoSlug` (unique per cert), `title`, `youtubeVideoId` (or `youtubeUrl`), and `estimatedDurationSeconds`.
 */
export const CERTIFICATION_STUDY_TRACKS: CertificationStudyTrack[] = [
  {
    certSlug: "financial-risk-analyst",
    sectionTitle: "Financial Risk Analyst — study pack",
    sectionDescription:
      "Watch each video to the end. Progress is saved per video; the exam unlocks when all are at 100%.",
    videos: [
      {
        videoSlug: "risk-essentials",
        title: "Risk essentials for investors",
        description:
          "How risk shows up in portfolios and why diversification and horizon matter.",
        youtubeVideoId: "jfaABy0E6r4",
        estimatedDurationSeconds: 800,
      },
      /* Add more clips for this cert, e.g.:
      {
        videoSlug: "deep-dive",
        title: "Your second video title",
        description: "Short blurb shown in the study dialog.",
        youtubeVideoId: "xxxxxxxxxxx",
        // youtubeUrl: "https://www.youtube.com/watch?v=xxxxxxxxxxx",
        estimatedDurationSeconds: 600,
      },
      */
    ],
  },
  {
    certSlug: "technical-analysis-expert",
    sectionTitle: "Technical Analysis Expert — study pack",
    sectionDescription: "Complete all videos below before taking the exam.",
    videos: [
      {
        videoSlug: "ta-primer",
        title: "Technical analysis primer",
        description: "Charts, trends, and reading price action before you sit the exam.",
        youtubeVideoId: "ttPGkFAROWk",
        estimatedDurationSeconds: 6660,
      },
    ],
  },
  {
    certSlug: "cryptocurrency-specialist",
    sectionTitle: "Cryptocurrency Specialist — study pack",
    sectionDescription: "Complete all videos below before taking the exam.",
    videos: [
      {
        videoSlug: "digital-assets-overview",
        title: "Digital assets overview",
        description: "Foundations of crypto markets, wallets, and common risks.",
        youtubeVideoId: "2ByOXdddmDM",
        estimatedDurationSeconds: 14400,
      },
    ],
  },
  {
    certSlug: "retirement-planning-advisor",
    sectionTitle: "Retirement Planning Advisor — study pack",
    sectionDescription: "Complete all videos below before taking the exam.",
    videos: [
      {
        videoSlug: "retirement-fundamentals",
        title: "Retirement saving fundamentals",
        description: "Long-term saving, accounts, and staying on track toward retirement goals.",
        youtubeVideoId: "pZNnueqfj_A",
        estimatedDurationSeconds: 660,
      },
    ],
  },
];

/** localStorage segment key: cert slug + video slug (do not change format without a migration). */
export function certStudySegmentKey(certSlug: string, videoSlug: string): string {
  return `${certSlug}::${videoSlug}`;
}

export function certificationStudyVideoId(video: CertificationStudyVideo): string {
  const fromUrl = video.youtubeUrl ? parseBasicsYoutubeInput(video.youtubeUrl) : "";
  if (fromUrl) return fromUrl;
  return parseBasicsYoutubeInput(video.youtubeVideoId) || video.youtubeVideoId;
}

export type CertificationStudyRecord = {
  watchPercent: number;
  secondsEngaged: number;
  startedAt: string | null;
  completedAt: string | null;
};

function migrateLegacyCertificationStudyKeys(
  map: Record<string, CertificationStudyRecord>
): Record<string, CertificationStudyRecord> {
  const out = { ...map };
  for (const track of CERTIFICATION_STUDY_TRACKS) {
    const legacy = out[track.certSlug];
    if (!legacy || track.videos.length === 0) continue;
    const first = track.videos[0];
    const k = certStudySegmentKey(track.certSlug, first.videoSlug);
    if (out[k] === undefined) {
      out[k] = legacy;
    }
    delete out[track.certSlug];
  }
  return out;
}

export function studyTrackByCertSlug(certSlug: string): CertificationStudyTrack | undefined {
  return CERTIFICATION_STUDY_TRACKS.find((t) => t.certSlug === certSlug);
}

const STUDY_STORAGE_KEY = "fyp-certifications-study-v1";

export function loadCertificationStudyProgress(): Record<string, CertificationStudyRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STUDY_STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, CertificationStudyRecord>;
    const base = o && typeof o === "object" ? o : {};
    const migrated = migrateLegacyCertificationStudyKeys(base);
    if (JSON.stringify(migrated) !== JSON.stringify(base)) {
      saveCertificationStudyProgress(migrated);
    }
    return migrated;
  } catch {
    return {};
  }
}

export function saveCertificationStudyProgress(all: Record<string, CertificationStudyRecord>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(all));
}

function emptyStudyRecord(): CertificationStudyRecord {
  return {
    watchPercent: 0,
    secondsEngaged: 0,
    startedAt: null,
    completedAt: null,
  };
}

export function upsertCertificationStudySegment(
  certSlug: string,
  videoSlug: string,
  patch: Partial<CertificationStudyRecord>
) {
  const key = certStudySegmentKey(certSlug, videoSlug);
  const all = loadCertificationStudyProgress();
  const prev = all[key] ?? emptyStudyRecord();
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
  all[key] = {
    watchPercent,
    secondsEngaged: patch.secondsEngaged ?? prev.secondsEngaged,
    startedAt,
    completedAt,
  };
  saveCertificationStudyProgress(all);
}

export function addCertificationStudyEngagedSeconds(
  certSlug: string,
  videoSlug: string,
  deltaSeconds: number
) {
  if (deltaSeconds <= 0) return;
  const key = certStudySegmentKey(certSlug, videoSlug);
  const all = loadCertificationStudyProgress();
  const prev = all[key] ?? emptyStudyRecord();
  all[key] = {
    ...prev,
    secondsEngaged: Math.round(prev.secondsEngaged + deltaSeconds),
    startedAt: prev.startedAt ?? new Date().toISOString(),
  };
  saveCertificationStudyProgress(all);
}

/** Average watch % across all videos in the track (UI progress bar). */
export function certStudyTrackProgressPercent(
  certSlug: string,
  studyMap: Record<string, CertificationStudyRecord>
): number {
  const track = studyTrackByCertSlug(certSlug);
  if (!track || track.videos.length === 0) return 0;
  const sum = track.videos.reduce((s, v) => {
    const key = certStudySegmentKey(certSlug, v.videoSlug);
    return s + (studyMap[key]?.watchPercent ?? 0);
  }, 0);
  return Math.round(sum / track.videos.length);
}

/** True when every video in the track has been watched to the end (100%). */
export function isCertStudyPrepComplete(
  certSlug: string,
  studyMap: Record<string, CertificationStudyRecord>
): boolean {
  const track = studyTrackByCertSlug(certSlug);
  if (!track || track.videos.length === 0) return false;
  return track.videos.every((v) => {
    const key = certStudySegmentKey(certSlug, v.videoSlug);
    return (studyMap[key]?.watchPercent ?? 0) >= 100;
  });
}

export type CertificationExamRecord = {
  passed: boolean;
  passedAt: string | null;
  bestScore: number;
  attempts: number;
  lastScore: number | null;
  lastAttemptAt: string | null;
};

const EXAM_STORAGE_KEY = "fyp-certifications-exam-v1";

function emptyExamRecord(): CertificationExamRecord {
  return {
    passed: false,
    passedAt: null,
    bestScore: 0,
    attempts: 0,
    lastScore: null,
    lastAttemptAt: null,
  };
}

export function loadCertificationExamProgress(): Record<string, CertificationExamRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(EXAM_STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, CertificationExamRecord>;
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

export function saveCertificationExamProgress(all: Record<string, CertificationExamRecord>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(all));
}

/**
 * Record one graded attempt. Updates pass state if score meets {@link CERTIFICATION_PASS_PERCENT}.
 */
export function recordCertificationExamAttempt(certSlug: string, scorePercent: number): CertificationExamRecord {
  const all = loadCertificationExamProgress();
  const prev = all[certSlug] ?? emptyExamRecord();
  const now = new Date().toISOString();
  const passed = scorePercent >= CERTIFICATION_PASS_PERCENT;
  const next: CertificationExamRecord = {
    passed: prev.passed || passed,
    passedAt: prev.passedAt ?? (passed ? now : null),
    bestScore: Math.max(prev.bestScore, scorePercent),
    attempts: prev.attempts + 1,
    lastScore: scorePercent,
    lastAttemptAt: now,
  };
  all[certSlug] = next;
  saveCertificationExamProgress(all);
  return next;
}

export function certificationBySlug(slug: string): CertificationDefinition | undefined {
  return CERTIFICATIONS.find((c) => c.slug === slug);
}

// —— Course completion (reads sibling tracks) ——

export function basicsCourseProgressPercent(
  basicsMap: Record<string, { watchPercent?: number }>
): number {
  if (BASICS_LESSONS.length === 0) return 0;
  const sum = BASICS_LESSONS.reduce((s, l) => s + (basicsMap[l.slug]?.watchPercent ?? 0), 0);
  return Math.round(sum / BASICS_LESSONS.length);
}

export function isBasicsCertificateEarned(
  basicsMap: Record<string, { watchPercent?: number }>
): boolean {
  return BASICS_LESSONS.every((l) => (basicsMap[l.slug]?.watchPercent ?? 0) >= 100);
}

export function advancedCourseProgressPercent(
  advancedMap: Record<string, { watchPercent?: number }>
): number {
  if (ADVANCED_LESSONS.length === 0) return 0;
  const sum = ADVANCED_LESSONS.reduce((s, l) => s + (advancedMap[l.slug]?.watchPercent ?? 0), 0);
  return Math.round(sum / ADVANCED_LESSONS.length);
}

export function isAdvancedCertificateEarned(
  advancedMap: Record<string, { watchPercent?: number }>
): boolean {
  return ADVANCED_LESSONS.every((l) => (advancedMap[l.slug]?.watchPercent ?? 0) >= 100);
}

export function basicsCertificateEarnedDate(
  basicsMap: Record<string, { watchPercent?: number; completedAt?: string | null }>
): string | null {
  if (!isBasicsCertificateEarned(basicsMap)) return null;
  let latest: string | null = null;
  for (const l of BASICS_LESSONS) {
    const ca = basicsMap[l.slug]?.completedAt ?? null;
    if (ca && (!latest || ca > latest)) latest = ca;
  }
  return latest;
}

export function advancedCertificateEarnedDate(
  advancedMap: Record<string, { watchPercent?: number; completedAt?: string | null }>
): string | null {
  if (!isAdvancedCertificateEarned(advancedMap)) return null;
  let latest: string | null = null;
  for (const l of ADVANCED_LESSONS) {
    const ca = advancedMap[l.slug]?.completedAt ?? null;
    if (ca && (!latest || ca > latest)) latest = ca;
  }
  return latest;
}

// —— Exam questions ——

export type CertificationExamQuestion = {
  id: string;
  prompt: string;
  options: string[];
  /** Index of correct option in `options`. */
  correctIndex: number;
};

const EXAM_QUESTIONS: Record<string, CertificationExamQuestion[]> = {
  "financial-risk-analyst": [
    {
      id: "fra-1",
      prompt: "In investing, diversification primarily aims to:",
      options: [
        "Guarantee a profit every year",
        "Reduce exposure to any single source of loss",
        "Eliminate all forms of risk",
        "Maximize short-term trading gains",
      ],
      correctIndex: 1,
    },
    {
      id: "fra-2",
      prompt: "Volatility is best described as:",
      options: [
        "A measure of how prices fluctuate over time",
        "The same as a permanent loss of capital",
        "Only relevant for bonds",
        "Fixed for all stocks",
      ],
      correctIndex: 0,
    },
    {
      id: "fra-3",
      prompt: "Liquidity risk refers to:",
      options: [
        "The chance you cannot buy or sell quickly without moving the price much",
        "The risk of inflation only",
        "Currency exchange fees only",
        "Tax penalties on withdrawals",
      ],
      correctIndex: 0,
    },
    {
      id: "fra-4",
      prompt: "A longer time horizon often allows investors to:",
      options: [
        "Ignore risk entirely",
        "Take more equity risk because there is time to recover from drawdowns",
        "Avoid all fees",
        "Guarantee beating inflation",
      ],
      correctIndex: 1,
    },
    {
      id: "fra-5",
      prompt: "Concentration in one stock increases:",
      options: [
        "Diversification benefit",
        "Idiosyncratic (company-specific) risk",
        "FDIC insurance",
        "Bond coupon payments",
      ],
      correctIndex: 1,
    },
  ],
  "technical-analysis-expert": [
    {
      id: "tae-1",
      prompt: "An uptrend is often described as a series of:",
      options: [
        "Lower highs and lower lows",
        "Higher highs and higher lows",
        "Flat prices only",
        "Random labels with no pattern",
      ],
      correctIndex: 1,
    },
    {
      id: "tae-2",
      prompt: "Support on a chart is typically:",
      options: [
        "A price area where buying interest has appeared before",
        "The company’s revenue",
        "A dividend yield",
        "The P/E ratio",
      ],
      correctIndex: 0,
    },
    {
      id: "tae-3",
      prompt: "Volume can help technical readers by:",
      options: [
        "Confirming whether moves have broad participation",
        "Replacing the need for risk management",
        "Guaranteeing future prices",
        "Removing all false signals",
      ],
      correctIndex: 0,
    },
    {
      id: "tae-4",
      prompt: "A moving average is generally used to:",
      options: [
        "Smooth price data and highlight direction",
        "File taxes",
        "Compute bond duration only",
        "Measure credit spreads only",
      ],
      correctIndex: 0,
    },
    {
      id: "tae-5",
      prompt: "Resistance is best thought of as:",
      options: [
        "A zone where selling pressure has capped price advances",
        "A legal contract",
        "A type of mutual fund",
        "The same as diversification",
      ],
      correctIndex: 0,
    },
  ],
  "cryptocurrency-specialist": [
    {
      id: "cs-1",
      prompt: "A private key in crypto should be:",
      options: [
        "Shared publicly for transparency",
        "Kept secret and backed up safely",
        "Stored only on exchange banners",
        "Ignored if you use a hot wallet",
      ],
      correctIndex: 1,
    },
    {
      id: "cs-2",
      prompt: "Blockchain ledgers are often characterized as:",
      options: [
        "Centralized spreadsheets only one bank edits",
        "Distributed records updated by network rules",
        "Impossible to verify",
        "Identical to a stock index",
      ],
      correctIndex: 1,
    },
    {
      id: "cs-3",
      prompt: "High volatility in crypto markets means:",
      options: [
        "Prices can swing widely in short periods",
        "There is no risk",
        "Returns are always positive",
        "Regulation is impossible",
      ],
      correctIndex: 0,
    },
    {
      id: "cs-4",
      prompt: "Cold storage usually refers to:",
      options: [
        "Keeping keys offline to reduce remote theft risk",
        "Trading only in winter",
        "Using only credit cards",
        "Storing passwords in browser history",
      ],
      correctIndex: 0,
    },
    {
      id: "cs-5",
      prompt: "Using only funds you can afford to lose is advice aimed at:",
      options: [
        "Sizing risk to your personal situation",
        "Guaranteeing profits",
        "Avoiding all taxes",
        "Eliminating blockchain fees",
      ],
      correctIndex: 0,
    },
  ],
  "retirement-planning-advisor": [
    {
      id: "rp-1",
      prompt: "Compound growth is most powerful when:",
      options: [
        "You start early and contribute consistently",
        "You wait until the last year before retiring",
        "You avoid all equities forever",
        "You skip employer matches",
      ],
      correctIndex: 0,
    },
    {
      id: "rp-2",
      prompt: "A 401(k)-style account is primarily for:",
      options: [
        "Day-trading crypto with leverage",
        "Long-term retirement savings, often with tax advantages",
        "Paying monthly rent only",
        "Short vacations every quarter",
      ],
      correctIndex: 1,
    },
    {
      id: "rp-3",
      prompt: "Asset allocation before retirement often balances:",
      options: [
        "Growth assets and more stable assets for the time horizon",
        "Only one stock forever",
        "Only cash under a mattress",
        "Random picks without goals",
      ],
      correctIndex: 0,
    },
    {
      id: "rp-4",
      prompt: "Required minimum distributions (conceptually) remind savers that:",
      options: [
        "Tax-deferred accounts eventually have withdrawal rules",
        "Bonds never mature",
        "Stocks cannot be sold",
        "Inflation does not exist",
      ],
      correctIndex: 0,
    },
    {
      id: "rp-5",
      prompt: "A realistic savings rate should reflect:",
      options: [
        "Income, goals, and how long until you need the money",
        "Only celebrity portfolios",
        "The latest headline only",
        "Zero emergency fund",
      ],
      correctIndex: 0,
    },
  ],
};

export function getExamQuestionsForCert(certSlug: string): CertificationExamQuestion[] {
  return EXAM_QUESTIONS[certSlug] ?? [];
}

/** Clears study video progress and exam results for certification study tracks (local only). */
export function resetCertificationStudyAndExams(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STUDY_STORAGE_KEY);
  localStorage.removeItem(EXAM_STORAGE_KEY);
}
