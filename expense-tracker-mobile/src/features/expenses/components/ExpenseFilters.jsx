import { X } from "lucide-react";
import { AppButton } from "@/shared/components/AppButton";
import { AppBadge } from "@/shared/components/AppBadge";
import { AppCard } from "@/shared/components/AppCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { EXPENSE_FILTER_OPTIONS } from "../config/expenseConfig";

export function ExpenseFilters({ filters = {}, onFilterChange, onClear }) {
  const { t } = useLanguage();

  const handleTypeToggle = (type) => {
    const current = filters.types || [];
    const updated = current.includes(type)
      ? current.filter((x) => x !== type)
      : [...current, type];
    onFilterChange({ ...filters, types: updated });
  };

  const activeCount = Object.values(filters).filter(
    (v) => v && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <AppCard className="p-3 mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{t("common.filters")}</span>
        {activeCount > 0 && (
          <AppButton variant="ghost" size="sm" onClick={onClear}>
            <X className="h-3 w-3 mr-1" />
            {t("common.clearAll")}
          </AppButton>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <span className="text-xs text-muted-foreground mb-1 block">
            {t("expenses.form.type")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {EXPENSE_FILTER_OPTIONS.types.map((type) => (
              <AppBadge
                key={type}
                variant={filters.types?.includes(type) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => handleTypeToggle(type)}
              >
                {t(`expenses.types.${type.toLowerCase()}`)}
              </AppBadge>
            ))}
          </div>
        </div>
      </div>
    </AppCard>
  );
}

export default ExpenseFilters;
