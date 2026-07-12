import React from "react";
import { IconButton, Button } from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import ItemNameAutocomplete from "../../expenses/components/ItemNameAutocomplete";

function isRowComplete(expense) {
  if (!expense) return false;
  const hasItemName = expense.itemName && expense.itemName.trim() !== "";
  const hasValidUnitPrice =
    expense.unitPrice !== "" &&
    expense.unitPrice !== null &&
    expense.unitPrice !== undefined &&
    !isNaN(parseFloat(expense.unitPrice)) &&
    parseFloat(expense.unitPrice) > 0 &&
    !expense.unitPrice.toString().includes("-");
  const hasValidQuantity =
    expense.quantity !== "" &&
    expense.quantity !== null &&
    expense.quantity !== undefined &&
    !isNaN(parseFloat(expense.quantity)) &&
    parseFloat(expense.quantity) > 0 &&
    !expense.quantity.toString().includes("-");
  return hasItemName && hasValidUnitPrice && hasValidQuantity;
}

export default function BillExpenseTable({
  tempExpenses,
  onTempExpenseChange,
  onItemNameChange,
  onAddRow,
  onRemoveRow,
  onSave,
  onClose,
  colors,
  currencySymbol,
  t,
  lastRowRef,
  saveLabelKey = "billCommon.actions.saveExpenses",
  validationHintKey = "billCommon.expenseTable.validationHintDetailed",
  expenseTableTitle,
}) {
  const headers = [
    t("billCommon.expenseTable.headers.itemName"),
    t("billCommon.expenseTable.headers.quantity"),
    t("billCommon.expenseTable.headers.unitPrice"),
    t("billCommon.expenseTable.headers.totalPrice"),
    t("billCommon.expenseTable.headers.comments"),
    t("billCommon.expenseTable.headers.actions"),
  ];

  const lastExpenseComplete = isRowComplete(
    tempExpenses[tempExpenses.length - 1],
  );

  return (
    <div className="mt-6 flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-4">
        <h3
          className="text-xl font-semibold"
          style={{ color: colors.primary_text }}
        >
          {expenseTableTitle ||
            t("createBill.labels.expenseTableTitle") ||
            t("editBill.labels.expenseTableTitle") ||
            "Expense Items"}
        </h3>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#ff4444",
            "&:hover": { backgroundColor: "#ff444420" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>

      <div
        className="rounded border px-3 pt-3 flex-1 flex flex-col min-h-0"
        style={{
          backgroundColor: colors.secondary_bg,
          borderColor: colors.border_color,
        }}
      >
        <div
          className="grid grid-cols-6 gap-3 mb-3 pb-2 border-b"
          style={{ borderColor: colors.border_color }}
        >
          {headers.map((header) => (
            <div
              key={header}
              className="font-semibold text-sm col-span-1"
              style={{ color: colors.primary_text }}
            >
              {header}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {tempExpenses.map((expense, index) => {
            const hasItemName = expense.itemName.trim() !== "";
            const hasValidUnitPrice =
              expense.unitPrice !== "" &&
              !isNaN(parseFloat(expense.unitPrice)) &&
              parseFloat(expense.unitPrice) > 0;
            const isIncomplete = hasItemName && !hasValidUnitPrice;
            const isLastRow = index === tempExpenses.length - 1;

            return (
              <div
                key={index}
                ref={isLastRow ? lastRowRef : null}
                className="grid grid-cols-6 gap-3 items-center p-3 rounded"
                style={{
                  backgroundColor: isIncomplete
                    ? "rgba(255, 68, 68, 0.1)"
                    : colors.primary_bg,
                  border: `1px solid ${isIncomplete ? "#ef4444" : colors.border_color}`,
                }}
              >
                <div className="col-span-1">
                  <ItemNameAutocomplete
                    value={expense.itemName}
                    onChange={(event, newValue) =>
                      onItemNameChange(index, event, newValue)
                    }
                    placeholder={t("billCommon.placeholders.itemName")}
                    autoFocus={isLastRow && expense.itemName === ""}
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="number"
                    placeholder={t("billCommon.placeholders.quantity")}
                    value={expense.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (parseFloat(value) > 0 && !value.includes("-"))
                      ) {
                        onTempExpenseChange(index, "quantity", value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (["-", "e", "E", "+", "."].includes(e.key))
                        e.preventDefault();
                    }}
                    className={`w-full px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 text-sm ${
                      hasItemName &&
                      (!expense.quantity ||
                        parseFloat(expense.quantity) <= 0)
                        ? "border border-red-400 focus:ring-red-400"
                        : ""
                    }`}
                    style={{
                      backgroundColor:
                        hasItemName &&
                        (!expense.quantity ||
                          parseFloat(expense.quantity) <= 0)
                          ? "rgba(255, 68, 68, 0.1)"
                          : colors.primary_bg,
                      color: colors.primary_text,
                      borderColor:
                        hasItemName &&
                        (!expense.quantity ||
                          parseFloat(expense.quantity) <= 0)
                          ? "#ef4444"
                          : colors.border_color,
                    }}
                    onFocus={(e) =>
                      (e.target.style.outline = `2px solid ${colors.secondary_accent}`)
                    }
                    onBlur={(e) => (e.target.style.outline = "none")}
                    min="1"
                    step="1"
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="number"
                    placeholder={t("billCommon.placeholders.unitPrice")}
                    value={expense.unitPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (parseFloat(value) > 0 && !value.includes("-"))
                      ) {
                        onTempExpenseChange(index, "unitPrice", value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (["-", "e", "E", "+"].includes(e.key))
                        e.preventDefault();
                    }}
                    className={`w-full px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 text-sm ${
                      isIncomplete
                        ? "border border-red-400 focus:ring-red-400"
                        : ""
                    }`}
                    style={{
                      backgroundColor: isIncomplete
                        ? "rgba(255, 68, 68, 0.1)"
                        : colors.primary_bg,
                      color: colors.primary_text,
                      borderColor: isIncomplete
                        ? "#ef4444"
                        : colors.border_color,
                    }}
                    onFocus={(e) =>
                      (e.target.style.outline = `2px solid ${
                        isIncomplete ? "#ef4444" : colors.secondary_accent
                      }`)
                    }
                    onBlur={(e) => (e.target.style.outline = "none")}
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="text"
                    value={expense.totalPrice.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 rounded cursor-not-allowed text-sm"
                    style={{
                      backgroundColor: colors.hover_bg,
                      color: colors.icon_muted,
                    }}
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="text"
                    placeholder={t("billCommon.placeholders.comments")}
                    value={expense.comments || ""}
                    onChange={(e) =>
                      onTempExpenseChange(index, "comments", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 text-sm"
                    style={{
                      backgroundColor: colors.primary_bg,
                      color: colors.primary_text,
                    }}
                    onFocus={(e) =>
                      (e.target.style.outline = `2px solid ${colors.secondary_accent}`)
                    }
                    onBlur={(e) => (e.target.style.outline = "none")}
                  />
                </div>

                <div className="col-span-1 flex gap-2">
                  <IconButton
                    onClick={() => onRemoveRow(index)}
                    disabled={tempExpenses.length === 1}
                    sx={{
                      color:
                        tempExpenses.length === 1 ? "#666" : "#ff4444",
                      padding: "4px",
                      "&:hover": {
                        backgroundColor:
                          tempExpenses.length === 1
                            ? "transparent"
                            : "#ff444420",
                      },
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="mt-4 pt-4"
          style={{ borderTop: `1px solid ${colors.border_color}` }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <Button
                onClick={onAddRow}
                startIcon={<AddIcon />}
                disabled={!lastExpenseComplete}
                sx={{
                  backgroundColor: lastExpenseComplete
                    ? "#00DAC6"
                    : colors.border_color,
                  color: lastExpenseComplete ? "black" : colors.icon_muted,
                  "&:hover": {
                    backgroundColor: lastExpenseComplete
                      ? "#00b8a0"
                      : colors.border_color,
                  },
                  "&:disabled": {
                    backgroundColor: colors.border_color,
                    color: colors.icon_muted,
                    opacity: 0.6,
                  },
                  fontSize: "0.875rem",
                  padding: "6px 12px",
                }}
                size="small"
              >
                {t("billCommon.actions.addRow")}
              </Button>

              {!lastExpenseComplete && (
                <div className="text-red-400 text-xs mt-1">
                  {t(validationHintKey)}
                </div>
              )}
            </div>

            {tempExpenses.length > 0 && (
              <div
                className="font-semibold"
                style={{ color: colors.primary_text }}
              >
                {t("billCommon.expenseTable.totalLabel")}: {currencySymbol}
                {tempExpenses
                  .reduce(
                    (sum, expense) => sum + (expense.totalPrice || 0),
                    0,
                  )
                  .toFixed(2)}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={onClose}
                sx={{
                  backgroundColor: "#ff4444",
                  color: "white",
                  fontSize: "0.875rem",
                  padding: "6px 12px",
                  "&:hover": { backgroundColor: "#ff6666" },
                }}
                size="small"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={onSave}
                sx={{
                  backgroundColor: "#00DAC6",
                  color: "black",
                  "&:hover": { backgroundColor: "#00b8a0" },
                  fontSize: "0.875rem",
                  padding: "6px 12px",
                }}
                size="small"
              >
                {t(saveLabelKey)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

BillExpenseTable.isRowComplete = isRowComplete;
