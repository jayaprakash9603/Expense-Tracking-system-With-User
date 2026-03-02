import React, { useState } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Upload, Settings, MoreVertical, Filter } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const ReportActionMenu = ({ onExport, onCustomize, onRefresh, onDownloadPdf, onFilter }) => {
  const { colors, mode } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleClose();
    if (action) action();
  };

  if (!onExport && !onCustomize && !onRefresh && !onDownloadPdf && !onFilter) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className="control-btn"
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: open ? colors.hover_bg : colors.primary_bg,
          border: `1px solid ${open ? colors.primary_accent : colors.border_color}`,
          color: open ? colors.primary_accent : colors.primary_text,
          padding: "8px",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.hover_bg;
          e.currentTarget.style.borderColor = colors.primary_accent;
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = colors.primary_bg;
            e.currentTarget.style.borderColor = colors.border_color;
          }
        }}
      >
        <MoreVertical size={16} />
      </button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          style: {
            backgroundColor: mode === "dark" ? "#1e293b" : colors.primary_bg,
            border: `1px solid ${colors.primary_accent}`,
            borderRadius: "12px",
            minWidth: "200px",
            boxShadow: mode === "dark" 
                ? "0 10px 40px rgba(0,0,0,0.5)" 
                : "0 10px 40px rgba(0,0,0,0.1)",
            marginTop: "8px",
            padding: "4px 0"
          }
        }}
      >
        {onRefresh && (
          <MenuItem 
            onClick={() => handleAction(onRefresh)}
            sx={{
              padding: "10px 20px",
              "&:hover": { backgroundColor: colors.hover_bg }
            }}
          >
            <ListItemIcon sx={{ color: colors.primary_text, minWidth: "32px" }}>
              <span style={{ fontSize: "16px" }}>🔄</span>
            </ListItemIcon>
            <ListItemText 
              primary="Refresh" 
              primaryTypographyProps={{ style: { color: colors.primary_text, fontSize: "14px", fontWeight: 500 } }} 
            />
          </MenuItem>
        )}

        {onExport && (
          <MenuItem 
            onClick={() => handleAction(onExport)}
            sx={{
              padding: "10px 20px",
              "&:hover": { backgroundColor: colors.hover_bg }
            }}
          >
            <ListItemIcon sx={{ color: colors.primary_text, minWidth: "32px" }}>
              <Upload size={18} />
            </ListItemIcon>
            <ListItemText 
              primary="Export CSV" 
              primaryTypographyProps={{ style: { color: colors.primary_text, fontSize: "14px", fontWeight: 500 } }} 
            />
          </MenuItem>
        )}
        
        {onDownloadPdf && (
          <MenuItem 
            onClick={() => handleAction(onDownloadPdf)}
            sx={{
              padding: "10px 20px",
              "&:hover": { backgroundColor: colors.hover_bg }
            }}
          >
            <ListItemIcon sx={{ color: colors.primary_text, minWidth: "32px" }}>
              <span style={{ fontSize: "16px" }}>📥</span>
            </ListItemIcon>
            <ListItemText 
              primary="Download PDF" 
              primaryTypographyProps={{ style: { color: colors.primary_text, fontSize: "14px", fontWeight: 500 } }} 
            />
          </MenuItem>
        )}

        {onFilter && (
          <MenuItem 
            onClick={() => handleAction(onFilter)}
            sx={{
              padding: "10px 20px",
              "&:hover": { backgroundColor: colors.hover_bg }
            }}
          >
            <ListItemIcon sx={{ color: colors.primary_text, minWidth: "32px" }}>
              <Filter size={18} />
            </ListItemIcon>
            <ListItemText 
              primary="Filter Data" 
              primaryTypographyProps={{ style: { color: colors.primary_text, fontSize: "14px", fontWeight: 500 } }} 
            />
          </MenuItem>
        )}
        
        {(onExport || onRefresh || onDownloadPdf || onFilter) && onCustomize && (
            <div style={{ height: "1px", backgroundColor: colors.border_color, margin: "4px 16px" }} />
        )}
        
        {onCustomize && (
          <MenuItem 
            onClick={() => handleAction(onCustomize)}
            sx={{
              padding: "10px 20px",
              "&:hover": { backgroundColor: colors.hover_bg }
            }}
          >
            <ListItemIcon sx={{ color: colors.primary_text, minWidth: "32px" }}>
              <Settings size={18} />
            </ListItemIcon>
            <ListItemText 
              primary="Customize Report" 
              primaryTypographyProps={{ style: { color: colors.primary_text, fontSize: "14px", fontWeight: 500 } }} 
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ReportActionMenu;