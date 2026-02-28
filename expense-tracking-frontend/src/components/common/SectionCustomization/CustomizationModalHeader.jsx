import React from "react";
import {
  DialogTitle,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { getHeaderStyles } from "./customizationStyles";

/**
 * CustomizationModalHeader - Reusable modal header
 * Follows Interface Segregation: Minimal props for specific purpose
 */
const CustomizationModalHeader = ({
  title,
  subtitle,
  icon: IconComponent,
  onClose,
  colors,
  isDark,
  isMobile = false,
}) => {
  const styles = getHeaderStyles(colors, isDark);

  return (
    <DialogTitle
      sx={{
        ...styles.container,
        pb: isMobile ? 1.5 : 2.5,
        pt: isMobile ? 2 : 3,
        px: isMobile ? 2 : 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: isMobile ? 1.5 : 2,
        }}
      >
        {IconComponent && (
          <Box
            sx={{
              ...styles.iconBox,
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
            }}
          >
            <IconComponent
              sx={{ color: "#14b8a6", fontSize: isMobile ? 22 : 28 }}
            />
          </Box>
        )}
        <Box>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            fontWeight="700"
            sx={{
              color: colors.primary_text,
              mb: 0.5,
              fontSize: isMobile ? "1.1rem" : undefined,
            }}
          >
            {title}
          </Typography>
          {subtitle && !isMobile && (
            <Typography
              variant="body2"
              sx={{
                color: colors.secondary_text,
                fontWeight: 400,
                letterSpacing: 0.2,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Tooltip title="Close" arrow placement="left">
        <IconButton onClick={onClose} size="small" sx={styles.closeButton}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </DialogTitle>
  );
};

export default React.memo(CustomizationModalHeader);
