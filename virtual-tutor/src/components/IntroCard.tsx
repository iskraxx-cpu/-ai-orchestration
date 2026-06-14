import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";

export const IntroCard: React.FC<{
  title: string;
  subtitle: string;
}> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 200 } });
  const subtitleOpacity = interpolate(frame, [12, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Fade the whole card out at the end for a clean cut into the presenter.
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        background: `radial-gradient(circle at 50% 35%, ${theme.colors.bgAlt}, ${theme.colors.bg})`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        style={{
          color: theme.colors.accent,
          fontSize: 30,
          letterSpacing: 8,
          textTransform: "uppercase",
          marginBottom: 24,
          opacity: subtitleOpacity,
        }}
      >
        {theme.course.name}
      </div>
      <div
        style={{
          transform: `scale(${titleScale})`,
          color: theme.colors.text,
          fontSize: 96,
          fontWeight: 800,
          textAlign: "center",
          maxWidth: 1400,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          opacity: subtitleOpacity,
          color: theme.colors.textMuted,
          fontSize: 40,
          marginTop: 28,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
