export function ExpenseReportErrorBanner({ error }) {
  if (!error) return null;
  return (
    <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {typeof error === "object" && error?.message ? error.message : String(error)}
    </p>
  );
}
