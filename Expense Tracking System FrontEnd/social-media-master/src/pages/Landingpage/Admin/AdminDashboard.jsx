import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTheme } from "../../../hooks/useTheme";
import SystemAnalytics from "./SystemAnalytics";
import UserManagement from "./UserManagement";
import RoleManagement from "./RoleManagement";
import AuditLogs from "./AuditLogs";
import Reports from "./Reports";
import AdminSettings from "./AdminSettings";

const AdminDashboard = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: "Analytics", icon: <DashboardIcon />, component: <SystemAnalytics /> },
    { label: "Users", icon: <PeopleIcon />, component: <UserManagement /> },
    { label: "Roles", icon: <AdminPanelSettingsIcon />, component: <RoleManagement /> },
    { label: "Audit Logs", icon: <HistoryIcon />, component: <AuditLogs /> },
    { label: "Reports", icon: <BarChartIcon />, component: <Reports /> },
    { label: "Settings", icon: <SettingsIcon />, component: <AdminSettings /> },
  ];

  return (
    <div
      style={{
        backgroundColor: colors.primary_bg,
        minHeight: "100vh",
      }}
    >
      {/* Tab Navigation */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: colors.border,
          backgroundColor: colors.card_bg,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              color: colors.secondary_text,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              minHeight: 64,
            },
            "& .Mui-selected": {
              color: colors.accent,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: colors.accent,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {tabs[activeTab].component}
      </Box>
    </div>
  );
};

export default AdminDashboard;
