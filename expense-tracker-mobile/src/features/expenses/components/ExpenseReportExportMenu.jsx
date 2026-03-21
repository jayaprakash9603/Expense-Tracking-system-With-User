import React from "react";
import { Download, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExpenseReportExportMenu({ onExport, exportLabel, moreLabel }) {
  if (typeof onExport !== "function") return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0 sm:h-9 sm:w-9">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">{moreLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          {exportLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
