import React from "react";
import { Card, CardContent, Typography, Chip } from "@mui/material";

const KPICard = ({ title, value, subtitle, change, trend, icon, color }) => {
  return (
    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(20, 184, 166, 0.3)",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(20, 184, 166, 0.15)",
        },
      }}
    >
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: `${color}20` }}
            >
              {React.cloneElement(icon, {
                sx: { color: color, fontSize: "1.5rem" },
              })}
            </div>
          </div>
          <Chip
            label={change}
            size="small"
            sx={{
              backgroundColor: trend === "up" ? "#10b98120" : "#ef444420",
              color: trend === "up" ? "#10b981" : "#ef4444",
              fontSize: "0.75rem",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
          />
        </div>
        <Typography
          variant="h4"
          sx={{
            color: "white",
            fontWeight: "bold",
            mb: 1,
            transition: "color 0.3s ease",
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: "#aaa", mb: 2 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: color }}>
          {subtitle}
        </Typography>
      </CardContent>
      {/* Slower animated background gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${color}00 0%, ${color} 50%, ${color}00 100%)`,
          animation: "shimmer 4s ease-in-out infinite",
        }}
      />
    </Card>
  );
};

export default KPICard;
