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
      <div className={containerClassName} style={{ minWidth: 0 }}>
        <div style={{ minWidth: 0, flex: "1 1 auto", overflow: "hidden" }}>
          {typeof title === "string" ? (
            <p
              style={{
                color: "var(--color-primary-text)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              className={titleClassName}
            >
              {title}
            </p>
          ) : (
            <div className={titleClassName} style={{ color: "var(--color-primary-text)" }}>
              {title}
            </div>
          )}
        </div>

        <div
          className="flex items-center gap-2 sm:gap-3"
          style={{ flexShrink: 0 }}
        >
          {rightContent}

          {showCloseButton && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-11 h-11 text-[24px] font-bold rounded transition-colors"
              style={{
                backgroundColor: colors.button_inactive,
                color: "var(--color-primary-accent)",
                border: "1px solid var(--color-border-color)",
              }}
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
