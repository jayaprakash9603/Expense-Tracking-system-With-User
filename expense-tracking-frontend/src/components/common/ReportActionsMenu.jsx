import React, { useState, useCallback } from "react";
import { IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "../../hooks/useTheme";

/**
 * ReportActionsMenu - Reusable three-dot menu for report headers
 *
 * Follows DRY principle by providing a single implementation for all report action menus.
 * Supports customizable menu items with icons and click handlers.
 *
 * @param {Object} props
 * @param {Array} props.menuItems - Array of menu item configurations
 * @param {string} props.menuItems[].id - Unique identifier for the menu item
 * @param {string} props.menuItems[].label - Display label
 * @param {string} props.menuItems[].icon - Emoji or icon to display
 * @param {Function} props.menuItems[].onClick - Click handler
 * @param {boolean} props.menuItems[].disabled - Optional disabled state
 * @param {string} props.ariaLabel - Accessibility label (default: "More actions")
 *
 * @example
 * <ReportActionsMenu
 *   menuItems={[
 *     { id: "export", label: "Export", icon: "📤", onClick: handleExport },
 *     { id: "customize", label: "Customize Report", icon: "⚙️", onClick: () => setCustomizationOpen(true) },
 *   ]}
 * />
 */
export default function ReportActionsMenu({
  menuItems = [],
  ariaLabel = "More actions",
}) {
  const { colors, mode } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleItemClick = useCallback(
    (item) => {
      if (!item.disabled && item.onClick) {
        item.onClick();
      }
      handleClose();
    },
    [handleClose]
  );

  const isOpen = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ color: colors.secondary_accent }}
        size="small"
        aria-label={ariaLabel}
      >
        <MoreVertIcon />
      </IconButton>

      {isOpen && (
        <>
          {/* Backdrop to close menu on outside click */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={handleClose}
          />

          {/* Menu dropdown */}
          <div
            style={{
              position: "fixed",
              top: anchorEl?.getBoundingClientRect().bottom + 6 || 0,
              left: anchorEl?.getBoundingClientRect().left - 100 || 0,
              backgroundColor: colors.primary_bg,
              border: `1px solid ${colors.primary_accent}`,
              borderRadius: "8px",
              boxShadow: `0 4px 20px rgba(0,0,0,${
                mode === "dark" ? 0.3 : 0.15
              })`,
              zIndex: 1000,
              minWidth: "180px",
            }}
          >
            <div style={{ padding: "8px 0" }}>
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    color: item.disabled
                      ? colors.secondary_text
                      : colors.primary_text,
                    padding: "10px 18px",
                    cursor: item.disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    opacity: item.disabled ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) {
                      e.currentTarget.style.backgroundColor = colors.hover_bg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span style={{ marginRight: 10 }}>{item.icon}</span>
                  <span style={{ fontSize: 14 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

/**
 * Default menu items for reports with export and customize options
 */
export const createDefaultReportMenuItems = ({
  onExport,
  onCustomize,
  customizeLabel = "Customize Report",
}) => [
  {
    id: "export",
    label: "Export",
    icon: "📤",
    onClick: onExport,
  },
  {
    id: "customize",
    label: customizeLabel,
    icon: "⚙️",
    onClick: onCustomize,
  },
];
