import React from "react";

export default function BillExpenseSummary({
  expenses,
  colors,
  currencySymbol,
  t,
  emptyTitle,
  emptySubtitle,
}) {
  const countKey =
    expenses.length === 1
      ? "billCommon.summary.singleItem"
      : "billCommon.summary.multipleItems";
  const countLabel = t(countKey, { count: expenses.length });

  return (
    <div className="mt-4">
      <div
        className="rounded border p-3"
        style={{
          backgroundColor: colors.secondary_bg,
          borderColor: colors.border_color,
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h4
            className="font-semibold text-base"
            style={{ color: colors.primary_text }}
          >
            {t("billCommon.summary.title")}
          </h4>
          <span
            className="text-sm font-medium"
            style={{ color: colors.secondary_accent }}
          >
            {countLabel}
          </span>
        </div>

        {expenses.length === 0 ? (
          <div
            className="text-center py-4"
            style={{
              height: "345px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p className="text-red-400 text-sm mb-1">
              {emptyTitle || t("billCommon.summary.noItemsTitle")}
            </p>
            <p className="text-xs" style={{ color: colors.icon_muted }}>
              {emptySubtitle}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className="max-h-80 overflow-y-auto pr-2"
              style={{
                maxHeight: "285px",
                scrollbarWidth: "thin",
                scrollbarColor: `${colors.primary_accent} ${colors.primary_bg}`,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {expenses.map((expense, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-3 transition-all duration-200"
                    style={{
                      backgroundColor: colors.primary_bg,
                      border: `1px solid ${colors.border_color}`,
                      boxShadow: `0 2px 8px ${colors.primary_bg}40`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        colors.primary_accent;
                      e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary_accent}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        colors.border_color;
                      e.currentTarget.style.boxShadow = `0 2px 8px ${colors.primary_bg}40`;
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 min-w-0 pr-2">
                        <h5
                          className="font-medium text-xs truncate max-w-[140px]"
                          title={expense.itemName}
                          style={{ color: colors.primary_text }}
                        >
                          {expense.itemName}
                        </h5>
                      </div>
                      <div
                        className="font-semibold text-xs whitespace-nowrap"
                        style={{ color: colors.secondary_accent }}
                      >
                        {currencySymbol}
                        {expense.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span style={{ color: colors.icon_muted }}>
                          {t("billCommon.expenseTable.summaryLabels.qty")}
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: colors.primary_text }}
                        >
                          {expense.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.icon_muted }}>
                          {t("billCommon.expenseTable.summaryLabels.unit")}
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: colors.primary_text }}
                        >
                          {currencySymbol}
                          {parseFloat(expense.unitPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.icon_muted }}>
                          {t("billCommon.expenseTable.summaryLabels.calc")}
                        </span>
                        <span style={{ color: colors.secondary_text }}>
                          {expense.quantity} × {currencySymbol}
                          {parseFloat(expense.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {expense.comments && expense.comments.trim() !== "" && (
                      <div
                        className="mt-1 pt-1 border-t"
                        style={{ borderColor: colors.border_color }}
                      >
                        <div
                          className="text-[10px] mb-0.5"
                          style={{ color: colors.icon_muted }}
                        >
                          {t(
                            "billCommon.expenseTable.summaryLabels.comments",
                          )}
                        </div>
                        <div
                          className="text-[10px] p-1 rounded break-words max-h-16 overflow-auto"
                          style={{
                            color: colors.secondary_text,
                            backgroundColor: colors.secondary_bg,
                            border: `1px solid ${colors.border_color}`,
                          }}
                        >
                          {expense.comments}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="pt-3 mt-3"
              style={{ borderTop: `1px solid ${colors.border_color}` }}
            >
              <div className="flex justify-between items-center">
                <span
                  className="font-medium text-sm"
                  style={{ color: colors.icon_muted }}
                >
                  {t("billCommon.expenseTable.totalLabel")}:
                </span>
                <span
                  className="font-bold text-lg"
                  style={{ color: colors.secondary_accent }}
                >
                  {currencySymbol}
                  {expenses
                    .reduce((sum, exp) => sum + exp.totalPrice, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
