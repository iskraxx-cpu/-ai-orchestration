// Centralized look & feel for the course. Tweak here to rebrand every lesson.
export const theme = {
  fontFamily:
    '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  colors: {
    bg: "#0b1220",
    bgAlt: "#111a2e",
    accent: "#38bdf8",
    accentSoft: "#7dd3fc",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    captionBg: "rgba(8, 12, 22, 0.72)",
  },
  // Course-wide identity shown in lower-thirds / corners.
  course: {
    name: "AI Orchestration Academy",
  },
} as const;
