import React, {
  useCallback,
  useMemo,
  useState,
  isValidElement,
} from "react";
import PropTypes from "prop-types";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Menu,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { useTheme } from "../../hooks/useTheme";
import { getFunctionalIcon, isEmojiGlyph } from "../../utils/ui/iconMapping";
import "./OverflowActionMenu.css";

const renderMenuIcon = (icon, color, size = 20) => {
  if (icon == null) return null;
  if (isValidElement(icon)) {
    return React.cloneElement(icon, {
      sx: { fontSize: size, color, ...(icon.props?.sx || {}) },
    });
  }
  if (typeof icon === "function") {
    const IconComponent = icon;
    return <IconComponent sx={{ fontSize: size, color }} />;
  }
  if (isEmojiGlyph(icon) || typeof icon === "string") {
    return getFunctionalIcon(icon, { sx: { fontSize: size, color } });
  }
  return null;
};

export const buildReportOverflowItems = ({
  onRefresh,
  onExport,
  onDownloadPdf,
  onFilter,
  onCustomize,
  labels = {},
}) => {
  const items = [];

  if (onRefresh) {
    items.push({
      id: "refresh",
      label: labels.refresh || "Refresh",
      description: labels.refreshDesc || "Reload the latest data",
      icon: RefreshOutlinedIcon,
      onClick: onRefresh,
      group: "data",
    });
  }

  if (onExport) {
    items.push({
      id: "export",
      label: labels.export || "Export CSV",
      description: labels.exportDesc || "Download as spreadsheet",
      icon: FileDownloadOutlinedIcon,
      onClick: onExport,
      group: "data",
    });
  }

  if (onDownloadPdf) {
    items.push({
      id: "pdf",
      label: labels.pdf || "Download PDF",
      description: labels.pdfDesc || "Save a printable report",
      icon: PictureAsPdfOutlinedIcon,
      onClick: onDownloadPdf,
      group: "data",
    });
  }

  if (onFilter) {
    items.push({
      id: "filter",
      label: labels.filter || "Filter Data",
      description: labels.filterDesc || "Narrow what you see",
      icon: FilterAltOutlinedIcon,
      onClick: onFilter,
      group: "view",
      dividerBefore: items.length > 0,
    });
  }

  if (onCustomize) {
    items.push({
      id: "customize",
      label: labels.customize || "Customize Report",
      description: labels.customizeDesc || "Adjust layout and metrics",
      icon: TuneOutlinedIcon,
      onClick: onCustomize,
      group: "view",
      dividerBefore: items.length > 0 && !onFilter,
    });
  }

  return items;
};

export const createDefaultReportMenuItems = ({
  onExport,
  onCustomize,
  customizeLabel = "Customize Report",
}) =>
  buildReportOverflowItems({
    onExport,
    onCustomize,
    labels: { customize: customizeLabel, export: "Export CSV" },
  });

const ActionMenuItem = ({
  item,
  colors,
  mode,
  dense,
  onSelect,
}) => {
  const disabled = Boolean(item.disabled);
  const accent = disabled ? colors.secondary_text : colors.primary_accent;
  const iconBg =
    mode === "dark"
      ? `${colors.primary_accent}22`
      : `${colors.primary_accent}18`;

  return (
    <button
      type="button"
      role="menuitem"
      className={`overflow-action-item${dense ? " is-dense" : ""}${
        disabled ? " is-disabled" : ""
      }`}
      onClick={() => onSelect(item)}
      disabled={disabled}
      aria-label={item.label}
    >
      <span
        className="overflow-action-item__icon"
        style={{
          backgroundColor: iconBg,
          color: accent,
          border: `1px solid ${
            mode === "dark" ? `${colors.primary_accent}40` : `${colors.primary_accent}30`
          }`,
        }}
        aria-hidden
      >
        {renderMenuIcon(item.icon, accent, dense ? 18 : 20)}
      </span>
      <span className="overflow-action-item__text">
        <span
          className="overflow-action-item__label"
          style={{ color: disabled ? colors.secondary_text : colors.primary_text }}
        >
          {item.label}
        </span>
        {item.description ? (
          <span
            className="overflow-action-item__desc"
            style={{ color: "var(--color-secondary-text)" }}
          >
            {item.description}
          </span>
        ) : null}
      </span>
    </button>
  );
};

ActionMenuItem.propTypes = {
  item: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired,
  mode: PropTypes.string,
  dense: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

const MenuBody = ({
  items,
  colors,
  mode,
  dense,
  title,
  onSelect,
}) => (
  <div className={`overflow-action-menu__body${dense ? " is-dense" : ""}`}>
    {title ? (
      <div className="overflow-action-menu__header">
        <Typography
          component="p"
          className="overflow-action-menu__title"
          style={{ color: "var(--color-secondary-text)" }}
        >
          {title}
        </Typography>
      </div>
    ) : null}

    <div className="overflow-action-menu__list" role="menu">
      {items.map((item) => (
        <React.Fragment key={item.id}>
          {item.dividerBefore ? (
            <Divider
              className="overflow-action-menu__divider"
              sx={{
                my: dense ? 0.75 : 1,
                mx: 1.25,
                borderColor: "var(--color-border-color)",
                opacity: 0.85,
              }}
            />
          ) : null}
          <ActionMenuItem
            item={item}
            colors={colors}
            mode={mode}
            dense={dense}
            onSelect={onSelect}
          />
        </React.Fragment>
      ))}
    </div>
  </div>
);

MenuBody.propTypes = {
  items: PropTypes.array.isRequired,
  colors: PropTypes.object.isRequired,
  mode: PropTypes.string,
  dense: PropTypes.bool,
  title: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

const OverflowActionMenu = ({
  items = [],
  ariaLabel = "More actions",
  buttonSize = "medium",
  className = "",
  menuTitle = "Actions",
}) => {
  const { colors, mode } = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const visibleItems = useMemo(
    () => items.filter((item) => item && item.onClick),
    [items]
  );

  const handleOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleItemClick = useCallback(
    (item) => {
      if (item.disabled) return;
      handleClose();
      item.onClick?.();
    },
    [handleClose]
  );

  if (visibleItems.length === 0) return null;

  const triggerSize = buttonSize === "small" || isMobile ? 44 : 40;
  const paperBg = colors.secondary_bg || colors.primary_bg;
  const borderColor =
    mode === "dark"
      ? `${colors.primary_accent}55`
      : colors.border_color;

  const paperShadow =
    mode === "dark"
      ? "0 16px 48px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(20, 184, 166, 0.08)"
      : "0 16px 40px rgba(15, 23, 42, 0.14)";

  return (
    <>
      <IconButton
        className={`overflow-action-menu-trigger ${className}`.trim()}
        onClick={handleOpen}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : "false"}
        aria-controls={open ? "overflow-action-menu" : undefined}
        size={buttonSize}
        sx={{
          width: triggerSize,
          height: triggerSize,
          borderRadius: "10px",
          border: `1px solid ${
            open ? colors.primary_accent : colors.border_color
          }`,
          bgcolor: open
            ? `${colors.primary_accent}18`
            : colors.primary_bg || colors.secondary_bg,
          color: open ? colors.primary_accent : colors.primary_text,
          transition: prefersReducedMotion
            ? "none"
            : "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease",
          cursor: "pointer",
          "&:hover": {
            bgcolor: `${colors.primary_accent}18`,
            borderColor: colors.primary_accent,
            color: "var(--color-primary-accent)",
          },
          "&:active": {
            transform: prefersReducedMotion ? "none" : "scale(0.96)",
          },
          "&:focus-visible": {
            outline: `2px solid ${colors.primary_accent}`,
            outlineOffset: 2,
          },
        }}
      >
        <MoreVertIcon sx={{ fontSize: isMobile ? 20 : 22 }} />
      </IconButton>

      {/* Mobile: bottom sheet for reliable icon + touch targets */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={open}
          onClose={handleClose}
          ModalProps={{ keepMounted: false }}
          PaperProps={{
            className: "overflow-action-sheet",
            sx: {
              bgcolor: paperBg,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              border: `1px solid ${borderColor}`,
              borderBottom: "none",
              boxShadow: paperShadow,
              maxHeight: "70vh",
              pb: "env(safe-area-inset-bottom, 0px)",
            },
          }}
        >
          <Box
            className="overflow-action-sheet__handle-wrap"
            role="presentation"
          >
            <span
              className="overflow-action-sheet__handle"
              style={{ backgroundColor: colors.border_color }}
            />
          </Box>
          <MenuBody
            items={visibleItems}
            colors={colors}
            mode={mode}
            dense={false}
            title={menuTitle}
            onSelect={handleItemClick}
          />
        </Drawer>
      ) : (
        <Menu
          id="overflow-action-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          transitionDuration={prefersReducedMotion ? 0 : undefined}
          MenuListProps={{
            "aria-label": ariaLabel,
            dense: false,
            sx: { p: 0 },
          }}
          slotProps={{
            paper: {
              elevation: 0,
              className: "overflow-action-menu-paper",
              sx: {
                mt: 1,
                minWidth: 280,
                maxWidth: "min(340px, calc(100vw - 24px))",
                overflow: "hidden",
                bgcolor: paperBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "14px",
                boxShadow: paperShadow,
                backgroundImage: "none",
              },
            },
          }}
        >
          <MenuBody
            items={visibleItems}
            colors={colors}
            mode={mode}
            dense
            title={menuTitle}
            onSelect={handleItemClick}
          />
        </Menu>
      )}
    </>
  );
};

OverflowActionMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
        PropTypes.string,
      ]),
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
      dividerBefore: PropTypes.bool,
      group: PropTypes.string,
    })
  ),
  ariaLabel: PropTypes.string,
  buttonSize: PropTypes.oneOf(["small", "medium"]),
  className: PropTypes.string,
  menuTitle: PropTypes.string,
};

export default OverflowActionMenu;
