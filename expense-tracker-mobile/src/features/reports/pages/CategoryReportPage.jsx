import React from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { useReportCharts } from "@/features/reports/hooks/useReportCharts";
import { CategoryReportCharts } from "@/features/reports/components/charts/CategoryReportCharts";

export function CategoryReportPage() {
  const { category } = useReportCharts("category");
  return (
    <PageContainer>
      <CategoryReportCharts category={category} />
    </PageContainer>
  );
}

export default CategoryReportPage;
