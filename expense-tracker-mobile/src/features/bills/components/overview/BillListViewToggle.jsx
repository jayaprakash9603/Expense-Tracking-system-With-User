import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/shared/components/app-shadcn";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function BillListViewToggle({ view, onViewChange }) {
  const { t } = useLanguage();
  return (
    <div
      className="flex shrink-0 gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5"
      role="group"
      aria-label={t("bills.viewModeGroup")}
    >
      <Button
        type="button"
        variant={view === "list" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        aria-pressed={view === "list"}
        aria-label={t("bills.viewList")}
        onClick={() => onViewChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={view === "grid" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        aria-pressed={view === "grid"}
        aria-label={t("bills.viewGrid")}
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default BillListViewToggle;
