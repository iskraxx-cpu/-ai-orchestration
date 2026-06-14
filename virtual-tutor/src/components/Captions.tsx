import { interpolate, useCurrentFrame } from "remotion";
import type { Caption } from "../lesson-data";
import { theme } from "../theme";

// Subtitle band driven by the caption list. The active caption is chosen by the
// current time within the segment (the parent <Sequence> rebases the frame).
export const Captions: React.FC<{
  captions: Caption[];
  fps: number;
}> = ({ captions, fps }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;

  const active = captions.find((c) => t >= c.fromSec && t < c.toSec);
  if (!active) {
    return null;
  }

  const localFrame = frame - active.fromSec * fps;
  const opacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 70,
        display: "flex",
        justifyContent: "center",
        padding: "0 160px",
      }}
    >
      <div
        style={{
          opacity,
          maxWidth: 1400,
          textAlign: "center",
          color: theme.colors.text,
          background: theme.colors.captionBg,
          padding: "16px 28px",
          borderRadius: 12,
          fontSize: 40,
          lineHeight: 1.3,
          fontWeight: 500,
          fontFamily: theme.fontFamily,
        }}
      >
        {active.text}
      </div>
    </div>
  );
};
