import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";

// Hook to manage add-new popover open/close & outside click
export const useAddNewPopover = () => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        !document.querySelector('[data-popover="add-new"]')?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return { open, setOpen, btnRef };
};

// NavigationActions component
// Props:
// items: array of { path, icon, label }
// friendId, isFriendView: used to adjust paths
// hasWriteAccess: boolean controlling add-new visibility
// navigate: navigation function
// addNewOptions: array of { label, route, color }
// isMobile: responsive flag
// onAddNewToggle: optional callback when toggling popover
// addIcon: path to add icon asset
const NavigationActions = ({
  items = [],
  friendId,
  isFriendView,
  hasWriteAccess,
  navigate,
  addNewOptions = [],
  isMobile,
  addIcon,
  currentFlow, // e.g. 'category-flow', 'payment-method', 'cashflow'
}) => {
  const { open, setOpen, btnRef } = useAddNewPopover();
  const { colors, getIconFilter } = useTheme();
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginLeft: isMobile ? 0 : "8px",
        flexShrink: 0,
        gap: isMobile ? "6px" : "8px",
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}
    >
      {items.map(({ path, icon, label, shortcutKey }, index) => {
        const target = isFriendView ? `${path}/${friendId}` : path;
        // Use sequential index (1-based) for shortcut key
        const shortcutIndex = index + 1;
        return (
          <button
            key={path}
            onClick={() => {
              // Pass origin flow so destination can render back button returning here
              navigate(target, {
                state: { fromFlow: currentFlow, fromNav: true },
              });
            }}
            className="nav-button"
            data-shortcut={`nav-flow-item-${shortcutIndex}`}
            data-shortcut-label={label}
            title={`${label} (${shortcutIndex})`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "6px" : "6px",
              padding: isMobile ? "6px 8px" : "8px 10px",
              backgroundColor: colors.primary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: "8px",
              color: colors.active_text,
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              minWidth: "fit-content",
            }}
          >
            <img
              src={require(`../../assests/${icon}`)}
              alt={label}
              style={{
                width: isMobile ? 16 : 18,
                height: isMobile ? 16 : 18,
                filter:
                  "invert(61%) sepia(55%) saturate(654%) hue-rotate(130deg) brightness(91%) contrast(90%)", // Primary color #14b8a6
                transition: "filter 0.2s ease",
              }}
            />
            {!isMobile && <span>{label}</span>}
          </button>
        );
      })}
      {hasWriteAccess && (
        <button
          ref={btnRef}
          onClick={() => setOpen((v) => !v)}
          data-shortcut={`nav-flow-item-${items.length + 1}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: isMobile ? "6px 8px" : "6px 8px",
            backgroundColor: colors.primary_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: "6px",
            color: colors.active_text,
            fontSize: isMobile ? "11px" : "12px",
            fontWeight: "500",
            cursor: "pointer",
            minWidth: "fit-content",
          }}
          title={
            hasWriteAccess
              ? `${t("cashflow.addNew.tooltip")} (${items.length + 1})`
              : t("cashflow.addNew.readOnly")
          }
        >
          <img
            src={addIcon || require("../../assests/add.png")}
            alt={t("cashflow.addNew.label")}
            style={{
              width: isMobile ? 14 : 16,
              height: isMobile ? 14 : 16,
              filter:
                "invert(61%) sepia(55%) saturate(654%) hue-rotate(130deg) brightness(91%) contrast(90%)", // Primary color #14b8a6
              transition: "filter 0.2s ease",
            }}
          />
          {!isMobile && <span>{t("cashflow.addNew.label")}</span>}
        </button>
      )}
      {open &&
        hasWriteAccess &&
        btnRef.current &&
        createPortal(
          <div
            data-popover="add-new"
            style={{
              position: "fixed",
              top:
                btnRef.current.getBoundingClientRect().bottom +
                4 +
                window.scrollY,
              left:
                btnRef.current.getBoundingClientRect().left + window.scrollX,
              zIndex: 1000,
              background: colors.secondary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              minWidth: 140,
              padding: 4,
            }}
          >
            {addNewOptions.map((item, idx) => (
              <button
                key={idx}
                style={{
                  display: "block",
                  width: "100%",
                  background: "transparent",
                  color: item.color,
                  border: "none",
                  textAlign: "left",
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontSize: "12px",
                  borderRadius: 4,
                }}
                onClick={() => {
                  navigate(item.route, {
                    state: { fromFlow: currentFlow, fromNav: true },
                  });
                  setOpen(false);
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = item.color;
                  e.target.style.color =
                    item.color === "#FFC107" ? "#000" : "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = item.color;
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default NavigationActions;
