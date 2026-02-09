import React from "react";

const TextBanner = ({ title, description, accentColor = "#2563eb" }) => {
  if (!title && !description) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2 text-xs font-medium"
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        border: `1px solid ${accentColor}`,
        color: accentColor,
        backgroundColor: `${accentColor}11`,
      }}
    >
      {title && <span>{title}</span>}
      {description && (
        <span className="text-[11px] text-gray-700">{description}</span>
      )}
    </div>
  );
};

export default TextBanner;
