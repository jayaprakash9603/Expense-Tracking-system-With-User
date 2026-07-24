import React, { useCallback, useMemo, useState, isValidElement } from "react";
import PropTypes from "prop-types";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SyncIcon from "@mui/icons-material/Sync";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { useTheme } from "../../hooks/useTheme";
import { getFunctionalIcon, isEmojiGlyph } from "../../utils/ui/iconMapping";

const renderMenuIcon = (icon, color) => {
  if (icon == null) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === "function") {
    const IconComponent = icon;
    return <IconComponent sx={{ fontSize: 20, color }} />;
  }
  if (isEmojiGlyph(icon) || typeof icon === "string") {
    return getFunctionalIcon(icon, { sx: { fontSize: 20, color } });
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
      icon: SyncIcon,
      onClick: onRefresh,
    });
  }

  if (onExport) {
    items.push({
      id: "export",
      label: labels.export || "Export CSV",
      icon: FileUploadOutlinedIcon,
      onClick: onExport,
    });
  }

  if (onDownloadPdf) {
    items.push({
      id: "pdf",
      label: labels.pdf || "Download PDF",
      icon: PictureAsPdfOutlinedIcon,
      onClick: onDownloadPdf,
    });
  }

  if (onFilter) {
    items.push({
      id: "filter",
      label: labels.filter || "Filter Data",
      icon: FilterListIcon,
      onClick: onFilter,
    });
  }

  if (onCustomize) {
    items.push({
      id: "customize",
      label: labels.customize || "Customize Report",
      icon: SettingsOutlinedIcon,
      onClick: onCustomize,
      dividerBefore: items.length > 0,
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
    labels: { customize: customizeLabel, export: "Export" },
  });

const OverflowActionMenu = ({
  items = [],
  ariaLabel = "More actions",
  buttonSize = "medium",
  className = "",
}) => {
  const { colors, mode } = useTheme();
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

  const triggerSize = buttonSize === "small" ? 36 : 40;

  return (
    <>
      <IconButton
        className={className}
        onClick={handleOpen}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : "false"}
        size={buttonSize}
        sx={{
          width: triggerSize,
          height: triggerSize,
          borderRadius: "8px",
          border: `1px solid ${
            open ? colors.primary_accent : colors.border_color
          }`,
          bgcolor: open ? colors.hover_bg : colors.primary_bg,
          color: open ? colors.primary_accent : colors.primary_text,
          transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
          "&:hover": {
            bgcolor: colors.hover_bg,
            borderColor: colors.primary_accent,
            color: colors.primary_accent,
          },
          "&:focus-visible": {
            outline: `2px solid ${colors.primary_accent}`,
            outlineOffset: 2,
          },
        }}
      >
        <MoreVertIcon sx={{ fontSize: buttonSize === "small" ? 18 : 20 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1,
              minWidth: 220,
              overflow: "hidden",
              bgcolor: colors.secondary_bg || colors.primary_bg,
              border: `1px solid ${colors.primary_accent}`,
              borderRadius: "12px",
              boxShadow:
                mode === "dark"
                  ? "0 12px 40px rgba(0, 0, 0, 0.45)"
                  : "0 12px 32px rgba(15, 23, 42, 0.12)",
              py: 0.5,
            },
          },
          list: {
            sx: { py: 0.5 },
          },
        }}
      >
        {visibleItems.map((item) => (
          <React.Fragment key={item.id}>
            {item.dividerBefore ? (
              <Divider
                sx={{
                  my: 0.5,
                  mx: 1.5,
                  borderColor: colors.border_color,
                }}
              />
            ) : null}
            <MenuItem
              onClick={() => handleItemClick(item)}
              disabled={Boolean(item.disabled)}
              sx={{
                minHeight: 44,
                px: 2,
                py: 1,
                mx: 0.75,
                borderRadius: "8px",
                color: item.disabled
                  ? colors.secondary_text
                  : colors.primary_text,
                opacity: item.disabled ? 0.55 : 1,
                "&:hover": {
                  bgcolor: colors.hover_bg,
                },
                "&.Mui-focusVisible": {
                  bgcolor: colors.hover_bg,
                  outline: `2px solid ${colors.primary_accent}`,
                  outlineOffset: -2,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: item.disabled
                    ? colors.secondary_text
                    : colors.primary_accent,
                }}
              >
                {renderMenuIcon(
                  item.icon,
                  item.disabled ? colors.secondary_text : colors.primary_accent
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              />
            </MenuItem>
          </React.Fragment>
        ))}
      </Menu>
    </>
  );
};

OverflowActionMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.func,
        PropTypes.string,
      ]),
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
      dividerBefore: PropTypes.bool,
    })
  ),
  ariaLabel: PropTypes.string,
  buttonSize: PropTypes.oneOf(["small", "medium"]),
  className: PropTypes.string,
};

export default OverflowActionMenu;
