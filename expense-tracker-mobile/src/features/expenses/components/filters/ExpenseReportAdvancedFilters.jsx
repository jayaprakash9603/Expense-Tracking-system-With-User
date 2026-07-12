import React, { useMemo } from "react";
import { AppSelect } from "@/shared/components/form/AppSelect";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import {
  EXPENSE_REPORT_COMBINE_BELOW_OPTIONS,
  EXPENSE_REPORT_TOP_OPTIONS,
  EXPENSE_REPORT_TREND_MIN_OPTIONS,
} from "@/features/expenses/constants/expenseReportViewFilterDefaults";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "h-10 w-full min-w-0 border-border bg-background text-sm shadow-sm sm:h-9";

function mapOpts(keys, t) {
  return keys.map((o) => ({ value: o.value, label: t(o.labelKey) }));
}

export function ExpenseReportAdvancedFilters({ value, onChange, className }) {
  const { t } = useLanguage();
  const topOpts = useMemo(() => mapOpts(EXPENSE_REPORT_TOP_OPTIONS, t), [t]);
  const combineOpts = useMemo(() => mapOpts(EXPENSE_REPORT_COMBINE_BELOW_OPTIONS, t), [t]);
  const trendOpts = useMemo(() => mapOpts(EXPENSE_REPORT_TREND_MIN_OPTIONS, t), [t]);

  const patch = (partial) => onChange({ ...value, ...partial });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div>
        <p className="mb-2 text-xs font-medium text-foreground">{t("reports.viewFilters.sectionTitle")}</p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1.5 text-[0.6875rem] text-muted-foreground">{t("reports.viewFilters.categorySection")}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                  {t("reports.viewFilters.categoryTop")}
                </p>
                <AppSelect
                  value={value.categoryTop}
                  onChange={(v) => patch({ categoryTop: v })}
                  options={topOpts}
                  triggerClassName={SELECT_CLASS}
                />
              </div>
              <div>
                <p className="mb-1 text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                  {t("reports.viewFilters.categoryCombine")}
                </p>
                <AppSelect
                  value={value.categoryGroupBelow}
                  onChange={(v) => patch({ categoryGroupBelow: v })}
                  options={combineOpts}
                  triggerClassName={SELECT_CLASS}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[0.6875rem] text-muted-foreground">{t("reports.viewFilters.paymentSection")}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                  {t("reports.viewFilters.paymentTop")}
                </p>
                <AppSelect
                  value={value.paymentTop}
                  onChange={(v) => patch({ paymentTop: v })}
                  options={topOpts}
                  triggerClassName={SELECT_CLASS}
                />
              </div>
              <div>
                <p className="mb-1 text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                  {t("reports.viewFilters.paymentCombine")}
                </p>
                <AppSelect
                  value={value.paymentGroupBelow}
                  onChange={(v) => patch({ paymentGroupBelow: v })}
                  options={combineOpts}
                  triggerClassName={SELECT_CLASS}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[0.6875rem] text-muted-foreground">{t("reports.viewFilters.trendFloor")}</p>
            <AppSelect
              value={value.trendMinAmount}
              onChange={(v) => patch({ trendMinAmount: v })}
              options={trendOpts}
              triggerClassName={SELECT_CLASS}
            />
            <p className="mt-1.5 text-[0.6875rem] leading-snug text-muted-foreground">
              {t("reports.viewFilters.trendFloorHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
