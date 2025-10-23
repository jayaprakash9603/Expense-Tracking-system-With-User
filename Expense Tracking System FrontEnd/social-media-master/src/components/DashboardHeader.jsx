import React from "react";
import PropTypes from "prop-types";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { MoreVert, Refresh, Download } from "@mui/icons-material";

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
  menuProps = {},
}) => {
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
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
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
              backgroundColor: "#1e1e1e",
              color: "#fff",
              border: "1px solid #2a2a2a",
              minWidth: 220,
            },
            ...menuProps.PaperProps,
          }}
        >
          {onRefresh && (
            <MenuItem onClick={handleAndClose(onRefresh)}>
              <ListItemIcon sx={{ color: "#14b8a6" }}>
                <Refresh fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Refresh"
                secondary="Reload dashboard data"
              />
            </MenuItem>
          )}
          {onExport && (
            <MenuItem onClick={handleAndClose(onExport)}>
              <ListItemIcon sx={{ color: "#14b8a6" }}>
                <Download fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Export Reports"
                secondary="Download Excel summaries"
              />
            </MenuItem>
          )}
          {onFilter && (
            <MenuItem onClick={handleAndClose(onFilter)}>
              <ListItemIcon sx={{ color: "#14b8a6" }}>
                {/* Could use a Filter icon here */}
                <Refresh fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Filter" secondary="Open filter options" />
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
  menuProps: PropTypes.object,
};

export default DashboardHeader;
