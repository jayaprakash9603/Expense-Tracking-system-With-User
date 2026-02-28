import React from "react";
import { DialogActions, Box, Button, Divider, Tooltip } from "@mui/material";
import {
  RestartAlt as ResetIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { getButtonStyles } from "./customizationStyles";

/**
 * CustomizationModalFooter - Reusable modal footer with actions
 * Follows Single Responsibility: Only handles footer actions
 */
const CustomizationModalFooter = ({
  onSave,
  onReset,
  onCancel,
  colors,
  isDark,
  labels = {
    save: "Save Layout",
    reset: "Reset to Default",
    cancel: "Cancel",
  },
  showReset = true,
  isMobile = false,
}) => {
  return (
    <>
      <Divider sx={{ borderColor: colors.border_color }} />
      <DialogActions
        sx={{
          p: isMobile ? 2 : 3,
          gap: isMobile ? 1 : 1.5,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          background: isDark
            ? "linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.03) 100%)"
            : "linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.02) 100%)",
        }}
      >
        {/* On mobile, primary actions first */}
        {isMobile ? (
          <>
            <Button
              variant="contained"
              onClick={onSave}
              fullWidth
              startIcon={<CheckCircleIcon />}
              sx={{
                ...getButtonStyles(isDark, colors, "primary"),
                py: 1.2,
              }}
            >
              {labels.save}
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
              fullWidth
              sx={getButtonStyles(isDark, colors, "secondary")}
            >
              {labels.cancel}
            </Button>
            {showReset && (
              <Button
                variant="outlined"
                startIcon={<ResetIcon />}
                onClick={onReset}
                fullWidth
                sx={{
                  ...getButtonStyles(isDark, colors, "danger"),
                  mt: 1,
                }}
              >
                {labels.reset}
              </Button>
            )}
          </>
        ) : (
          <>
            {showReset && (
              <Tooltip title="Restore default layout" arrow>
                <Button
                  variant="outlined"
                  startIcon={<ResetIcon />}
                  onClick={onReset}
                  sx={getButtonStyles(isDark, colors, "danger")}
                >
                  {labels.reset}
                </Button>
              </Tooltip>
            )}
            <Box sx={{ flex: 1 }} />
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={getButtonStyles(isDark, colors, "secondary")}
            >
              {labels.cancel}
            </Button>
            <Button
              variant="contained"
              onClick={onSave}
              startIcon={<CheckCircleIcon />}
              sx={getButtonStyles(isDark, colors, "primary")}
            >
              {labels.save}
            </Button>
          </>
        )}
      </DialogActions>
    </>
  );
};

export default React.memo(CustomizationModalFooter);
