import React from "react";
import { IconButton } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * Navigates between selected expense cards while keeping count visible.
 */
function SelectionNavigator({ label, onNavigate, disablePrev, disableNext }) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!label) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "nowrap",
      }}
      title={t("cashflow.tooltips.selectionNavigator")}
    >
      <IconButton
        onClick={() => onNavigate("prev")}
        disabled={disablePrev}
        size="small"
        sx={{
          width: "28px",
          height: "28px",
          background: `${colors.primary_accent}15`,
          border: `1px solid ${colors.primary_accent}40`,
          color: colors.primary_accent,
          transition: "all 0.2s ease",
          "&:hover": {
            background: `${colors.primary_accent}25`,
            transform: "scale(1.1)",
          },
          "&:disabled": {
            background: `${colors.secondary_bg}`,
            border: `1px solid ${colors.border_color}`,
            color: colors.secondary_text,
            opacity: 0.6,
            cursor: "not-allowed",
          },
        }}
        title={t("cashflow.tooltips.previousSelected")}
        aria-label={t("cashflow.tooltips.previousSelected")}
      >
        <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: colors.primary_accent,
          background: `${colors.primary_accent}15`,
          border: `1px solid ${colors.primary_accent}40`,
          borderRadius: "20px",
          padding: "6px 16px",
          minWidth: "90px",
          textAlign: "center",
        }}
      >
        {label}
      </div>
      <IconButton
        onClick={() => onNavigate("next")}
        disabled={disableNext}
        size="small"
        sx={{
          width: "28px",
          height: "28px",
          background: `${colors.primary_accent}15`,
          border: `1px solid ${colors.primary_accent}40`,
          color: colors.primary_accent,
          transition: "all 0.2s ease",
          "&:hover": {
            background: `${colors.primary_accent}25`,
            transform: "scale(1.1)",
          },
          "&:disabled": {
            background: `${colors.secondary_bg}`,
            border: `1px solid ${colors.border_color}`,
            color: colors.secondary_text,
            opacity: 0.6,
            cursor: "not-allowed",
          },
        }}
        title={t("cashflow.tooltips.nextSelected")}
        aria-label={t("cashflow.tooltips.nextSelected")}
      >
        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </div>
  );
}

export default React.memo(SelectionNavigator);
