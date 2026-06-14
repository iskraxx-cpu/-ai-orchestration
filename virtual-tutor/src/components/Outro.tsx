import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";

export const Outro: React.FC<{
  title: string;
  bullets: readonly string[];
}> = ({ title, bullets }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, ${theme.colors.bgAlt}, ${theme.colors.bg})`,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 160px",
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        style={{
          transform: `translateY(${interpolate(titleIn, [0, 1], [40, 0])}px)`,
          opacity: titleIn,
          color: theme.colors.accent,
          fontSize: 30,
          letterSpacing: 6,
          textTransform: "uppercase",
          marginBottom: 28,
        }}
      >
        {title}
      </div>
      {bullets.map((b, i) => {
        const appear = spring({
          frame: frame - 16 - i * 12,
          fps,
          config: { damping: 200 },
        });
        return (
          <div
            key={b}
            style={{
              transform: `translateX(${interpolate(appear, [0, 1], [-40, 0])}px)`,
              opacity: appear,
              display: "flex",
              alignItems: "center",
              gap: 22,
              marginBottom: 26,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: theme.colors.accent,
              }}
            />
            <div style={{ color: theme.colors.text, fontSize: 48, fontWeight: 600 }}>
              {b}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
