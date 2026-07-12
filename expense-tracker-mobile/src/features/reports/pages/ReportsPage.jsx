import React from "react";
import { useNavigate } from "react-router-dom";
import { ListScreen } from "@/shared/components/templates/ListScreen";
import { AppCard } from "@/shared/components/display/AppCard";
import { ResponsiveGrid } from "@/shared/components/layout/ResponsiveGrid";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { BarChart3, PieChart, TrendingUp, CreditCard, Wallet, Receipt } from "lucide-react";
import { REPORT_TYPES } from "@/features/reports/config/reportConfig";

const ICONS = {
  monthly: BarChart3,
  category: PieChart,
  payment: CreditCard,
  trend: TrendingUp,
  allBudgets: Wallet,
  bills: Receipt,
};

export function ReportsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <ListScreen
      title={t("navigation.reports")}
      description={t("reports.generateReports")}
      status="success"
      hasData={REPORT_TYPES.length > 0}
      emptyProps={{
        title: t("reports.emptyListTitle"),
        description: t("reports.noData"),
      }}
    >
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap="md" preset="">
        {REPORT_TYPES.map((report) => (
          <AppCard
            key={report.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate(report.path)}
          >
            <AppCard.Content className="flex flex-col items-center py-6 gap-3">
              <AppIcon icon={ICONS[report.id]} color="primary" size="xl" />
              <p className="text-sm font-medium">{t(report.labelKey)}</p>
            </AppCard.Content>
          </AppCard>
        ))}
      </ResponsiveGrid>
    </ListScreen>
  );
}

export default ReportsPage;
