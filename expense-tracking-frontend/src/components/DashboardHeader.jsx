import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../hooks/useTheme";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { MoreVert, Refresh, Download, Tune } from "@mui/icons-material";

/**
 * DashboardHeader
 * Reusable header for dashboard-like pages.
 * Shows title/subtitle and an action menu with refresh/export (and optional filter hook).
 */
const DashboardHeader = ({
  title = "💰 Financial Dashboard",
  subtitle = "Real-time insights into your financial health",
  onRefresh,
  onExport,
  onFilter,
  onCustomize,
  menuProps = {},
}) => {
  const { colors } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleAndClose = (cb) => () => {
    handleClose();
    cb && cb();
  };

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <div className="header-title">
          <h1 style={{ color: colors.primary_text }}>{title}</h1>
          {subtitle && (
            <p style={{ color: colors.secondary_text }}>{subtitle}</p>
          )}
        </div>
      </div>
      <div className="header-actions">
        <IconButton
          className="action-btn no-lift"
          aria-label="More actions"
          aria-controls={open ? "dashboard-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleMenuOpen}
          size="small"
          style={{ color: colors.icon_muted }}
        >
          <MoreVert />
        </IconButton>
        <Menu
          id="dashboard-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{ "aria-labelledby": "dashboard-menu" }}
          PaperProps={{
            sx: {
              backgroundColor: colors.tertiary_bg,
              color: colors.primary_text,
              border: `1px solid ${colors.border_color}`,
              minWidth: 220,
            },
            ...menuProps.PaperProps,
          }}
        >
          {onRefresh && (
            <MenuItem onClick={handleAndClose(onRefresh)}>
              <ListItemIcon sx={{ color: colors.primary_accent }}>
                <Refresh fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Refresh"
                secondary="Reload dashboard data"
                primaryTypographyProps={{
                  style: { color: colors.primary_text },
                }}
                secondaryTypographyProps={{
                  style: { color: colors.secondary_text },
                }}
              />
            </MenuItem>
          )}
          {onExport && (
            <MenuItem onClick={handleAndClose(onExport)}>
              <ListItemIcon sx={{ color: colors.primary_accent }}>
                <Download fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Export Reports"
                secondary="Download Excel summaries"
                primaryTypographyProps={{
                  style: { color: colors.primary_text },
                }}
                secondaryTypographyProps={{
                  style: { color: colors.secondary_text },
                }}
              />
            </MenuItem>
          )}
          {onFilter && (
            <MenuItem onClick={handleAndClose(onFilter)}>
              <ListItemIcon sx={{ color: colors.primary_accent }}>
                {/* Could use a Filter icon here */}
                <Refresh fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Filter"
                secondary="Open filter options"
                primaryTypographyProps={{
                  style: { color: colors.primary_text },
                }}
                secondaryTypographyProps={{
                  style: { color: colors.secondary_text },
                }}
              />
            </MenuItem>
          )}
          {onCustomize && (
            <MenuItem onClick={handleAndClose(onCustomize)}>
              <ListItemIcon sx={{ color: colors.primary_accent }}>
                <Tune fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Customize Dashboard"
                secondary="Arrange & toggle sections"
                primaryTypographyProps={{
                  style: { color: colors.primary_text },
                }}
                secondaryTypographyProps={{
                  style: { color: colors.secondary_text },
                }}
              />
            </MenuItem>
          )}
        </Menu>
      </div>
    </div>
  );
};

DashboardHeader.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  onFilter: PropTypes.func,
  onCustomize: PropTypes.func,
  menuProps: PropTypes.object,
};

export default DashboardHeader;
