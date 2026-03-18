import React from "react";
import { Chip } from "@mui/material";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { FRIENDSHIP_STATUS } from "../../constants/friendsConstants";

const STATUS_COLOR_MAP = {
  [FRIENDSHIP_STATUS.ACCEPTED]: "success",
  [FRIENDSHIP_STATUS.PENDING]: "warning",
  [FRIENDSHIP_STATUS.REJECTED]: "error",
  [FRIENDSHIP_STATUS.BLOCKED]: "error",
};

const StatusChip = ({ status, size = "small" }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const colorMap = {
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };
  const chipColor = colorMap[STATUS_COLOR_MAP[status]] || colors.secondary_text;
  const labelKey = `friends.status.${status}`;
  const translated = t(labelKey);
  const label =
    translated !== labelKey
      ? translated
      : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <Chip
      label={label}
      size={size}
      variant="outlined"
      sx={{
        borderColor: chipColor,
        color: chipColor,
        "& .MuiChip-label": { color: chipColor },
      }}
    />
  );
};

export default StatusChip;
