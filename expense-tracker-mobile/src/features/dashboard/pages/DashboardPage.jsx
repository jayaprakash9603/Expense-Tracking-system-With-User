import React from "react";
import { DashboardProvider } from "@/features/dashboard/context/DashboardContext";
import { DashboardPageContent } from "@/features/dashboard/pages/DashboardPageContent";

export function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardPageContent />
    </DashboardProvider>
  );
}

export default DashboardPage;
