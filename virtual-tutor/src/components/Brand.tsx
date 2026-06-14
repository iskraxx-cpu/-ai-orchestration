import { theme } from "../theme";

// Small persistent course identity in the top-right corner.
export const Brand: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        right: 64,
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: theme.colors.accent,
          boxShadow: `0 0 16px ${theme.colors.accent}`,
        }}
      />
      <div style={{ color: theme.colors.text, fontSize: 24, fontWeight: 600 }}>
        {theme.course.name}
      </div>
    </div>
  );
};
