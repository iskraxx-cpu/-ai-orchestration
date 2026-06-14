// ─────────────────────────────────────────────────────────────────────────────
// Lesson definition — this is the single place you edit to author a new lesson.
//
// The "virtual human" is a realistic AI-generated clip placed in public/.
// Remotion assembles it into a structured lesson: intro → presenter talk
// (with captions) → b-roll key point → outro. Swap the clip + this data to
// produce a new lesson; the layout/branding stay consistent.
// ─────────────────────────────────────────────────────────────────────────────

export const FPS = 30;

export type Caption = {
  /** Seconds, relative to the start of the segment it belongs to. */
  fromSec: number;
  toSec: number;
  text: string;
};

export type PresenterClip = {
  /** File in public/ */
  src: string;
  /** Trim window into the source clip, in seconds. */
  startSec: number;
  endSec: number;
  /** Keep the clip's own audio (the presenter speaking). */
  withAudio: boolean;
};

export const lesson = {
  title: "Введение в оркестрацию AI-агентов",
  subtitle: "Урок 1 · Основы",
  presenterName: "Алина Ковач",
  presenterRole: "Ведущая курса",

  // The talking-head segment (your realistic AI presenter).
  presenter: {
    src: "presenter.mp4",
    startSec: 0,
    endSec: 8,
    withAudio: true,
  } satisfies PresenterClip,

  // Captions synced to the presenter segment (subtitles / accessibility).
  // Replace with the real transcript of the voiceover.
  presenterCaptions: [
    { fromSec: 0.0, toSec: 2.6, text: "Добро пожаловать на курс по оркестрации AI-агентов." },
    { fromSec: 2.6, toSec: 5.2, text: "Сегодня разберём, как агенты работают вместе." },
    { fromSec: 5.2, toSec: 8.0, text: "И почему координация важнее, чем одна большая модель." },
  ] satisfies Caption[],

  // B-roll segment with an on-screen key takeaway.
  broll: {
    src: "presenter.mp4",
    startSec: 8,
    endSec: 16,
    withAudio: false,
  } satisfies PresenterClip,

  brollKeyPoint: {
    label: "Ключевая мысль",
    text: "Хороший оркестратор — это не модель, а процесс: планирование, делегирование, проверка.",
  },

  // Outro recap bullets.
  outroTitle: "Что дальше",
  outroBullets: [
    "Роли агентов и зоны ответственности",
    "Передача контекста между агентами",
    "Проверка результата и обратная связь",
  ],
} as const;
