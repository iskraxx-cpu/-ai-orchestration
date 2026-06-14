import { AbsoluteFill, Series } from "remotion";
import { BrollSegment } from "./components/BrollSegment";
import { IntroCard } from "./components/IntroCard";
import { Outro } from "./components/Outro";
import { PresenterSegment } from "./components/PresenterSegment";
import { FPS, lesson } from "./lesson-data";

// Segment durations (frames @ FPS). Presenter/b-roll match the trim windows.
export const INTRO_FRAMES = Math.round(2.5 * FPS);
export const PRESENTER_FRAMES = Math.round(
  (lesson.presenter.endSec - lesson.presenter.startSec) * FPS,
);
export const BROLL_FRAMES = Math.round(
  (lesson.broll.endSec - lesson.broll.startSec) * FPS,
);
export const OUTRO_FRAMES = Math.round(3 * FPS);

export const LESSON_DURATION =
  INTRO_FRAMES + PRESENTER_FRAMES + BROLL_FRAMES + OUTRO_FRAMES;

export const Lesson: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/*
        Optional voiceover (TTS): drop an mp3 into public/ and uncomment.
        External TTS services are blocked in this environment, so generate the
        audio offline (or with a reachable provider) and commit the file.

        <Audio src={staticFile("voiceover.mp3")} />
      */}
      <Series>
        <Series.Sequence durationInFrames={INTRO_FRAMES}>
          <IntroCard title={lesson.title} subtitle={lesson.subtitle} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={PRESENTER_FRAMES}>
          <PresenterSegment
            clip={lesson.presenter}
            captions={lesson.presenterCaptions}
            name={lesson.presenterName}
            role={lesson.presenterRole}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={BROLL_FRAMES}>
          <BrollSegment
            clip={lesson.broll}
            label={lesson.brollKeyPoint.label}
            text={lesson.brollKeyPoint.text}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={OUTRO_FRAMES}>
          <Outro title={lesson.outroTitle} bullets={lesson.outroBullets} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
