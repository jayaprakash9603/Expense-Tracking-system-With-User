import React from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { useReportCharts } from "@/features/reports/hooks/useReportCharts";
import { MonthlyReportCharts } from "@/features/reports/components/MonthlyReportCharts";

export function MonthlyReportPage() {
  const { monthly, category } = useReportCharts("monthly");

  return (
    <PageContainer>
      <MonthlyReportCharts monthly={monthly} category={category} />
    </PageContainer>
  );
}

export default MonthlyReportPage;
