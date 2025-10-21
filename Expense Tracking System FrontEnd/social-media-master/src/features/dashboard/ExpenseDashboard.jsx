import React from "react";
import { DashboardProvider } from "./DashboardProvider";
import DashboardContent from "./DashboardContent";
import "./ExpenseDashboard.css";

// Feature-scoped dashboard entry: wraps content in provider and feature CSS.
export default function ExpenseDashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
