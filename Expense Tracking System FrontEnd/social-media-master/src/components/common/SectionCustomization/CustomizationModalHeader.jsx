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
}) => {
  const styles = getHeaderStyles(colors, isDark);

  return (
    <DialogTitle sx={styles.container}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        {IconComponent && (
          <Box sx={styles.iconBox}>
            <IconComponent sx={{ color: "#14b8a6", fontSize: 28 }} />
          </Box>
        )}
        <Box>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{ color: colors.primary_text, mb: 0.5 }}
          >
            {title}
          </Typography>
          {subtitle && (
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
