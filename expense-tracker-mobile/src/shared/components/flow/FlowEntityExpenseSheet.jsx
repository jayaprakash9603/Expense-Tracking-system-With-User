import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FlowEntityExpenseDrilldownContent } from "./FlowEntityExpenseDrilldownContent";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { cn } from "@/lib/utils";

const SHEET_MAX_HEIGHT = "max-h-[92vh]";

export function FlowEntityExpenseSheet({
  open,
  onOpenChange,
  entityName,
  expenses,
  onExpenseNavigate,
  entityVariant = "category",
  flowTab = "all",
}) {
  const { t } = useLanguage();
  const a11yTitle = t("flows.expensesTable.entityTitle", { name: entityName || "—" });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(SHEET_MAX_HEIGHT, "flex flex-col gap-3 overflow-hidden rounded-t-xl p-4")}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{a11yTitle}</SheetTitle>
        </SheetHeader>
        <FlowEntityExpenseDrilldownContent
          entityName={entityName}
          expenses={expenses}
          entityVariant={entityVariant}
          flowTab={flowTab}
          onExpenseNavigate={onExpenseNavigate}
          layout="sheet"
        />
      </SheetContent>
    </Sheet>
  );
}
