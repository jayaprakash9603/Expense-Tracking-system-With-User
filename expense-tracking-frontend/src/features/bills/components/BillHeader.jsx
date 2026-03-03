import React from "react";
import {
  Box,
  IconButton,
  Popover,
  MenuList,
  MenuItem,
  Typography,
  Button,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

const BillHeader = ({
  friendId,
  onBack,
  menuAnchorEl,
  onMenuClick,
  onMenuClose,
  onMenuItemClick,
  hasWriteAccess,
  hideBackButton = false,
}) => {
  const open = Boolean(menuAnchorEl);
  const { colors } = useTheme();

  // Shared button styles for reusability
  const baseButtonSx = {
    fontWeight: 600,
    px: 2.5,
    py: 1,
    borderRadius: 2,
    textTransform: "none",
    fontSize: "0.85rem",
    minHeight: "40px",
    boxShadow: "none",
    "@media (max-width:600px)": { display: "none" },
  };

  const primaryButtonSx = {
    ...baseButtonSx,
    backgroundColor: colors.primary_accent,
    color: colors.button_text,
    "&:hover": { backgroundColor: colors.button_hover },
  };

  const secondaryButtonSx = {
    ...baseButtonSx,
    color: colors.primary_accent,
    borderColor: colors.primary_accent,
    backgroundColor: colors.primary_bg,
    "&:hover": {
      backgroundColor: colors.hover_bg,
      borderColor: colors.primary_accent,
      color: colors.primary_accent,
    },
  };

  const ActionButton = ({
    label,
    icon: Icon,
    onClick,
    variant = "contained",
  }) => (
    <Button
      variant={variant}
      startIcon={<Icon />}
      onClick={onClick}
      sx={variant === "contained" ? primaryButtonSx : secondaryButtonSx}
    >
      {label}
    </Button>
  );

  const handleDirectCreateBill = () => {
    // Utilize existing menu routing logic by calling onMenuItemClick with 'new'
    onMenuItemClick("new");
  };

  return (
    <>
      {!hideBackButton && (
        <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
          <IconButton
            sx={{
              color: colors.secondary_accent,
              backgroundColor: colors.primary_bg,
              "&:hover": { backgroundColor: colors.hover_bg },
              zIndex: 10,
            }}
            onClick={onBack}
            aria-label="Back"
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {hasWriteAccess && (
          <ActionButton
            label="Create Bill"
            icon={AddIcon}
            onClick={handleDirectCreateBill}
            variant="contained"
          />
        )}
        <ActionButton
          label="Bill Report"
          icon={AssessmentIcon}
          onClick={() => onMenuItemClick("report")}
          variant="outlined"
        />
        <ActionButton
          label="Bill Calendar"
          icon={CalendarIcon}
          onClick={() => onMenuItemClick("calendar")}
          variant="outlined"
        />
        <IconButton
          sx={{
            color: colors.secondary_accent,
            backgroundColor: colors.primary_bg,
            "&:hover": { backgroundColor: colors.hover_bg },
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
              backgroundColor: colors.primary_bg,
              border: `1px solid ${colors.primary_accent}`,
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              mt: 1,
            },
          }}
        >
          <MenuList sx={{ py: 1 }}>
            {(hasWriteAccess
              ? [
                  { key: "new", icon: AddIcon, label: "New Bill" },
                  { key: "upload", icon: UploadIcon, label: "Upload Bill" },
                  { key: "report", icon: AssessmentIcon, label: "Bill Report" },
                  {
                    key: "calendar",
                    icon: CalendarIcon,
                    label: "Bill Calendar",
                  },
                ]
              : [
                  { key: "report", icon: AssessmentIcon, label: "Bill Report" },
                  {
                    key: "calendar",
                    icon: CalendarIcon,
                    label: "Bill Calendar",
                  },
                ]
            ).map(({ key, icon: Icon, label }) => (
              <MenuItem
                key={key}
                onClick={() => onMenuItemClick(key)}
                sx={{
                  color: colors.primary_text,
                  px: 3,
                  py: 1.5,
                  "&:hover": { backgroundColor: colors.hover_bg },
                }}
              >
                <Icon sx={{ mr: 2, color: colors.primary_accent }} />
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
