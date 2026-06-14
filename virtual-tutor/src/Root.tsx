import { Composition } from "remotion";
import { getLessonLayout, Lesson } from "./Lesson";
import { FPS, lessons } from "./lessons";

// One composition per lesson in the catalog. Add a lesson to lessons.json and
// it shows up here automatically.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {lessons.map((lesson) => (
        <Composition
          key={lesson.id}
          id={lesson.id}
          component={Lesson}
          durationInFrames={getLessonLayout(lesson).total}
          fps={FPS}
          width={1920}
          height={1080}
          defaultProps={{ lesson }}
        />
      ))}
    </>
  );
};
