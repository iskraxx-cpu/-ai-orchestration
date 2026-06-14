import { AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig } from "remotion";
import type { Caption, PresenterClip } from "../lesson-data";
import { Brand } from "./Brand";
import { Captions } from "./Captions";
import { LowerThird } from "./LowerThird";

// The realistic AI presenter talking. The source clip is trimmed to the
// talking window and overlaid with a lower-third + synced captions.
export const PresenterSegment: React.FC<{
  clip: PresenterClip;
  captions: Caption[];
  name: string;
  role: string;
}> = ({ clip, captions, name, role }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile(clip.src)}
        trimBefore={Math.round(clip.startSec * fps)}
        trimAfter={Math.round(clip.endSec * fps)}
        muted={!clip.withAudio}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Brand />
      <LowerThird name={name} role={role} />
      <Captions captions={captions} fps={fps} />
    </AbsoluteFill>
  );
};
