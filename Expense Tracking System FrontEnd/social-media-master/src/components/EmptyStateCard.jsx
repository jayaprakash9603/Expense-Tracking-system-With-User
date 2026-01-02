import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../hooks/useTheme";

const EmptyStateCard = ({
  icon = "📭",
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
          fontSize: 24,
        }}
        aria-hidden
      >
        {icon}
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
  icon: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  height: PropTypes.number,
  bordered: PropTypes.bool,
};

export default EmptyStateCard;
