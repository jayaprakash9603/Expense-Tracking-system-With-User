import React from "react";
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";

/**
 * AppDialog - Base wrapper for MUI Dialog component
 *
 * Provides consistent theming and standardized layout across the application.
 *
 * @example
 * <AppDialog
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="Edit Expense"
 *   actions={
 *     <>
 *       <SecondaryButton onClick={handleClose}>Cancel</SecondaryButton>
 *       <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
 *     </>
 *   }
 * >
 *   <form>...</form>
 * </AppDialog>
 */
const AppDialog = React.forwardRef(
  (
    {
      open,
      onClose,
      title,
      children,
      actions,
      maxWidth = "sm",
      fullWidth = true,
      showCloseButton = true,
      dividers = false,
      disableBackdropClick = false,
      disableEscapeKeyDown = false,
      sx = {},
      titleSx = {},
      contentSx = {},
      actionsSx = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();

    const handleClose = (event, reason) => {
      if (disableBackdropClick && reason === "backdropClick") {
        return;
      }
      if (disableEscapeKeyDown && reason === "escapeKeyDown") {
        return;
      }
      onClose?.(event, reason);
    };

    const dialogPaperSx = {
      backgroundColor: colors.card_bg || colors.primary_bg || "#1f1f23",
      backgroundImage: "none",
      borderRadius: "12px",
      border: `1px solid ${colors.border_color || "rgba(255, 255, 255, 0.1)"}`,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      ...sx,
    };

    const titleStyles = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 24px",
      borderBottom: dividers
        ? `1px solid ${colors.border_color || "rgba(255, 255, 255, 0.1)"}`
        : "none",
      ...titleSx,
    };

    const contentStyles = {
      padding: "24px",
      color: colors.primary_text || "#fff",
      ...contentSx,
    };

    const actionsStyles = {
      padding: "16px 24px",
      borderTop: dividers
        ? `1px solid ${colors.border_color || "rgba(255, 255, 255, 0.1)"}`
        : "none",
      gap: "12px",
      ...actionsSx,
    };

    return (
      <MuiDialog
        ref={ref}
        open={open}
        onClose={handleClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        PaperProps={{
          sx: dialogPaperSx,
        }}
        {...restProps}
      >
        {title && (
          <DialogTitle sx={titleStyles} component="div">
            <Typography
              variant="h6"
              component="span"
              sx={{
                color: colors.primary_text || "#fff",
                fontWeight: 600,
                fontSize: "1.125rem",
              }}
            >
              {title}
            </Typography>
            {showCloseButton && (
              <IconButton
                aria-label="close"
                onClick={(e) => handleClose(e, "closeButton")}
                sx={{
                  color: colors.secondary_text || "#9ca3af",
                  marginRight: "-8px",
                  "&:hover": {
                    color: colors.primary_text || "#fff",
                    backgroundColor:
                      colors.hover_bg || "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </DialogTitle>
        )}

        <DialogContent sx={contentStyles} dividers={dividers}>
          {children}
        </DialogContent>

        {actions && <DialogActions sx={actionsStyles}>{actions}</DialogActions>}
      </MuiDialog>
    );
  },
);

AppDialog.displayName = "AppDialog";

AppDialog.propTypes = {
  /** Whether the dialog is open */
  open: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func,
  /** Dialog title */
  title: PropTypes.node,
  /** Dialog content */
  children: PropTypes.node,
  /** Action buttons (footer) */
  actions: PropTypes.node,
  /** Max width of dialog */
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", false]),
  /** Whether dialog takes full width of maxWidth */
  fullWidth: PropTypes.bool,
  /** Show close button in title */
  showCloseButton: PropTypes.bool,
  /** Show dividers between sections */
  dividers: PropTypes.bool,
  /** Disable closing on backdrop click */
  disableBackdropClick: PropTypes.bool,
  /** Disable closing on escape key */
  disableEscapeKeyDown: PropTypes.bool,
  /** Additional styles for dialog paper */
  sx: PropTypes.object,
  /** Additional styles for title */
  titleSx: PropTypes.object,
  /** Additional styles for content */
  contentSx: PropTypes.object,
  /** Additional styles for actions */
  actionsSx: PropTypes.object,
};

export default AppDialog;
