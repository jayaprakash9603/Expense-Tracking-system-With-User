/**
 * StatsCard - Reusable statistics card component for share pages
 */
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";

const StatsCard = ({ title, value, color, icon: Icon }) => {
  const { colors } = useTheme();

  return (
    <Card
      sx={{
        backgroundColor: colors.cardBackground,
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        height: "100%",
      }}
    >
      <CardContent sx={{ textAlign: "center", py: 2 }}>
        {Icon && (
          <Icon
            sx={{
              fontSize: 24,
              color: color || colors.primary,
              mb: 0.5,
            }}
          />
        )}
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: color || colors.primary }}
        >
          {value ?? 0}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
