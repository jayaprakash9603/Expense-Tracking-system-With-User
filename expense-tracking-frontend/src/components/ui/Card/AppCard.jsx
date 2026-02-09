import React from "react";
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
} from "@mui/material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";

/**
 * AppCard - Base wrapper for MUI Card component
 *
 * Provides consistent theming across the application.
 *
 * @example
 * <AppCard>
 *   <p>Card content here</p>
 * </AppCard>
 *
 * <AppCard title="Budget Summary" action={<IconButton>...</IconButton>}>
 *   <p>Card with header</p>
 * </AppCard>
 */
const AppCard = React.forwardRef(
  (
    {
      children,
      title,
      subheader,
      avatar,
      action,
      footer,
      variant = "elevation",
      elevation = 0,
      padding = "default",
      onClick,
      sx = {},
      headerSx = {},
      contentSx = {},
      footerSx = {},
      ...restProps
    },
    ref,
  ) => {
    const { colors } = useTheme();

    // Padding configurations
    const paddingConfig = {
      none: 0,
      small: "12px",
      default: "16px",
      large: "24px",
    };

    const currentPadding = paddingConfig[padding] || paddingConfig.default;

    const cardStyles = {
      backgroundColor: colors.card_bg || colors.secondary_bg || "#1f1f23",
      borderRadius: "12px",
      border: `1px solid ${colors.border_color || "rgba(255, 255, 255, 0.1)"}`,
      transition: "all 0.2s ease-in-out",
      ...(onClick && {
        cursor: "pointer",
        "&:hover": {
          borderColor: colors.primary_accent || "#00DAC6",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        },
      }),
      ...sx,
    };

    const headerStyles = {
      padding: currentPadding,
      paddingBottom: children ? "8px" : currentPadding,
      "& .MuiCardHeader-title": {
        color: colors.primary_text || "#fff",
        fontSize: "1rem",
        fontWeight: 600,
      },
      "& .MuiCardHeader-subheader": {
        color: colors.secondary_text || "#9ca3af",
        fontSize: "0.875rem",
      },
      ...headerSx,
    };

    const contentStyles = {
      padding: currentPadding,
      paddingTop: title ? "8px" : currentPadding,
      color: colors.primary_text || "#fff",
      "&:last-child": {
        paddingBottom: currentPadding,
      },
      ...contentSx,
    };

    const actionsStyles = {
      padding: currentPadding,
      paddingTop: "8px",
      borderTop: `1px solid ${colors.border_color || "rgba(255, 255, 255, 0.1)"}`,
      ...footerSx,
    };

    return (
      <MuiCard
        ref={ref}
        variant={variant}
        elevation={elevation}
        onClick={onClick}
        sx={cardStyles}
        {...restProps}
      >
        {(title || subheader || avatar || action) && (
          <CardHeader
            title={title}
            subheader={subheader}
            avatar={avatar}
            action={action}
            sx={headerStyles}
          />
        )}

        {children && <CardContent sx={contentStyles}>{children}</CardContent>}

        {footer && <CardActions sx={actionsStyles}>{footer}</CardActions>}
      </MuiCard>
    );
  },
);

AppCard.displayName = "AppCard";

AppCard.propTypes = {
  /** Card content */
  children: PropTypes.node,
  /** Card title */
  title: PropTypes.node,
  /** Card subheader */
  subheader: PropTypes.node,
  /** Avatar element for header */
  avatar: PropTypes.node,
  /** Action element for header (e.g., IconButton) */
  action: PropTypes.node,
  /** Footer content */
  footer: PropTypes.node,
  /** Card variant */
  variant: PropTypes.oneOf(["elevation", "outlined"]),
  /** Elevation level */
  elevation: PropTypes.number,
  /** Padding size */
  padding: PropTypes.oneOf(["none", "small", "default", "large"]),
  /** Click handler (makes card clickable) */
  onClick: PropTypes.func,
  /** Additional MUI sx styles */
  sx: PropTypes.object,
  /** Additional styles for header */
  headerSx: PropTypes.object,
  /** Additional styles for content */
  contentSx: PropTypes.object,
  /** Additional styles for footer */
  footerSx: PropTypes.object,
};

export default AppCard;
