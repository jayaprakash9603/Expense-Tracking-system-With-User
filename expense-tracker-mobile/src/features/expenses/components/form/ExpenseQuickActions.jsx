import React, { useCallback, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { cn } from "@/lib/utils";

function resolveLabel(translator, key, fallback) {
  const value = translator?.(key);
  if (!value || value === key) return fallback;
  return value;
}

export function ExpenseQuickActions({
  onAdd,
  onUpload,
  className,
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const quickActionsLabel = resolveLabel(t, "common.quickActions", "Actions");
  const addLabel = resolveLabel(t, "common.add", "Add");
  const uploadLabel = resolveLabel(t, "navigation.upload", "Upload");

  const handleMouseEnter = useCallback(() => setOpen(true), []);
  const handleMouseLeave = useCallback(() => setOpen(false), []);

  const handleAddSelect = useCallback(
    (event) => {
      event.preventDefault();
      setOpen(false);
      onAdd?.();
    },
    [onAdd],
  );

  const handleUploadSelect = useCallback(
    (event) => {
      event.preventDefault();
      setOpen(false);
      onUpload?.();
    },
    [onUpload],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div
        className={cn("inline-flex", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="group h-9 w-9 justify-start overflow-hidden rounded-full border-primary/40 px-2 text-primary transition-all duration-200 ease-out hover:w-36 hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="ml-2 max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold opacity-0 transition-all duration-200 ease-out group-hover:max-w-[92px] group-hover:opacity-100">
              {quickActionsLabel}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-40"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DropdownMenuItem onSelect={handleAddSelect}>
            <Plus className="h-4 w-4" />
            {addLabel}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleUploadSelect}>
            <Upload className="h-4 w-4" />
            {uploadLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
}

export default ExpenseQuickActions;
