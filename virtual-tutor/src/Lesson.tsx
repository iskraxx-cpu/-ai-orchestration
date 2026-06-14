import { AbsoluteFill, Audio, Sequence, Series, staticFile } from "remotion";
import { BrollSegment } from "./components/BrollSegment";
import { IntroCard } from "./components/IntroCard";
import { Outro } from "./components/Outro";
import { PresenterSegment } from "./components/PresenterSegment";
import { FPS, getVoiceover, type LessonDef } from "./lessons";

const INTRO_SEC = 2.5;
const OUTRO_SEC = 3;
const PRESENTER_PAD_SEC = 0.6; // small tail after the voiceover ends
const BROLL_SEC = 8;

// Compute the frame layout for a lesson from its (generated) voiceover length.
export const getLessonLayout = (lesson: LessonDef) => {
  const vo = getVoiceover(lesson.id);
  const intro = Math.round(INTRO_SEC * FPS);
  // Presenter segment lasts as long as the narration (or a default if none yet).
  const narrationSec = vo.durationSec > 0 ? vo.durationSec : 8;
  const presenter = Math.round((narrationSec + PRESENTER_PAD_SEC) * FPS);
  const broll = Math.round(BROLL_SEC * FPS);
  const outro = Math.round(OUTRO_SEC * FPS);
  return {
    intro,
    presenter,
    broll,
    outro,
    total: intro + presenter + broll + outro,
  };
};

export const Lesson: React.FC<{ lesson: LessonDef }> = ({ lesson }) => {
  const layout = getLessonLayout(lesson);
  const vo = getVoiceover(lesson.id);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Series>
        <Series.Sequence durationInFrames={layout.intro}>
          <IntroCard title={lesson.title} subtitle={lesson.subtitle} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={layout.presenter}>
          {/* Narration voiceover plays over the talking-head segment. */}
          {vo.audio ? (
            <Sequence>
              <Audio src={staticFile(vo.audio)} />
            </Sequence>
          ) : null}
          <PresenterSegment
            clip={lesson.presenter}
            captions={vo.captions}
            name={lesson.presenterName}
            role={lesson.presenterRole}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={layout.broll}>
          <BrollSegment
            clip={lesson.broll}
            label={lesson.brollKeyPoint.label}
            text={lesson.brollKeyPoint.text}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={layout.outro}>
          <Outro title={lesson.outroTitle} bullets={lesson.outroBullets} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
