import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function ExpenseReportSubtitle() {
  const { t } = useLanguage();
  return (
    <span className="text-[0.6875rem] leading-snug text-muted-foreground md:text-xs">{t("reports.expenseReportsSubtitle")}</span>
  );
}
