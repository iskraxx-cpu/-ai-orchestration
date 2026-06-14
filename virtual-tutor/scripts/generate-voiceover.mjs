// ─────────────────────────────────────────────────────────────────────────────
// Voiceover generator: turns each lesson's `narration` (plain text) into a
// spoken audio track + caption timings that are perfectly synced to the audio.
//
//   node scripts/generate-voiceover.mjs            # all lessons
//   node scripts/generate-voiceover.mjs Lesson01   # one lesson
//
// TTS engine is pluggable. Default is espeak-ng (offline, reproducible, works
// without network). To use a higher-quality / cloud TTS, replace `synthLine`
// with a call to that provider — the rest of the pipeline (timing, concat,
// captions) stays the same.
// ─────────────────────────────────────────────────────────────────────────────

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(root, "src/lessons.json"), "utf8"));

// Tuning for the offline engine.
const VOICE = "ru";
const WORDS_PER_MIN = 165;
const GAP_SEC = 0.35; // pause inserted between caption lines
const SAMPLE_RATE = 22050;

const ffprobeDuration = (file) =>
  parseFloat(
    execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      file,
    ]).toString().trim(),
  );

// Synthesize one line of text to a wav file. Swap this function to change TTS.
const synthLine = (text, outWav) => {
  execFileSync("espeak-ng", [
    "-v", VOICE,
    "-s", String(WORDS_PER_MIN),
    "-w", outWav,
    text,
  ]);
};

const makeSilence = (seconds, outWav) => {
  execFileSync("ffmpeg", [
    "-y", "-f", "lavfi",
    "-i", `anullsrc=r=${SAMPLE_RATE}:cl=mono`,
    "-t", seconds.toFixed(3),
    outWav,
  ], { stdio: "ignore" });
};

const generateLesson = (lesson) => {
  const tmp = join(root, ".tmp-voiceover", lesson.id);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });

  const gapWav = join(tmp, "gap.wav");
  makeSilence(GAP_SEC, gapWav);

  const captions = [];
  const concatParts = [];
  let cursor = 0; // seconds

  lesson.narration.forEach((text, i) => {
    const lineWav = join(tmp, `line_${i}.wav`);
    synthLine(text, lineWav);
    const dur = ffprobeDuration(lineWav);

    captions.push({
      fromSec: round(cursor),
      toSec: round(cursor + dur),
      text,
    });
    concatParts.push(lineWav);
    cursor += dur;

    if (i < lesson.narration.length - 1) {
      concatParts.push(gapWav);
      cursor += GAP_SEC;
    }
  });

  // Concatenate all parts into one track and encode to mp3.
  const listFile = join(tmp, "concat.txt");
  writeFileSync(
    listFile,
    concatParts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n"),
  );

  const outDir = join(root, "public", "voiceover");
  mkdirSync(outDir, { recursive: true });
  const outMp3 = join(outDir, `${lesson.id}.mp3`);
  execFileSync("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0",
    "-i", listFile,
    "-codec:a", "libmp3lame", "-q:a", "4",
    outMp3,
  ], { stdio: "ignore" });

  rmSync(tmp, { recursive: true, force: true });

  const durationSec = round(ffprobeDuration(outMp3));
  console.log(`  ${lesson.id}: ${durationSec}s, ${captions.length} captions`);

  return {
    durationSec,
    audio: `voiceover/${lesson.id}.mp3`,
    captions,
  };
};

const round = (n) => Math.round(n * 1000) / 1000;

// ── main ─────────────────────────────────────────────────────────────────────
const only = process.argv[2];
const targets = only
  ? catalog.lessons.filter((l) => l.id === only)
  : catalog.lessons;

if (targets.length === 0) {
  console.error(`No lesson matched "${only}".`);
  process.exit(1);
}

const generatedPath = join(root, "src/generated/voiceovers.json");
const generated = existsSync(generatedPath)
  ? JSON.parse(readFileSync(generatedPath, "utf8"))
  : {};

console.log("Generating voiceover with espeak-ng…");
for (const lesson of targets) {
  generated[lesson.id] = generateLesson(lesson);
}

writeFileSync(generatedPath, JSON.stringify(generated, null, 2) + "\n");
console.log(`Wrote ${generatedPath}`);
