import { Trash2 } from "lucide-react";
import { Button, Label } from "@/shared/components/app-shadcn";
import { AppInput } from "@/shared/components/form/AppInput";

export function BillExpenseLineRow({ row, index, onChange, onRemove, rowRef, t }) {
  const totalStr = Math.round(Number(row.totalPrice) || 0).toString();

  return (
    <div ref={rowRef} className="rounded-lg border border-border/50 bg-card/40">
      <div className="flex flex-nowrap items-end gap-x-2 p-2">
        <span className="w-5 shrink-0 pb-2 text-center text-[0.65rem] font-medium text-muted-foreground">
          {index + 1}
        </span>
        <div className="flex-[1.5_1_0%] min-w-[8rem] md:min-w-0">
          <Label className="mb-0.5 block text-[0.6rem] uppercase leading-tight text-muted-foreground">
            {t("billForm.lineItems.itemName")}
          </Label>
          <AppInput
            value={row.itemName}
            onChange={(e) => onChange(index, "itemName", e.target.value)}
            placeholder={t("billForm.lineItems.itemName")}
            className="h-8"
          />
        </div>
        <div className="w-[4.5rem] shrink-0">
          <Label className="mb-0.5 block text-[0.6rem] uppercase leading-tight text-muted-foreground">
            {t("billForm.lineItems.qty")}
          </Label>
          <AppInput
            type="number"
            min={0}
            value={row.quantity}
            onChange={(e) => onChange(index, "quantity", e.target.value)}
            className="h-8 px-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="w-[7.5rem] shrink-0">
          <Label className="mb-0.5 block text-[0.6rem] uppercase leading-tight text-muted-foreground">
            {t("billForm.lineItems.unitPrice")}
          </Label>
          <AppInput
            type="number"
            min={0}
            step="0.01"
            value={row.unitPrice}
            onChange={(e) => onChange(index, "unitPrice", e.target.value)}
            className="h-8 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="w-[6.5rem] shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/50 px-2 py-1 flex flex-col justify-center text-right">
          <span className="block text-[0.55rem] uppercase leading-tight text-muted-foreground">
            {t("billForm.lineItems.total")}
          </span>
          <span
            className="block truncate text-xs font-medium tabular-nums leading-tight"
            title={totalStr}
          >
            {totalStr}
          </span>
        </div>
        <div className="flex-[1_1_0%] min-w-[8rem] md:min-w-0">
          <Label className="mb-0.5 block text-[0.6rem] uppercase leading-tight text-muted-foreground">
            {t("billForm.lineItems.comments")}
          </Label>
          <AppInput
            value={row.comments ?? ""}
            onChange={(e) => onChange(index, "comments", e.target.value)}
            placeholder={t("billForm.lineItems.comments")}
            className="h-8"
          />
        </div>
        <div className="ml-auto flex shrink-0 items-end pb-0.5">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(index)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}
