import React from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/shared/components/PageContainer";
import { AppCard } from "@/shared/components/AppCard";
import { ResponsiveGrid } from "@/shared/components/ResponsiveGrid";
import { AppIcon } from "@/shared/components/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { BarChart3, PieChart, TrendingUp, CreditCard } from "lucide-react";
import { REPORT_TYPES } from "@/features/reports/config/reportConfig";

const ICONS = { monthly: BarChart3, category: PieChart, payment: CreditCard, trend: TrendingUp };

export function ReportsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
        {REPORT_TYPES.map((report) => (
          <AppCard key={report.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate(report.path)}>
            <AppCard.Content className="flex flex-col items-center py-6 gap-3">
              <AppIcon icon={ICONS[report.id]} color="primary" size="xl" />
              <p className="text-sm font-medium">{t(report.labelKey)}</p>
            </AppCard.Content>
          </AppCard>
        ))}
      </ResponsiveGrid>
    </PageContainer>
  );
}

export default ReportsPage;
