export const FRIEND_TRANSITION = "background-color 200ms ease, box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease";

export const friendRowSx = (colors, { selected = false, interactive = true } = {}) => ({
  display: "flex",
  alignItems: "center",
  gap: 2,
  p: 2,
  mb: 1,
  bgcolor: colors.card_bg,
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  border: `1px solid ${colors.border_color}`,
  borderLeft: selected ? `3px solid ${colors.primary_accent}` : "3px solid transparent",
  transition: FRIEND_TRANSITION,
  ...(interactive && {
    cursor: "pointer",
    "&:hover": {
      bgcolor: colors.hover_bg,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
    "&:focus-visible": {
      outline: `2px solid ${colors.primary_accent}`,
      outlineOffset: 2,
    },
  }),
});

export const friendPanelSx = (colors) => ({
  bgcolor: colors.card_bg,
  borderRadius: "16px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  border: `1px solid ${colors.border_color}`,
  overflow: "hidden",
});

export const friendSectionHeaderSx = (colors) => ({
  color: colors.primary_accent,
  mb: 1.5,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 1,
  "&::before": {
    content: '""',
    width: 3,
    height: 16,
    borderRadius: 2,
    bgcolor: colors.primary_accent,
    flexShrink: 0,
  },
});

export const friendListContainerSx = (colors) => ({
  bgcolor: colors.surface_bg || colors.secondary_bg,
  borderRadius: "12px",
  border: `1px solid ${colors.border_color}`,
  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.04)",
  overflow: "hidden",
  "& > *:not(:last-child)": {
    borderBottom: `1px solid ${colors.border_color}`,
  },
});

export const friendStatMiniSx = (colors) => ({
  flex: 1,
  minWidth: 120,
  p: 2,
  bgcolor: colors.card_bg,
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  border: `1px solid ${colors.border_color}`,
  transition: FRIEND_TRANSITION,
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    transform: "translateY(-1px)",
  },
});

export const friendDiscoverCardSx = (colors) => ({
  bgcolor: colors.card_bg,
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  border: `1px solid ${colors.border_color}`,
  transition: FRIEND_TRANSITION,
  height: "100%",
  "&:hover": {
    bgcolor: colors.hover_bg,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    transform: "translateY(-2px)",
  },
});
