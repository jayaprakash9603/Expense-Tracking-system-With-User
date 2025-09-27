import React from 'react';
import { Paper, Tabs, Tab } from '@mui/material';
import {
  List as ListIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const BillTabs = ({ activeTab, onTabChange, billStats }) => {
  return (
    <Paper
      sx={{
        mb: 2,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        backgroundColor: "#1b1b1b",
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
            color: "#b0b0b0",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth transition for tab content
            "&.Mui-selected": {
              color: "#14b8a6",
              transform: "scale(1.02)", // Subtle scale effect on active tab
            },
            "&:hover": {
              color: "#14b8a6",
              backgroundColor: "rgba(20, 184, 166, 0.08)", // Hover effect
            },
          },
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
            backgroundColor: "#14b8a6",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth indicator animation
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