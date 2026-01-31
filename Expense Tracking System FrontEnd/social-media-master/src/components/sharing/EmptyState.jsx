/**
 * EmptyState - Reusable empty state component for share pages
 */
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();

  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      {Icon && (
        <Icon
          sx={{
            fontSize: 80,
            color: colors.textTertiary,
            mb: 2,
          }}
        />
      )}
      <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 1 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: actionLabel ? 3 : 0, maxWidth: 400, mx: "auto" }}
      >
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 2 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
