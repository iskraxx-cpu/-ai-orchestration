import { Composition } from "remotion";
import { Lesson, LESSON_DURATION } from "./Lesson";
import { FPS } from "./lesson-data";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Lesson"
        component={Lesson}
        durationInFrames={LESSON_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
