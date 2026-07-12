import React from "react";
import { ExpenseFormShell } from "@/shared/components/entity-form/ExpenseFormShell";

export function ExpenseFormLoadingState({ title, loadingLabel, onClose }) {
  return (
    <ExpenseFormShell title={title} onClose={onClose}>
      <div className="py-10 text-center text-sm text-muted-foreground">{loadingLabel}</div>
    </ExpenseFormShell>
  );
}
