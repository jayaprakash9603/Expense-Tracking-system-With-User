import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  CircularProgress,
  IconButton,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Link as LinkIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  CategoryAutocomplete,
  PaymentMethodAutocomplete,
  ExpenseNameAutocomplete,
} from "../../../components/ui";
import BudgetSelectionTable from "../../../components/common/BudgetSelectionTable/BudgetSelectionTable";
import {
  updateBill,
  getBillById,
  getBillByExpenseId,
} from "../../../Redux/Bill/bill.action";
import { getListOfBudgetsById } from "../../../Redux/Budget/budget.action";
import { normalizePaymentMethod } from "../../../utils/paymentMethodUtils";
import usePreserveNavigationState from "../../../hooks/usePreserveNavigationState";
import useFormPage from "../../../shared/form/hooks/useFormPage";
import FormPageShell from "../../../shared/form/components/FormPageShell";
import ThemedDatePicker from "../../../shared/form/fields/ThemedDatePicker";
import ThemedCommentField from "../../../shared/form/fields/ThemedCommentField";
import ThemedAutocomplete from "../../../shared/form/fields/ThemedAutocomplete";
import SubmitButton from "../../../shared/form/components/SubmitButton";
import BillExpenseTable from "../components/BillExpenseTable";
import BillExpenseSummary from "../components/BillExpenseSummary";

const REDIRECT_CONFIG = {
  buildFriendPath: (fid) => `/bill/${fid}`,
  selfPath: "/bill",
  defaultPath: "/bill",
};

const EditBill = ({ onClose, onSuccess, billId }) => {
  const {
    colors,
    t,
    dateFormat,
    currencySymbol,
    dispatch,
    params,
    friendId,
    hasWriteAccess,
  } = useFormPage({ redirectConfig: REDIRECT_CONFIG });

  const { navigateWithState } = usePreserveNavigationState();
  const lastRowRef = useRef(null);
  const { id, expenseId } = params;
  const currentBillId = billId || id;

  const {
    budgets = [],
    error: budgetError,
    loading: budgetLoading,
  } = useSelector((state) => state.budgets || {});
  const { loading: billLoading } = useSelector((state) => state.bills || {});

  const [hasUnsavedExpenseChanges, setHasUnsavedExpenseChanges] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [billData, setBillData] = useState({
    name: "",
    description: "",
    amount: "",
    paymentMethod: "cash",
    type: "loss",
    date: "",
    categoryId: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [tempExpenses, setTempExpenses] = useState([
    {
      itemName: "",
      quantity: 1,
      unitPrice: "",
      totalPrice: 0,
      comments: "",
    },
  ]);
  const [errors, setErrors] = useState({});
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [showBudgetTable, setShowBudgetTable] = useState(false);
  const [selectedBudgets, setSelectedBudgets] = useState([]);

  useEffect(() => {
    const loadBillData = async () => {
      if (!currentBillId && !expenseId) {
        setLoadError(t("editBill.messages.noBillId"));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);

        let billResponse;

        if (expenseId && !currentBillId) {
          billResponse = await dispatch(
            getBillByExpenseId(expenseId, friendId || ""),
          );
        } else {
          billResponse = await dispatch(
            getBillById(currentBillId, friendId || ""),
          );
        }
        let bill = billResponse?.payload || billResponse?.data || billResponse;

        if (!bill || !bill.id) {
          throw new Error(t("editBill.messages.invalidData"));
        }

        setBillData({
          name: bill.name || "",
          description: bill.description || "",
          amount: bill.amount?.toString() || "0",
          paymentMethod: normalizePaymentMethod(bill.paymentMethod || "cash"),
          type: bill.type || "loss",
          date: bill.date || "",
          categoryId: bill.categoryId || "",
        });

        if (
          bill.expenses &&
          Array.isArray(bill.expenses) &&
          bill.expenses.length > 0
        ) {
          const formattedExpenses = bill.expenses.map((expense) => ({
            itemName: expense.itemName || expense.expenseName || "",
            quantity: expense.quantity || 1,
            unitPrice:
              expense.unitPrice?.toString() || expense.amount?.toString() || "",
            totalPrice: expense.totalPrice || expense.amount || 0,
            comments: expense.comments || "",
          }));
          setExpenses(formattedExpenses);
        } else {
          setExpenses([]);
        }

        if (bill.budgetIds && Array.isArray(bill.budgetIds)) {
          setSelectedBudgets(bill.budgetIds);
        } else {
          setSelectedBudgets([]);
        }
      } catch (error) {
        setLoadError(error.message || t("editBill.messages.invalidData"));
      } finally {
        setIsLoading(false);
      }
    };

    loadBillData();
  }, [currentBillId, dispatch, id, friendId, expenseId, t]);

  useEffect(() => {
    if (billData.date) {
      dispatch(getListOfBudgetsById(billData.date, friendId || ""));
    }
  }, [dispatch, billData.date, friendId]);

  useEffect(() => {
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + (expense.totalPrice || 0),
      0,
    );
    if (billData.amount !== totalAmount.toString()) {
      setBillData((prev) => ({ ...prev, amount: totalAmount.toString() }));
    }
  }, [expenses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleTypeChange = (event, newValue) => {
    const newType = newValue || "loss";
    setBillData((prev) => ({ ...prev, type: newType }));
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: false }));
    }
  };

  const handleDateChange = (formatted) => {
    if (formatted) {
      setBillData((prev) => ({ ...prev, date: formatted }));
      dispatch(getListOfBudgetsById(formatted, friendId || ""));
    }
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: false }));
    }
  };

  const handleTempExpenseChange = (index, field, value) => {
    const updatedExpenses = [...tempExpenses];

    if (field === "quantity" || field === "unitPrice") {
      const numValue = parseFloat(value);
      if (value === "" || numValue > 0) {
        updatedExpenses[index][field] = value;
      } else {
        return;
      }
    } else {
      updatedExpenses[index][field] = value;
    }

    if (field === "quantity" || field === "unitPrice") {
      const quantity = parseFloat(updatedExpenses[index].quantity) || 0;
      const unitPrice = parseFloat(updatedExpenses[index].unitPrice) || 0;
      updatedExpenses[index].totalPrice = quantity * unitPrice;
    }

    setTempExpenses(updatedExpenses);
    setHasUnsavedExpenseChanges(true);
  };

  const handleItemNameChange = (index, event, newValue) => {
    const updatedExpenses = [...tempExpenses];
    updatedExpenses[index].itemName = newValue || "";

    const quantity = parseFloat(updatedExpenses[index].quantity) || 1;
    const unitPrice = parseFloat(updatedExpenses[index].unitPrice) || 0;
    updatedExpenses[index].totalPrice = quantity * unitPrice;

    setTempExpenses(updatedExpenses);
    setHasUnsavedExpenseChanges(true);
  };

  const addTempExpenseRow = () => {
    if (BillExpenseTable.isRowComplete(tempExpenses[tempExpenses.length - 1])) {
      setTempExpenses([
        ...tempExpenses,
        {
          itemName: "",
          quantity: 1,
          unitPrice: "",
          totalPrice: 0,
          comments: "",
        },
      ]);
      setHasUnsavedExpenseChanges(true);

      setTimeout(() => {
        if (lastRowRef.current) {
          lastRowRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
          const itemNameInput = lastRowRef.current.querySelector("input");
          if (itemNameInput) {
            itemNameInput.focus();
          }
        }
      }, 100);
    }
  };

  const removeTempExpenseRow = (index) => {
    if (tempExpenses.length > 1) {
      const updatedExpenses = tempExpenses.filter((_, i) => i !== index);
      setTempExpenses(updatedExpenses);
      setHasUnsavedExpenseChanges(true);
    }
  };

  const hasValidExpenseEntries = () => {
    return tempExpenses.some(
      (expense) =>
        expense.itemName.trim() !== "" ||
        (expense.unitPrice !== "" &&
          !isNaN(parseFloat(expense.unitPrice)) &&
          parseFloat(expense.unitPrice) > 0) ||
        (expense.quantity !== "" &&
          !isNaN(parseFloat(expense.quantity)) &&
          parseFloat(expense.quantity) > 0),
    );
  };

  const handleSaveExpenses = () => {
    const validExpenses = tempExpenses.filter((expense) =>
      BillExpenseTable.isRowComplete(expense),
    );

    if (validExpenses.length === 0) {
      alert(t("billCommon.messages.addExpenseValidationSimple"));
      return;
    }

    setExpenses(validExpenses);
    setShowExpenseTable(false);
    setHasUnsavedExpenseChanges(false);
    setTempExpenses([
      {
        itemName: "",
        quantity: 1,
        unitPrice: "",
        totalPrice: 0,
        comments: "",
      },
    ]);
  };

  const handleOpenExpenseTable = () => {
    if (showExpenseTable) {
      handleCloseExpenseTableWithConfirmation();
    } else {
      setShowExpenseTable(true);
      setShowBudgetTable(false);
      if (expenses.length > 0) {
        setTempExpenses([...expenses]);
        setHasUnsavedExpenseChanges(false);
      }
    }
  };

  const handleCloseExpenseTableWithConfirmation = () => {
    if (hasUnsavedExpenseChanges && hasValidExpenseEntries()) {
      const confirmClose = window.confirm(
        t("billCommon.messages.unsavedChanges"),
      );
      if (confirmClose) {
        setTempExpenses([
          {
            itemName: "",
            quantity: 1,
            unitPrice: "",
            totalPrice: 0,
            comments: "",
          },
        ]);
        setHasUnsavedExpenseChanges(false);
        setShowExpenseTable(false);
      }
    } else {
      setShowExpenseTable(false);
    }
  };

  const handleToggleBudgetTable = () => {
    setShowBudgetTable(!showBudgetTable);
    if (showExpenseTable) {
      setShowExpenseTable(false);
    }
  };

  const handleCloseBudgetTable = () => {
    setShowBudgetTable(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!billData.name) newErrors.name = true;
    if (!billData.date) newErrors.date = true;
    if (!billData.type) newErrors.type = true;

    const validExpenses = expenses.filter(
      (expense) =>
        expense.itemName.trim() !== "" &&
        expense.unitPrice !== "" &&
        !isNaN(parseFloat(expense.unitPrice)) &&
        parseFloat(expense.unitPrice) > 0 &&
        !expense.unitPrice.toString().includes("-") &&
        expense.quantity !== "" &&
        !isNaN(parseFloat(expense.quantity)) &&
        parseFloat(expense.quantity) > 0 &&
        !expense.quantity.toString().includes("-"),
    );

    if (validExpenses.length === 0) {
      newErrors.expenses = true;
      alert(t("billCommon.messages.expensesRequiredUpdate"));
    }

    const invalidExpenses = expenses.filter(
      (expense) =>
        expense.itemName.trim() !== "" &&
        (expense.unitPrice === "" ||
          isNaN(parseFloat(expense.unitPrice)) ||
          parseFloat(expense.unitPrice) <= 0 ||
          expense.unitPrice.toString().includes("-") ||
          expense.quantity === "" ||
          isNaN(parseFloat(expense.quantity)) ||
          parseFloat(expense.quantity) <= 0 ||
          expense.quantity.toString().includes("-")),
    );

    if (invalidExpenses.length > 0) {
      newErrors.expenses = true;
      alert(t("billCommon.messages.invalidQuantityOrPrice"));
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const totalAmount = expenses.reduce(
        (sum, expense) => sum + (expense.totalPrice || 0),
        0,
      );

      if (totalAmount <= 0) {
        alert(t("billCommon.messages.totalAmountInvalid"));
        return;
      }

      const selectedBudgetIds = selectedBudgets || [];
      const normalizedMethod = normalizePaymentMethod(billData.paymentMethod);
      const updatedBillData = {
        id: currentBillId,
        name: billData.name,
        description: billData.description,
        amount: totalAmount,
        paymentMethod: normalizedMethod,
        type: billData.type,
        date: billData.date,
        categoryId: billData.categoryId || 0,
        budgetIds: selectedBudgetIds,
        expenses: expenses,
        netAmount: totalAmount,
        creditDue:
          billData.type === "loss" && normalizedMethod === "creditNeedToPaid"
            ? totalAmount
            : 0,
      };

      const result = await dispatch(
        updateBill(currentBillId, updatedBillData, friendId || ""),
      );
      if (result) {
        alert(t("editBill.messages.success"));
        if (onSuccess) {
          onSuccess(result);
        }
        if (onClose) {
          onClose();
        } else {
          navigateWithState(-1, { preserve: false });
        }
      }
    } catch (error) {
      alert(t("editBill.messages.errorWithReason", { message: error.message }));
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigateWithState(-1, { preserve: false });
    }
  };

  const typeOptions = ["gain", "loss"];

  const FieldSkeleton = ({ width = 300 }) => (
    <Skeleton
      variant="rectangular"
      height={56}
      width={width}
      sx={{ bgcolor: colors.secondary_bg, borderRadius: 1 }}
    />
  );

  const ExpenseItemSkeleton = () => (
    <div
      className="rounded-lg p-2 border animate-pulse"
      style={{
        backgroundColor: colors.primary_bg,
        borderColor: colors.border_color,
      }}
    >
      <div className="flex justify-between mb-2">
        <Skeleton
          variant="text"
          width={90}
          height={16}
          sx={{ bgcolor: colors.hover_bg }}
        />
        <Skeleton
          variant="text"
          width={50}
          height={16}
          sx={{ bgcolor: colors.hover_bg }}
        />
      </div>
      <Skeleton
        variant="text"
        width={120}
        height={12}
        sx={{ bgcolor: colors.secondary_bg }}
      />
      <Skeleton
        variant="text"
        width={100}
        height={12}
        sx={{ bgcolor: colors.secondary_bg }}
      />
      <Skeleton
        variant="text"
        width={80}
        height={12}
        sx={{ bgcolor: colors.secondary_bg }}
      />
    </div>
  );

  if (loadError) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: colors.tertiary_bg,
          borderRadius: "8px",
          border: `1px solid ${colors.border_color}`,
          padding: "20px",
        }}
      >
        <div className="text-red-400 text-xl mb-4">
          {t("editBill.messages.loadErrorTitle")}
        </div>
        <p className="mb-6 text-center" style={{ color: colors.icon_muted }}>
          {loadError}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => window.location.reload()}
            sx={{
              backgroundColor: colors.button_bg,
              color: colors.button_text,
              "&:hover": { backgroundColor: colors.button_hover },
            }}
          >
            {t("editBill.buttons.retry")}
          </Button>
          <Button
            onClick={handleClose}
            sx={{
              backgroundColor: "#ff4444",
              color: "white",
              "&:hover": { backgroundColor: "#ff6666" },
            }}
          >
            {t("editBill.buttons.goBack")}
          </Button>
        </div>
      </div>
    );
  }

  const renderNameInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="name"
          className="text-sm sm:text-base font-semibold mr-4"
          style={{
            width: "150px",
            minWidth: "150px",
            display: "flex",
            alignItems: "center",
            color: colors.primary_text,
          }}
        >
          {t("billCommon.fields.name")}
          <span className="text-red-500"> *</span>
        </label>
        <div style={{ width: "100%", maxWidth: 300 }}>
          <ExpenseNameAutocomplete
            value={billData.name}
            onChange={(val) => {
              setBillData((prev) => ({ ...prev, name: val }));
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: false }));
              }
            }}
            friendId={friendId}
            placeholder={t("billCommon.placeholders.searchBillName")}
            error={errors.name}
            maxSuggestions={500}
            noDataText="No expense names found"
          />
        </div>
      </div>
    </div>
  );

  const renderDescriptionInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="description"
          className="text-sm sm:text-base font-semibold mr-4"
          style={{
            width: "150px",
            minWidth: "150px",
            display: "flex",
            alignItems: "center",
            color: colors.primary_text,
          }}
        >
          {t("billCommon.fields.description")}
        </label>
        <ThemedCommentField
          id="description"
          name="description"
          value={billData.description}
          onChange={handleInputChange}
          placeholder={t("billCommon.placeholders.description")}
          colors={colors}
          minRows={1}
          maxRows={3}
        />
      </div>
    </div>
  );

  const renderDateInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="date"
          className="text-sm sm:text-base font-semibold mr-4"
          style={{
            width: "150px",
            minWidth: "150px",
            display: "flex",
            alignItems: "center",
            color: colors.primary_text,
          }}
        >
          {t("billCommon.fields.date")}
          <span className="text-red-500"> *</span>
        </label>
        <ThemedDatePicker
          value={billData.date}
          onChange={handleDateChange}
          colors={colors}
          dateFormat={dateFormat}
          error={errors.date}
          disableFuture
          placeholder={dateFormat}
        />
      </div>
    </div>
  );

  const renderPaymentMethodAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="paymentMethod"
          className="text-sm sm:text-base font-semibold mr-4"
          style={{
            width: "150px",
            minWidth: "150px",
            display: "flex",
            alignItems: "center",
            color: colors.primary_text,
          }}
        >
          {t("billCommon.fields.paymentMethod")}
        </label>
        <PaymentMethodAutocomplete
          value={billData.paymentMethod}
          onChange={(paymentMethodValue) => {
            setBillData((prev) => ({
              ...prev,
              paymentMethod: paymentMethodValue,
            }));
          }}
          transactionType={billData.type}
          friendId={friendId}
          placeholder={t("billCommon.placeholders.paymentMethod")}
          size="medium"
        />
      </div>
    </div>
  );

  const renderTypeAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="type"
          className="text-sm sm:text-base font-semibold mr-4"
          style={{
            width: "150px",
            minWidth: "150px",
            display: "flex",
            alignItems: "center",
            color: colors.primary_text,
          }}
        >
          {t("billCommon.fields.type")}
          <span className="text-red-500"> *</span>
        </label>
        <ThemedAutocomplete
          options={typeOptions}
          value={billData.type || ""}
          onChange={handleTypeChange}
          getOptionLabel={(option) => t(`billCommon.typeOptions.${option}`)}
          colors={colors}
          error={errors.type}
          placeholder={t("billCommon.placeholders.type")}
        />
      </div>
    </div>
  );

  const renderCategoryAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="category"
          className="text-sm sm:text-base font-semibold mr-4"
          style={{
            width: "150px",
            minWidth: "150px",
            display: "flex",
            alignItems: "center",
            color: colors.primary_text,
          }}
        >
          {t("billCommon.fields.category")}
        </label>
        <CategoryAutocomplete
          value={billData.categoryId}
          onChange={(categoryId) => {
            setBillData((prev) => ({ ...prev, categoryId: categoryId }));
          }}
          friendId={friendId}
          placeholder={t("billCommon.placeholders.category")}
          size="medium"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <FormPageShell
        title={t("editBill.title")}
        onClose={handleClose}
        colors={colors}
        containerStyle={{ backgroundColor: colors.tertiary_bg }}
      >
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-1 gap-4 items-center">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <div className="flex flex-1 gap-4 items-center">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <div className="h-10 w-48 bg-secondary_bg rounded animate-pulse" />
          <div className="h-10 w-48 bg-secondary_bg rounded animate-pulse" />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <ExpenseItemSkeleton key={i} />
          ))}
        </div>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell
      title={t("editBill.title")}
      onClose={handleClose}
      colors={colors}
      containerStyle={{ backgroundColor: colors.tertiary_bg }}
    >
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-1 gap-4 items-center">
          {renderNameInput()}
          {renderDescriptionInput()}
          {renderDateInput()}
        </div>
        <div className="flex flex-1 gap-4 items-center">
          {renderTypeAutocomplete()}
          {renderPaymentMethodAutocomplete()}
          {renderCategoryAutocomplete()}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <Button
          onClick={handleToggleBudgetTable}
          startIcon={<LinkIcon />}
          sx={{
            backgroundColor: showBudgetTable
              ? colors.button_hover
              : colors.button_bg,
            color: colors.button_text,
            "&:hover": { backgroundColor: colors.button_hover },
          }}
        >
          {showBudgetTable
            ? t("billCommon.actions.hideBudgets")
            : t("billCommon.actions.linkBudgets")}
        </Button>

        <Button
          onClick={handleOpenExpenseTable}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: showExpenseTable
              ? colors.button_hover
              : colors.button_bg,
            color: colors.button_text,
            "&:hover": { backgroundColor: colors.button_hover },
          }}
        >
          {showExpenseTable
            ? t("billCommon.actions.hideExpenses")
            : t("billCommon.actions.editExpenses")}
        </Button>
      </div>

      {showBudgetTable && !showExpenseTable && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3
              className="text-xl font-semibold"
              style={{ color: colors.primary_text }}
            >
              {t("billCommon.budgets.heading")}
            </h3>
            <IconButton
              onClick={handleCloseBudgetTable}
              sx={{
                color: "#ff4444",
                "&:hover": { backgroundColor: "#ff444420" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>

          {budgetError && (
            <div className="text-red-500 text-sm mb-4">
              {t("billCommon.budgets.errorMessage", {
                message:
                  budgetError.message ||
                  t("billCommon.budgets.fallbackError"),
              })}
            </div>
          )}

          {budgetLoading ? (
            <div className="flex justify-center items-center py-8">
              <CircularProgress sx={{ color: colors.primary_accent }} />
            </div>
          ) : budgets.length === 0 ? (
            <div
              className="text-center py-8 rounded border"
              style={{
                color: colors.icon_muted,
                backgroundColor: colors.secondary_bg,
                borderColor: colors.border_color,
              }}
            >
              {t("billCommon.budgets.noBudgets")}
            </div>
          ) : (
            <BudgetSelectionTable
              budgets={budgets}
              selectedBudgetIds={selectedBudgets}
              onSelectionChange={setSelectedBudgets}
            />
          )}
        </div>
      )}

      {showExpenseTable && !showBudgetTable && (
        <BillExpenseTable
          tempExpenses={tempExpenses}
          onTempExpenseChange={handleTempExpenseChange}
          onItemNameChange={handleItemNameChange}
          onAddRow={addTempExpenseRow}
          onRemoveRow={removeTempExpenseRow}
          onSave={handleSaveExpenses}
          onClose={handleCloseExpenseTableWithConfirmation}
          colors={colors}
          currencySymbol={currencySymbol}
          t={t}
          lastRowRef={lastRowRef}
          saveLabelKey="billCommon.actions.saveChanges"
          validationHintKey="billCommon.expenseTable.validationHintSimple"
          expenseTableTitle={t("editBill.labels.expenseTableTitle")}
        />
      )}

      {!showExpenseTable && !showBudgetTable && (
        <BillExpenseSummary
          expenses={expenses}
          colors={colors}
          currencySymbol={currencySymbol}
          t={t}
          emptyTitle={t("billCommon.summary.noItemsTitle")}
          emptySubtitle={t("editBill.summary.noItemsSubtitle")}
        />
      )}

      {hasWriteAccess && (
        <div className="w-full flex justify-end mt-4 sm:mt-8">
          <SubmitButton
            onClick={handleSubmit}
            label={t("billCommon.actions.update")}
            isSubmitting={billLoading}
            colors={colors}
          />
        </div>
      )}
    </FormPageShell>
  );
};

export default EditBill;
