import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className={`space-y-2 ${BILL_EXPENSE_SCROLL.editorList}`}>
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
      <p className="mt-2 text-center text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{t("billForm.lineItems.totalAmountLabel")}: </span>
        <span className="tabular-nums">{format(draftTotal)}</span>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={onAddRow} disabled={!lastComplete}>
          <Plus className="mr-1 h-4 w-4" />
          {t("billForm.lineItems.addRow")}
        </Button>
        {!lastComplete && (
          <p className="text-xs text-destructive sm:flex-1">{t("billForm.lineItems.completeRowHint")}</p>
        )}
        <Button type="button" size="sm" className="w-full sm:ml-auto sm:w-auto" onClick={onSave}>
          {t("billForm.lineItems.saveLines")}
        </Button>
      </div>
    </div>
  );
}
