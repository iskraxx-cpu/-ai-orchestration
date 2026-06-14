import {
  AbsoluteFill,
  Loop,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import type { Caption, ClipTrim } from "../lessons";
import { Brand } from "./Brand";
import { Captions } from "./Captions";
import { LowerThird } from "./LowerThird";

// The realistic AI presenter talking. The trimmed clip is looped to cover the
// full narration length, with a lower-third + captions synced to the voiceover.
export const PresenterSegment: React.FC<{
  clip: ClipTrim;
  captions: Caption[];
  name: string;
  role: string;
}> = ({ clip, captions, name, role }) => {
  const { fps } = useVideoConfig();
  const clipFrames = Math.round((clip.endSec - clip.startSec) * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Loop durationInFrames={clipFrames}>
        <OffthreadVideo
          src={staticFile(clip.src)}
          trimBefore={Math.round(clip.startSec * fps)}
          trimAfter={Math.round(clip.endSec * fps)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Loop>
      <Brand />
      <LowerThird name={name} role={role} />
      {/* Captions use absolute (segment) time, so render outside the Loop. */}
      <Sequence>
        <Captions captions={captions} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
