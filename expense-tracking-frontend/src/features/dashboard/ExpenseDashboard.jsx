import React from "react";
import { useTheme } from "../../hooks/useTheme";
import { DashboardProvider } from "./DashboardProvider";
import DashboardContent from "./DashboardContent";
import "./ExpenseDashboard.css";

// Feature-scoped dashboard entry: wraps content in provider and feature CSS.
export default function ExpenseDashboard() {
  const { colors } = useTheme();

  return (
    <DashboardProvider>
      <div style={{ backgroundColor: colors.primary_bg }}>
        <DashboardContent />
      </div>
    </DashboardProvider>
  );
}
