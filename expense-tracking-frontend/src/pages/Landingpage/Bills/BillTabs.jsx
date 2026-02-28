import React from "react";
import { Paper, Tabs, Tab } from "@mui/material";
import {
  List as ListIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

const BillTabs = ({ activeTab, onTabChange, billStats }) => {
  const { colors } = useTheme();

  return (
    <Paper
      sx={{
        mb: 2,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        backgroundColor: colors.primary_bg,
        border: "none",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        variant="fullWidth"
        sx={{
          "& .MuiTab-root": {
            fontWeight: 600,
            fontSize: "1rem",
            textTransform: "none",
            py: 2,
            minHeight: 60,
            color: colors.secondary_text,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&.Mui-selected": {
              color: colors.primary_accent,
              transform: "scale(1.02)",
            },
            "&:hover": {
              color: colors.primary_accent,
              backgroundColor: `${colors.primary_accent}14`,
            },
          },
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
            backgroundColor: colors.primary_accent,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          "& .MuiTabs-flexContainer": {
            position: "relative",
          },
          // Add smooth background transition for the entire tab container
          transition: "background-color 0.3s ease",
        }}
      >
        <Tab
          icon={<ListIcon />}
          iconPosition="start"
          label={`All Bills (${billStats?.total || 0})`}
          sx={{
            "& .MuiSvgIcon-root": {
              transition: "transform 0.2s ease", // Icon animation
            },
            "&.Mui-selected .MuiSvgIcon-root": {
              transform: "rotate(360deg)", // Icon rotation on selection
            },
          }}
        />
        <Tab
          icon={<TrendingUpIcon />}
          iconPosition="start"
          label={`Income (${billStats?.income || 0})`}
          sx={{
            "& .MuiSvgIcon-root": {
              transition: "transform 0.2s ease",
            },
            "&.Mui-selected .MuiSvgIcon-root": {
              transform: "translateY(-2px)", // Upward movement for income
            },
          }}
        />
        <Tab
          icon={<TrendingDownIcon />}
          iconPosition="start"
          label={`Expense (${billStats?.expense || 0})`}
          sx={{
            "& .MuiSvgIcon-root": {
              transition: "transform 0.2s ease",
            },
            "&.Mui-selected .MuiSvgIcon-root": {
              transform: "translateY(2px)", // Downward movement for expense
            },
          }}
        />
      </Tabs>
    </Paper>
  );
};

export default BillTabs;
