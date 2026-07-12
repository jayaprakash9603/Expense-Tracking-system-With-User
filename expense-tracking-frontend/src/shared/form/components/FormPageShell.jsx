import React from "react";
import PageHeader from "../../../components/PageHeader";

const SCROLLBAR_STYLES = `
  input[type="date"]::-webkit-calendar-picker-indicator {
    background: url('https://cdn-icons-png.flaticon.com/128/8350/8350450.png') no-repeat;
    background-size: 18px;
    filter: invert(1) brightness(100) contrast(100);
  }
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
    appearance: none;
  }
  .overflow-y-auto::-webkit-scrollbar { width: 8px; }
  .overflow-y-auto::-webkit-scrollbar-track { background: var(--shell-scrollbar-track, #1b1b1b); }
  .overflow-y-auto::-webkit-scrollbar-thumb { background: var(--shell-scrollbar-thumb, #00dac6); border-radius: 4px; }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: var(--shell-scrollbar-thumb-hover, #00b8a0); }
  .overflow-x-auto::-webkit-scrollbar { height: 8px; }
  .overflow-x-auto::-webkit-scrollbar-track { background: var(--shell-scrollbar-track, #1b1b1b); }
  .overflow-x-auto::-webkit-scrollbar-thumb { background: var(--shell-scrollbar-thumb, #00dac6); border-radius: 4px; }
  .overflow-x-auto::-webkit-scrollbar-thumb:hover { background: var(--shell-scrollbar-thumb-hover, #00b8a0); }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RESPONSIVE_STYLES = `
  @media (max-width: 640px) {
    .form-page-shell {
      width: 100vw !important;
      height: auto !important;
      padding: 16px;
    }
    .form-row {
      flex-direction: column !important;
      gap: 12px;
    }
  }
`;

export default function FormPageShell({
  title,
  onClose,
  colors,
  children,
  className = "",
  rightContent,
  titleClassName,
  containerStyle,
}) {
  return (
    <>
      <div
        className={`flex flex-col relative form-page-shell ${className}`}
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          border: `1px solid ${colors.border_color}`,
          padding: "16px 20px",
          marginRight: "20px",
          overflowY: "auto",
          "--shell-scrollbar-track": colors.secondary_bg,
          "--shell-scrollbar-thumb": colors.primary_accent,
          "--shell-scrollbar-thumb-hover": colors.primary_accent,
          ...containerStyle,
        }}
      >
        <PageHeader
          title={title}
          onClose={onClose}
          rightContent={rightContent}
          titleClassName={titleClassName}
        />
        {children}
        <style>{SCROLLBAR_STYLES}</style>
        <style>{RESPONSIVE_STYLES}</style>
      </div>
    </>
  );
}
