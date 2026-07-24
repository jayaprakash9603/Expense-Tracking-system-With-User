import React, { isValidElement } from "react";
import { Box, Typography, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import { useTheme } from "../hooks/useTheme";
import { getFunctionalIcon } from "../utils/ui/iconMapping";

const SIZE_TOKENS = {
  sm: {
    minHeight: 140,
    icon: 24,
    wrap: 48,
    title: "1.0625rem",
    sub: "0.875rem",
    gap: 1,
    px: 2,
  },
  md: {
    minHeight: 180,
    icon: 28,
    wrap: 56,
    title: "1.1875rem",
    sub: "0.9375rem",
    gap: 1.25,
    px: 2,
  },
  lg: {
    minHeight: 260,
    icon: 32,
    wrap: 64,
    title: "1.3125rem",
    sub: "1rem",
    gap: 1.5,
    px: 3,
  },
  fill: {
    minHeight: 280,
    icon: 36,
    wrap: 72,
    title: "1.4375rem",
    sub: "1.0625rem",
    gap: 1.75,
    px: 4,
  },
};

const renderIconNode = (icon, iconKey, iconSize, iconColor) => {
  if (icon != null) {
    if (isValidElement(icon)) return icon;
    if (typeof icon === "function") {
      const IconComponent = icon;
      return <IconComponent sx={{ fontSize: iconSize, color: iconColor }} />;
    }
    if (typeof icon === "string") {
      return getFunctionalIcon(icon, { sx: { fontSize: iconSize, color: iconColor } });
    }
  }
  if (iconKey) {
    return getFunctionalIcon(iconKey, { sx: { fontSize: iconSize, color: iconColor } });
  }
  return (
    <InsertChartOutlinedIcon sx={{ fontSize: iconSize, color: iconColor }} />
  );
};

const NoDataPlaceholder = ({
  message = "No data available",
  subMessage,
  height,
  onRetry,
  actionLabel = "Retry",
  icon,
  iconKey = "chart",
  dense = false,
  size = "md",
  fullWidth = false,
  minWidth,
  maxWidth,
  style,
  iconSize,
  messageColor,
  subMessageColor,
  iconColor,
  iconOpacity,
  bordered = false,
  variant = "elevated",
}) => {
  const { colors } = useTheme();
  const tokens = SIZE_TOKENS[size] || SIZE_TOKENS.md;
  const isPercentHeight =
    typeof height === "string" && height.trim().endsWith("%");
  const resolvedMinHeight =
    typeof height === "number" ? height : tokens.minHeight;
  const resolvedIconSize = iconSize ?? tokens.icon;
  const resolvedIconWrap = Math.round(resolvedIconSize * 2);
  const resolvedMessageColor = messageColor ?? colors.primary_text;
  const resolvedSubMessageColor = subMessageColor ?? colors.secondary_text;
  const resolvedIconColor = iconColor ?? colors.primary_accent;
  const resolvedIconOpacity =
    typeof iconOpacity === "number" ? iconOpacity : 1;
  const useOutlined = variant === "outlined" || bordered;
  const gap = dense ? tokens.gap * 0.75 : tokens.gap;

  const dimensionStyles = isPercentHeight
    ? {
        height,
        minHeight: dense ? 0 : resolvedMinHeight,
        flex: 1,
        alignSelf: "stretch",
      }
    : {
        height: height ?? resolvedMinHeight,
        minHeight: height ?? resolvedMinHeight,
      };

  return (
    <Box
      sx={{
        ...dimensionStyles,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap,
        bgcolor: useOutlined ? colors.primary_bg : "transparent",
        border: useOutlined ? `1px dashed ${colors.border_color}` : "none",
        borderRadius: 2,
        px: tokens.px,
        py: dense ? 2 : 3,
        textAlign: "center",
        color: resolvedSubMessageColor,
        width: fullWidth ? "100%" : undefined,
        minWidth,
        maxWidth,
        ...style,
      }}
    >
      <Box
        sx={{
          width: useOutlined ? resolvedIconSize : resolvedIconWrap,
          height: useOutlined ? resolvedIconSize : resolvedIconWrap,
          borderRadius: useOutlined ? 0 : "50%",
          bgcolor: useOutlined ? "transparent" : colors.hover_bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: resolvedIconOpacity,
          flexShrink: 0,
        }}
        aria-hidden
      >
        {renderIconNode(icon, iconKey, resolvedIconSize, resolvedIconColor)}
      </Box>
      <Typography
        component="p"
        sx={{
          fontWeight: 700,
          fontSize: tokens.title,
          lineHeight: 1.3,
          color: resolvedMessageColor,
          m: 0,
        }}
      >
        {message}
      </Typography>
      {subMessage && (
        <Typography
          component="p"
          sx={{
            maxWidth: 420,
            fontSize: tokens.sub,
            lineHeight: 1.55,
            color: resolvedSubMessageColor,
            m: 0,
          }}
        >
          {subMessage}
        </Typography>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          size="small"
          startIcon={<RefreshIcon />}
          sx={{
            mt: dense ? 0.5 : 1,
            bgcolor: colors.primary_accent,
            color: colors.button_text || "#000",
            fontWeight: 600,
            "&:hover": { bgcolor: colors.button_hover || "#00b8a0" },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default NoDataPlaceholder;
