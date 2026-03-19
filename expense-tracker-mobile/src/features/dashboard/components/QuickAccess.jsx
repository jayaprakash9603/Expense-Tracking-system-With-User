import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Receipt, FileText, Upload, Wallet, FolderOpen, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";

const QUICK_ACTIONS = [
  { key: "expense", icon: Receipt, path: "/expenses/add", labelKey: "expenses.addExpense", color: "error" },
  { key: "bill", icon: FileText, path: "/bills/add", labelKey: "navigation.bills", color: "warning" },
  { key: "upload", icon: Upload, path: "/upload/expenses", labelKey: "navigation.upload", color: "info" },
  { key: "budget", icon: Wallet, path: "/budgets/add", labelKey: "budget.addBudget", color: "success" },
  { key: "category", icon: FolderOpen, path: "/categories/add", labelKey: "navigation.categories", color: "primary" },
  { key: "payment", icon: CreditCard, path: "/payment-method", labelKey: "navigation.payments", color: "accent" },
];

const COLOR_MAP = {
  error: "bg-red-500/15 text-red-500",
  warning: "bg-amber-500/15 text-amber-500",
  info: "bg-cyan-500/15 text-cyan-500",
  success: "bg-emerald-500/15 text-emerald-500",
  primary: "bg-primary/15 text-primary",
  accent: "bg-purple-500/15 text-purple-500",
};

export function QuickAccess() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { animation } = usePresentation();

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.key}
          onClick={() => navigate(action.path)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card",
            "whitespace-nowrap shrink-0 text-sm font-medium",
            animation.enabled && "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
          )}
        >
          <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg", COLOR_MAP[action.color])}>
            <AppIcon icon={action.icon} size="sm" className="!text-current" />
          </div>
          <span className="flex items-center gap-1">
            <Plus className="h-3 w-3" />
            {t(action.labelKey)}
          </span>
        </button>
      ))}
    </div>
  );
}

export default QuickAccess;
