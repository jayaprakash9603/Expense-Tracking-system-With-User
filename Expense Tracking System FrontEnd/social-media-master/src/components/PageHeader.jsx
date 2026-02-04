import React from "react";
import { useTheme } from "../hooks/useTheme";

const PageHeader = ({
  title,
  onClose,
  showCloseButton = true,
  rightContent = null,
  titleClassName = "font-extrabold text-4xl",
  containerClassName = "w-full flex justify-between items-center mb-1",
  accentColor = null,
}) => {
  const { colors } = useTheme();

  return (
    <>
      <div className={containerClassName}>
        <p style={{ color: colors.primary_text }} className={titleClassName}>
          {title}
        </p>

        <div className="flex items-center gap-3">
          {rightContent}

          {showCloseButton && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-9 h-9 text-[24px] font-bold rounded"
              style={{ backgroundColor: colors.active_bg, color: "#00dac6" }}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <hr
        style={{ borderColor: accentColor || colors.border_color }}
        className="border-t w-full mt-[-4px] mb-0"
      />
    </>
  );
};

export default PageHeader;
