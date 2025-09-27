import React from 'react';
import {
  Box,
  IconButton,
  Popover,
  MenuList,
  MenuItem,
  Typography
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const BillHeader = ({ 
  friendId, 
  onBack, 
  menuAnchorEl, 
  onMenuClick, 
  onMenuClose, 
  onMenuItemClick 
}) => {
  const open = Boolean(menuAnchorEl);

  return (
    <>
      <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
        <IconButton
          sx={{
            color: "#00DAC6",
            backgroundColor: "#1b1b1b",
            "&:hover": { backgroundColor: "#28282a" },
            zIndex: 10,
          }}
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <IconButton
          sx={{
            color: "#00DAC6",
            backgroundColor: "#1b1b1b",
            "&:hover": { backgroundColor: "#28282a" },
            zIndex: 10,
          }}
          onClick={onMenuClick}
          aria-label="Menu"
        >
          <MoreVertIcon />
        </IconButton>

        <Popover
          open={open}
          anchorEl={menuAnchorEl}
          onClose={onMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              backgroundColor: "#1b1b1b",
              border: "1px solid #14b8a6",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              mt: 1,
            },
          }}
        >
          <MenuList sx={{ py: 1 }}>
            {[
              { key: 'new', icon: AddIcon, label: 'New Bill' },
              { key: 'upload', icon: UploadIcon, label: 'Upload Bill' },
              { key: 'report', icon: AssessmentIcon, label: 'Bill Report' },
              { key: 'calendar', icon: CalendarIcon, label: 'Bill Calendar' }
            ].map(({ key, icon: Icon, label }) => (
              <MenuItem
                key={key}
                onClick={() => onMenuItemClick(key)}
                sx={{
                  color: "#fff",
                  px: 3,
                  py: 1.5,
                  "&:hover": { backgroundColor: "#28282a" },
                }}
              >
                <Icon sx={{ mr: 2, color: "#14b8a6" }} />
                <Typography variant="body2">{label}</Typography>
              </MenuItem>
            ))}
          </MenuList>
        </Popover>
      </Box>
    </>
  );
};

export default BillHeader;