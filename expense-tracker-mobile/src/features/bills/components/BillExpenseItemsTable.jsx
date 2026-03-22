import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isBillExpenseRowComplete } from "@/domain/bills/billExpenseLineUtils";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { BILL_EXPENSE_SCROLL } from "../config/billConfig";
import { BillExpenseLineRow } from "./BillExpenseLineRow";

function sumDraftLineTotals(rows) {
  return rows.reduce((sum, row) => sum + (Number(row.totalPrice) || 0), 0);
}

export function BillExpenseItemsTable({
  tempExpenses,
  onChange,
  onAddRow,
  onRemoveRow,
  onSave,
  onClose,
  lastRowRef,
  t,
}) {
  const { format } = useMoneyFormatter();
  const lastIdx = tempExpenses.length - 1;
  const lastComplete = isBillExpenseRowComplete(tempExpenses[lastIdx]);
  const draftTotal = sumDraftLineTotals(tempExpenses);

  return (
    <div className="mt-4 w-full min-w-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{t("billForm.lineItems.title")}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label={t("common.close")}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-md border border-border bg-card/30 shadow-sm overflow-hidden">
        <div className={`overflow-x-auto overflow-y-auto overscroll-contain theme-scrollbar h-[18rem] p-3`}>
          <div className="space-y-2 min-w-[35rem] md:min-w-0">
            {tempExpenses.map((row, index) => (
              <BillExpenseLineRow
                key={index}
                row={row}
                index={index}
                onChange={onChange}
                onRemove={onRemoveRow}
                rowRef={index === lastIdx ? lastRowRef : undefined}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{t("billForm.lineItems.totalAmountLabel")}: </span>
        <span className="tabular-nums">{format(draftTotal)}</span>
      </p>
      <div className="mt-3 flex flex-row gap-2 sm:items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex-1 sm:flex-none ${!lastComplete ? 'cursor-not-allowed' : ''}`} tabIndex={0}>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className={`w-full ${!lastComplete ? 'pointer-events-none' : ''}`}
                  onClick={onAddRow} 
                  disabled={!lastComplete}
                >
                  <Plus className="mr-1 h-4 w-4 shrink-0" />
                  <span className="truncate">{t("billForm.lineItems.addRow")}</span>
                </Button>
              </div>
            </TooltipTrigger>
            {!lastComplete && (
              <TooltipContent side="top" className="max-w-[18rem] text-center hidden sm:block">
                <p>{t("billForm.lineItems.completeRowHint")}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <Button type="button" size="sm" className="flex-1 sm:flex-none sm:ml-auto" onClick={onSave}>
          <span className="truncate">{t("billForm.lineItems.saveLines")}</span>
        </Button>
      </div>
    </div>
  );
}
