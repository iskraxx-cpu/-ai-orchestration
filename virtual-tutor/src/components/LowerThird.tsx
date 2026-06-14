import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export const LowerThird: React.FC<{
  name: string;
  role: string;
}> = ({ name, role }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide in shortly after the segment starts, slide out near the end.
  const enter = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  const x = interpolate(enter, [0, 1], [-420, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        bottom: 200,
        transform: `translateX(${x}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "18px 28px",
        borderLeft: `6px solid ${theme.colors.accent}`,
        background: theme.colors.captionBg,
        borderRadius: 8,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          color: theme.colors.text,
          fontSize: 44,
          fontWeight: 700,
          fontFamily: theme.fontFamily,
        }}
      >
        {name}
      </div>
      <div
        style={{
          color: theme.colors.accentSoft,
          fontSize: 26,
          fontWeight: 500,
          fontFamily: theme.fontFamily,
        }}
      >
        {role}
      </div>
    </div>
  );
};
