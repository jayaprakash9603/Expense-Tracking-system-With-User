import React, { isValidElement } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../hooks/useTheme";
import { getFunctionalIcon, isEmojiGlyph } from "../utils/ui/iconMapping";

const renderIcon = (icon, color) => {
  if (icon == null) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === "function") {
    const IconComponent = icon;
    return <IconComponent sx={{ fontSize: 28, color }} />;
  }
  if (isEmojiGlyph(icon) || typeof icon === "string") {
    return getFunctionalIcon(icon, { sx: { fontSize: 28, color } });
  }
  return null;
};

const EmptyStateCard = ({
  icon = "inbox",
  title = "No data",
  message = "Nothing to display yet.",
  height = 220,
  bordered = true,
}) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        minHeight: height,
        backgroundColor: colors.tertiary_bg,
        border: bordered ? `1px dashed ${colors.border_color}` : "none",
        borderRadius: 12,
        color: colors.primary_text,
        gap: 8,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: colors.hover_bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden
      >
        {renderIcon(icon, colors.primary_accent)}
      </div>
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div
        style={{
          color: colors.secondary_text,
          maxWidth: 360,
          lineHeight: 1.5,
        }}
      >
        {message}
      </div>
    </div>
  );
};

EmptyStateCard.propTypes = {
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.func,
  ]),
  title: PropTypes.string,
  message: PropTypes.string,
  height: PropTypes.number,
  bordered: PropTypes.bool,
};

export default EmptyStateCard;
