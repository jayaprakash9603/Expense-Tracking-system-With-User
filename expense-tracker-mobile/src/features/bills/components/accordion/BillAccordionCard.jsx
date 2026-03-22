import { ArrowDown, ArrowUp, ChevronDown, FileText, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { fromApiResponse } from "@/domain/bills/bill.transformers";
import { filterValidBillExpenses } from "@/domain/bills/billExpenseLineUtils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/app-shadcn";
import { AppBadge } from "@/shared/components/display/AppBadge";
import { BillAccordionPanels } from "@/features/bills/components/accordion/BillAccordionPanels";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";
import { cn } from "@/lib/utils";

function paymentLabel(pm) {
  if (!pm) return "";
  return String(pm).replace(/-/g, " ").toUpperCase();
}

export function BillAccordionCard({ raw, onEdit, onDelete }) {
  const { t } = useLanguage();
  const { format } = useMoneyFormatter();
  const bill = fromApiResponse(raw);
  const lines = filterValidBillExpenses(bill.expenses);
  const isGain = bill.type === "gain";
  const amountColor = isGain ? "text-emerald-600" : "text-red-600";
  const ArrowIcon = isGain ? ArrowUp : ArrowDown;
  const id = String(bill.id);

  return (
    <AccordionItem value={id} className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <AccordionTrigger
        className={cn(
          "group flex w-full flex-col gap-3 px-3 py-3 hover:no-underline sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3.5",
          "[&>svg:last-child]:hidden",
        )}
      >
        {/* Top row on mobile, Left side on desktop */}
        <div className="flex min-w-0 w-full items-start gap-3 sm:flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 text-left pt-0.5">
            <p className="truncate text-sm font-semibold text-foreground sm:text-base">
              {bill.name}
            </p>
            {bill.description ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {bill.description}
              </p>
            ) : null}
          </div>
        </div>

        {/* Bottom row on mobile, Right side on desktop */}
        <div className="flex w-full min-w-0 items-center justify-between pl-[3.25rem] sm:w-auto sm:shrink-0 sm:justify-end sm:pl-0 sm:gap-4">
          <div className={cn("flex min-w-0 items-center gap-1", amountColor)}>
            <ArrowIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            <span className="text-base font-bold tabular-nums tracking-tight">
              {format(Math.abs(Number(bill.amount) || 0))}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <AppBadge
              variant="secondary"
              className="max-w-[8rem] truncate px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground sm:max-w-[10rem]"
            >
              {paymentLabel(bill.paymentMethod)}
            </AppBadge>
            
            <div className="flex items-center gap-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={t("common.aria.menu")}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onEdit?.(bill)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete?.(bill)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="border-t border-border bg-muted/30 px-3 pb-4 pt-3 sm:px-4">
        <BillAccordionPanels bill={bill} lines={lines} isGain={isGain} />
      </AccordionContent>
    </AccordionItem>
  );
}
