import React from "react";
import { PageContainer } from "@/shared/components/PageContainer";
import { useReportCharts } from "@/features/reports/hooks/useReportCharts";
import { TrendAnalysisCharts } from "@/features/reports/components/TrendAnalysisCharts";

export function TrendReportPage() {
  const { daily, monthly } = useReportCharts("trend");
  return (
    <PageContainer>
      <TrendAnalysisCharts daily={daily} monthly={monthly} />
    </PageContainer>
  );
}

export default TrendReportPage;
