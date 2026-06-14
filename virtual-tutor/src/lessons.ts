// Typed view over the lesson catalog (single source of truth: lessons.json,
// shared with the voiceover generator script).
import catalog from "./lessons.json";
import generated from "./generated/voiceovers.json";

export type ClipTrim = {
  src: string;
  startSec: number;
  endSec: number;
};

export type LessonDef = {
  id: string;
  title: string;
  subtitle: string;
  presenterName: string;
  presenterRole: string;
  presenter: ClipTrim;
  narration: string[];
  broll: ClipTrim;
  brollKeyPoint: { label: string; text: string };
  outroTitle: string;
  outroBullets: string[];
};

export type Caption = { fromSec: number; toSec: number; text: string };

export type Voiceover = {
  /** Total spoken duration in seconds. */
  durationSec: number;
  /** Audio file in public/, or null if not generated yet. */
  audio: string | null;
  /** Captions auto-synced to the narration audio. */
  captions: Caption[];
};

export const FPS: number = catalog.fps;
export const lessons: LessonDef[] = catalog.lessons as LessonDef[];

const voiceovers = generated as Record<string, Voiceover | undefined>;

// Voiceover for a lesson. Falls back to an empty track (segment then uses a
// sensible default length) when `npm run voiceover` hasn't been run yet.
export const getVoiceover = (lessonId: string): Voiceover => {
  return (
    voiceovers[lessonId] ?? { durationSec: 0, audio: null, captions: [] }
  );
};
