/**
 * DetailDrawer - Theme-aware right-side detail/drilldown drawer
 *
 * Usage:
 *   <DetailDrawer
 *     open={isOpen}
 *     onClose={handleClose}
 *     title="Transaction Details"
 *     subtitle="Jan 15, 2024"
 *     onCopy={handleCopy}
 *     onExport={handleExport}
 *   >
 *     <DetailSection>...</DetailSection>
 *   </DetailDrawer>
 *
 * Features:
 * - Right anchor by default (detail panel pattern)
 * - Copy/Export actions in header
 * - Loading state support
 * - Empty state handling
 */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  Divider,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AppDrawer from "./AppDrawer";
import { useTheme } from "../../../hooks/useTheme";

const DetailDrawer = forwardRef(function DetailDrawer(
  {
    // Core
    open = false,
    onClose,
    children,

    // Header
    title,
    subtitle,
    icon, // Icon element next to title

    // Actions
    onCopy,
    onExport,
    copyTooltip = "Copy to clipboard",
    exportTooltip = "Export data",
    customActions, // Additional custom action buttons

    // States
    loading = false,
    loadingRows = 5,
    empty = false,
    emptyTitle = "No data available",
    emptyMessage = "There's nothing to display here.",

    // Styling
    width = 440,

    // Pass-through
    ...rest
  },
  ref,
) {
  const { colors } = useTheme();

  // Header actions (copy, export, custom)
  const headerActions = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {onCopy && (
        <Tooltip title={copyTooltip} arrow>
          <IconButton
            onClick={onCopy}
            size="small"
            sx={{
              color: colors.secondary_text,
              "&:hover": {
                color: colors.primary_text,
                backgroundColor: colors.secondary_bg,
              },
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onExport && (
        <Tooltip title={exportTooltip} arrow>
          <IconButton
            onClick={onExport}
            size="small"
            sx={{
              color: colors.secondary_text,
              "&:hover": {
                color: colors.primary_text,
                backgroundColor: colors.secondary_bg,
              },
            }}
          >
            <FileDownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {customActions}
    </Box>
  );

  // Custom header with icon
  const headerContent = icon ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 1,
          backgroundColor: colors.secondary_bg,
          color: colors.primary_accent,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: "0.95rem",
            color: colors.primary_text,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              opacity: 0.75,
              fontSize: "0.75rem",
              color: colors.secondary_text,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  ) : undefined;

  // Loading state
  if (loading) {
    return (
      <AppDrawer
        ref={ref}
        open={open}
        onClose={onClose}
        anchor="right"
        width={width}
        title={title}
        subtitle={subtitle}
        headerContent={headerContent}
        headerActions={headerActions}
        {...rest}
      >
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rounded" height={100} sx={{ mb: 2 }} />
          {Array.from({ length: loadingRows }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={60}
              sx={{ mb: 1, bgcolor: colors.secondary_bg }}
            />
          ))}
        </Box>
      </AppDrawer>
    );
  }

  // Empty state
  if (empty) {
    return (
      <AppDrawer
        ref={ref}
        open={open}
        onClose={onClose}
        anchor="right"
        width={width}
        title={title}
        subtitle={subtitle}
        headerContent={headerContent}
        headerActions={headerActions}
        {...rest}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 4,
            minHeight: 300,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: colors.primary_text,
              mb: 1,
            }}
          >
            {emptyTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.secondary_text,
              maxWidth: 280,
            }}
          >
            {emptyMessage}
          </Typography>
        </Box>
      </AppDrawer>
    );
  }

  return (
    <AppDrawer
      ref={ref}
      open={open}
      onClose={onClose}
      anchor="right"
      width={width}
      title={title}
      subtitle={subtitle}
      headerContent={headerContent}
      headerActions={headerActions}
      {...rest}
    >
      {children}
    </AppDrawer>
  );
});

/**
 * DetailSection - Section component for organizing detail content
 */
export const DetailSection = ({
  title,
  children,
  padding = true,
  divider = true,
}) => {
  const { colors } = useTheme();

  return (
    <Box>
      {title && (
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            color: colors.secondary_text,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            px: padding ? 2 : 0,
            pt: 2,
            pb: 1,
          }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ px: padding ? 2 : 0, pb: padding ? 2 : 0 }}>{children}</Box>
      {divider && <Divider sx={{ borderColor: colors.border_color }} />}
    </Box>
  );
};

DetailSection.propTypes = {
  /** Section title */
  title: PropTypes.string,
  /** Section content */
  children: PropTypes.node,
  /** Apply padding */
  padding: PropTypes.bool,
  /** Show divider after section */
  divider: PropTypes.bool,
};

/**
 * DetailItem - Key-value pair for detail display
 */
export const DetailItem = ({ label, value, valueColor, bold = false }) => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.75,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: colors.secondary_text,
          fontSize: "0.8rem",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: valueColor || colors.primary_text,
          fontWeight: bold ? 600 : 400,
          fontSize: "0.8rem",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

DetailItem.propTypes = {
  /** Label text */
  label: PropTypes.string.isRequired,
  /** Value to display */
  value: PropTypes.node.isRequired,
  /** Custom color for value */
  valueColor: PropTypes.string,
  /** Bold value text */
  bold: PropTypes.bool,
};

DetailDrawer.propTypes = {
  /** Whether drawer is open */
  open: PropTypes.bool.isRequired,
  /** Close handler */
  onClose: PropTypes.func.isRequired,
  /** Drawer content */
  children: PropTypes.node,

  // Header
  /** Header title */
  title: PropTypes.node,
  /** Header subtitle */
  subtitle: PropTypes.node,
  /** Icon next to title */
  icon: PropTypes.node,

  // Actions
  /** Copy handler */
  onCopy: PropTypes.func,
  /** Export handler */
  onExport: PropTypes.func,
  /** Copy tooltip */
  copyTooltip: PropTypes.string,
  /** Export tooltip */
  exportTooltip: PropTypes.string,
  /** Additional custom action buttons */
  customActions: PropTypes.node,

  // States
  /** Show loading skeleton */
  loading: PropTypes.bool,
  /** Number of loading skeleton rows */
  loadingRows: PropTypes.number,
  /** Show empty state */
  empty: PropTypes.bool,
  /** Empty state title */
  emptyTitle: PropTypes.string,
  /** Empty state message */
  emptyMessage: PropTypes.string,

  // Styling
  /** Width on desktop */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default DetailDrawer;
