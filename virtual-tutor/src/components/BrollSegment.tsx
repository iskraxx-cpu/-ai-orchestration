import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ClipTrim } from "../lessons";
import { Brand } from "./Brand";
import { theme } from "../theme";

// B-roll with a key takeaway card. Darkened so text reads cleanly.
export const BrollSegment: React.FC<{
  clip: ClipTrim;
  label: string;
  text: string;
}> = ({ clip, label, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const y = interpolate(cardIn, [0, 1], [60, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile(clip.src)}
        trimBefore={Math.round(clip.startSec * fps)}
        trimAfter={Math.round(clip.endSec * fps)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Readability scrim */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(8,12,22,0.85) 0%, rgba(8,12,22,0.55) 45%, rgba(8,12,22,0) 75%)",
        }}
      />
      <Brand />
      <div
        style={{
          position: "absolute",
          left: 90,
          top: "50%",
          transform: `translateY(-50%) translateY(${y}px)`,
          opacity: cardIn,
          maxWidth: 820,
          fontFamily: theme.fontFamily,
        }}
      >
        <div
          style={{
            color: theme.colors.accent,
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: theme.colors.text,
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
