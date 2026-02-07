/**
 * AppModal - Theme-aware base modal component using MUI Modal
 *
 * Usage:
 *   <AppModal
 *     open={isOpen}
 *     onClose={handleClose}
 *     title="Modal Title"
 *   >
 *     Modal content here
 *   </AppModal>
 *
 * Features:
 * - Theme integration via useTheme hook
 * - Customizable header with title and close button
 * - Optional footer actions
 * - Size variants (sm, md, lg, xl, fullWidth)
 * - Backdrop configuration
 * - Keyboard escape handling
 */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Fade,
  Backdrop,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

const AppModal = forwardRef(function AppModal(
  {
    // Core props
    open,
    onClose,
    children,

    // Header
    title,
    subtitle,
    headerIcon,
    showCloseButton = true,
    hideHeader = false,

    // Footer
    footer,
    footerAlign = "right", // 'left' | 'center' | 'right' | 'space-between'

    // Sizing
    size = "md", // 'sm' | 'md' | 'lg' | 'xl' | 'fullWidth'
    maxHeight = "90vh",

    // Behavior
    disableBackdropClick = false,
    disableEscapeKeyDown = false,
    keepMounted = false,

    // Transitions
    TransitionComponent = Fade,
    transitionDuration = 300,

    // MUI pass-through
    sx,
    contentSx,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();

  // Size configurations
  const sizeConfig = {
    sm: { width: 400, minWidth: 300 },
    md: { width: 600, minWidth: 400 },
    lg: { width: 800, minWidth: 600 },
    xl: { width: 1000, minWidth: 800 },
    fullWidth: { width: "95%", maxWidth: 1200, minWidth: 300 },
  };

  const dimensions = sizeConfig[size] || sizeConfig.md;

  // Handle close with backdrop check
  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === "backdropClick") {
      return;
    }
    if (disableEscapeKeyDown && reason === "escapeKeyDown") {
      return;
    }
    onClose?.(event, reason);
  };

  // Footer alignment styles
  const footerAlignStyles = {
    left: { justifyContent: "flex-start" },
    center: { justifyContent: "center" },
    right: { justifyContent: "flex-end" },
    "space-between": { justifyContent: "space-between" },
  };

  return (
    <Modal
      ref={ref}
      open={open}
      onClose={handleClose}
      keepMounted={keepMounted}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: transitionDuration,
          sx: {
            backgroundColor: colors.modal_overlay || "rgba(0, 0, 0, 0.7)",
          },
        },
      }}
      sx={sx}
      {...rest}
    >
      <TransitionComponent in={open} timeout={transitionDuration}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: dimensions.width,
            minWidth: dimensions.minWidth,
            maxWidth: dimensions.maxWidth || dimensions.width,
            maxHeight: maxHeight,
            backgroundColor: colors.modal_bg || colors.secondary_bg,
            color: colors.primary_text,
            borderRadius: 3,
            boxShadow: 24,
            outline: "none",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          {!hideHeader && (title || showCloseButton) && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2.5,
                  pb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {headerIcon && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: colors.primary_accent,
                      }}
                    >
                      {headerIcon}
                    </Box>
                  )}
                  <Box>
                    {title && (
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: colors.primary_text,
                          lineHeight: 1.3,
                        }}
                      >
                        {title}
                      </Typography>
                    )}
                    {subtitle && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.secondary_text,
                          mt: 0.25,
                        }}
                      >
                        {subtitle}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {showCloseButton && (
                  <IconButton
                    onClick={(e) => onClose?.(e, "closeButton")}
                    size="small"
                    sx={{
                      color: colors.secondary_text,
                      "&:hover": {
                        backgroundColor: colors.hover_bg,
                        color: colors.primary_text,
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
              <Divider sx={{ borderColor: colors.border_color }} />
            </>
          )}

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2.5,
              ...contentSx,
            }}
          >
            {children}
          </Box>

          {/* Footer */}
          {footer && (
            <>
              <Divider sx={{ borderColor: colors.border_color }} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  ...footerAlignStyles[footerAlign],
                }}
              >
                {footer}
              </Box>
            </>
          )}
        </Box>
      </TransitionComponent>
    </Modal>
  );
});

AppModal.propTypes = {
  /** Control visibility */
  open: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Modal content */
  children: PropTypes.node,
  /** Modal title */
  title: PropTypes.node,
  /** Subtitle below title */
  subtitle: PropTypes.string,
  /** Icon displayed before title */
  headerIcon: PropTypes.node,
  /** Show close button in header */
  showCloseButton: PropTypes.bool,
  /** Hide the entire header */
  hideHeader: PropTypes.bool,
  /** Footer content (usually action buttons) */
  footer: PropTypes.node,
  /** Footer content alignment */
  footerAlign: PropTypes.oneOf(["left", "center", "right", "space-between"]),
  /** Modal size preset */
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "fullWidth"]),
  /** Maximum height */
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Disable closing on backdrop click */
  disableBackdropClick: PropTypes.bool,
  /** Disable closing on escape key */
  disableEscapeKeyDown: PropTypes.bool,
  /** Keep modal mounted when closed */
  keepMounted: PropTypes.bool,
  /** Custom transition component */
  TransitionComponent: PropTypes.elementType,
  /** Transition duration in ms */
  transitionDuration: PropTypes.number,
  /** Container styles */
  sx: PropTypes.object,
  /** Content area styles */
  contentSx: PropTypes.object,
};

export default AppModal;
