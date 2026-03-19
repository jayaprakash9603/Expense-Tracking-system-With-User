import React from "react";
import { PageContainer } from "@/shared/components/PageContainer";
import { useReportCharts } from "@/features/reports/hooks/useReportCharts";
import { PaymentReportCharts } from "@/features/reports/components/PaymentReportCharts";

export function PaymentReportPage() {
  const { cashFlow } = useReportCharts("payment");
  return (
    <PageContainer>
      <PaymentReportCharts cashFlow={cashFlow} />
    </PageContainer>
  );
}

export default PaymentReportPage;
