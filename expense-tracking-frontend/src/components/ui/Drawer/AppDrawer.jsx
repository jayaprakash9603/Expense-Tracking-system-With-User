/**
 * AppDrawer - Theme-aware base drawer component
 *
 * Usage:
 *   <AppDrawer
 *     open={isOpen}
 *     onClose={handleClose}
 *     anchor="right"
 *     title="Detail View"
 *     subtitle="View and edit details"
 *   >
 *     <YourContent />
 *   </AppDrawer>
 *
 * Features:
 * - Theme integration via useTheme hook
 * - Left/right anchor support
 * - Built-in header with close button
 * - Optional footer with actions
 * - Responsive width (full on mobile)
 * - Custom scrollbar styling
 */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { Drawer, Box, Typography, IconButton, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "../../../hooks/useTheme";

const AppDrawer = forwardRef(function AppDrawer(
  {
    // Core
    open = false,
    onClose,
    anchor = "right", // 'left' | 'right'
    children,

    // Header
    title,
    subtitle,
    headerContent, // Custom header content (replaces title/subtitle)
    headerActions, // Actions next to close button
    showCloseButton = true,
    showHeader = true,

    // Footer
    footer, // Footer content
    showFooter = false,

    // Styling
    width = 400,
    maxWidth,
    showDivider = true,

    // Pass-through
    PaperProps,
    sx,
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();

  // Scrollbar styling
  const scrollbarSx = {
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: colors.border_color,
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: colors.secondary_text,
    },
  };

  return (
    <Drawer
      ref={ref}
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        ...PaperProps,
        sx: {
          width: { xs: "100%", sm: width },
          maxWidth: maxWidth || { xs: "100%", sm: width },
          backgroundColor: colors.primary_bg,
          color: colors.primary_text,
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
          ...scrollbarSx,
          ...PaperProps?.sx,
        },
      }}
      sx={sx}
      {...rest}
    >
      {/* Header */}
      {showHeader && (title || subtitle || headerContent) && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              p: 2,
              gap: 1,
              flexShrink: 0,
            }}
          >
            {/* Title area or custom header */}
            {headerContent || (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {title && (
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: colors.primary_text,
                    }}
                  >
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.75,
                      fontSize: "0.8rem",
                      color: colors.secondary_text,
                      mt: 0.25,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}

            {/* Header actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {headerActions}
              {showCloseButton && (
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{
                    color: colors.secondary_text,
                    "&:hover": {
                      color: colors.primary_text,
                      backgroundColor: colors.secondary_bg,
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          {showDivider && <Divider sx={{ borderColor: colors.border_color }} />}
        </>
      )}

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          ...scrollbarSx,
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      {showFooter && footer && (
        <>
          <Divider sx={{ borderColor: colors.border_color }} />
          <Box
            sx={{
              p: 2,
              flexShrink: 0,
              backgroundColor: colors.secondary_bg,
            }}
          >
            {footer}
          </Box>
        </>
      )}
    </Drawer>
  );
});

AppDrawer.propTypes = {
  /** Whether drawer is open */
  open: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Anchor position */
  anchor: PropTypes.oneOf(["left", "right"]),
  /** Drawer content */
  children: PropTypes.node,

  // Header
  /** Header title */
  title: PropTypes.node,
  /** Header subtitle */
  subtitle: PropTypes.node,
  /** Custom header content (replaces title/subtitle) */
  headerContent: PropTypes.node,
  /** Actions displayed in header */
  headerActions: PropTypes.node,
  /** Show close button */
  showCloseButton: PropTypes.bool,
  /** Show header section */
  showHeader: PropTypes.bool,

  // Footer
  /** Footer content */
  footer: PropTypes.node,
  /** Show footer section */
  showFooter: PropTypes.bool,

  // Styling
  /** Width on desktop */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Max width */
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Show divider below header */
  showDivider: PropTypes.bool,

  /** MUI Drawer PaperProps */
  PaperProps: PropTypes.object,
  /** Custom styles */
  sx: PropTypes.object,
};

export default AppDrawer;
