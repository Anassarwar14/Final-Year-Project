export type StoredQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type StoredQuiz = {
  questions: StoredQuizQuestion[];
};

export type PublicQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

export function parseStoredQuiz(raw: unknown): StoredQuiz {
  if (!raw || typeof raw !== "object") {
    return { questions: [] };
  }
  const q = (raw as { questions?: unknown }).questions;
  if (!Array.isArray(q)) {
    return { questions: [] };
  }
  const questions: StoredQuizQuestion[] = [];
  for (const item of q) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : "";
    const prompt = typeof o.prompt === "string" ? o.prompt : "";
    const options = Array.isArray(o.options) ? o.options.filter((x): x is string => typeof x === "string") : [];
    const correctIndex = typeof o.correctIndex === "number" ? o.correctIndex : -1;
    if (!id || !prompt || options.length < 2 || correctIndex < 0 || correctIndex >= options.length) {
      continue;
    }
    questions.push({ id, prompt, options, correctIndex });
  }
  return { questions };
}

export function toPublicQuiz(quiz: StoredQuiz): { questions: PublicQuizQuestion[] } {
  return {
    questions: quiz.questions.map(({ id, prompt, options }) => ({ id, prompt, options })),
  };
}

export function gradeQuiz(
  quiz: StoredQuiz,
  answers: Record<string, number>
): { ok: true } | { ok: false; reason: string } {
  if (quiz.questions.length === 0) {
    return { ok: true };
  }
  for (const q of quiz.questions) {
    const picked = answers[q.id];
    if (typeof picked !== "number" || picked !== q.correctIndex) {
      return { ok: false, reason: "One or more answers are incorrect." };
    }
  }
  return { ok: true };
}
