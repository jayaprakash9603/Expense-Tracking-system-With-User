import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import {
  CategoryAutocomplete,
  PaymentMethodAutocomplete,
  ExpenseNameAutocomplete,
} from "../../../components/ui";
import PreviousExpenseIndicator from "../../../components/PreviousExpenseIndicator";
import { normalizePaymentMethod } from "../../../utils/paymentMethodUtils";
import usePreviousExpense from "../../expenses/hooks/usePreviousExpense";
import useBillAutoFill from "../hooks/useBillAutoFill";
import {
  createBill,
  updateBill,
  getBillById,
  getBillByExpenseId,
} from "../../../Redux/Bill/bill.action";
import { getListOfBudgetsById } from "../../../Redux/Budget/budget.action";
import usePreserveNavigationState from "../../../hooks/usePreserveNavigationState";
import ReceiptScanModal from "../../../components/ocr/ReceiptScanModal";
import BudgetSelectionTable from "../../../components/common/BudgetSelectionTable/BudgetSelectionTable";
import useFormPage from "../../../shared/form/hooks/useFormPage";
import FormPageShell from "../../../shared/form/components/FormPageShell";
import ThemedDatePicker from "../../../shared/form/fields/ThemedDatePicker";
import ThemedAutocomplete from "../../../shared/form/fields/ThemedAutocomplete";
import ThemedTextField from "../../../shared/form/fields/ThemedTextField";
import ThemedCommentField from "../../../shared/form/fields/ThemedCommentField";
import SubmitButton from "../../../shared/form/components/SubmitButton";
import BillExpenseTable from "./BillExpenseTable";
import BillExpenseSummary from "./BillExpenseSummary";

const REDIRECT_CONFIG = {
  buildFriendPath: (fid) => `/bill/${fid}`,
  selfPath: "/bill",
  defaultPath: "/bill",
};

const TYPE_OPTIONS = ["gain", "loss"];

const EMPTY_TEMP_ROW = {
  itemName: "",
  quantity: 1,
  unitPrice: "",
  totalPrice: 0,
  comments: "",
};

export default function BillFormPage({ mode, onClose, onSuccess, billId: propBillId }) {
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";

  const {
    colors,
    t,
    dateFormat,
    currencySymbol,
    navigate,
    dispatch,
    params,
    friendId,
    hasWriteAccess,
  } = useFormPage({ redirectConfig: REDIRECT_CONFIG });

  const location = useLocation();
  const dateFromQuery = isCreateMode
    ? new URLSearchParams(location.search).get("date")
    : null;
  const { navigateWithState } = usePreserveNavigationState();
  const today = new Date().toISOString().split("T")[0];
  const lastRowRef = useRef(null);

  const { id: paramId, expenseId } = params || {};
  const currentBillId = isEditMode ? (propBillId || paramId) : null;

  const {
    budgets = [],
    error: budgetError,
    loading: budgetLoading,
  } = useSelector((state) => state.budgets || {});
  const { loading: billLoading } = useSelector((state) => state.bills || {});

  const [hasUnsavedExpenseChanges, setHasUnsavedExpenseChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState(null);
  const [billData, setBillData] = useState({
    name: "",
    description: "",
    amount: "",
    paymentMethod: "cash",
    type: "loss",
    date: isCreateMode ? (dateFromQuery || today) : "",
    categoryId: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [tempExpenses, setTempExpenses] = useState([
    isCreateMode
      ? { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0 }
      : { ...EMPTY_TEMP_ROW },
  ]);
  const [errors, setErrors] = useState({});
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [showBudgetTable, setShowBudgetTable] = useState(false);
  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [showReceiptScanModal, setShowReceiptScanModal] = useState(false);

  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    isCreateMode ? billData.name : null,
    isCreateMode ? billData.date : null,
    isCreateMode ? friendId : null,
  );

  const { autoFilledFields, markUserModified } = useBillAutoFill(
    isCreateMode ? previousExpense : null,
    isCreateMode ? billData.name : null,
    billData,
    setBillData,
  );

  useEffect(() => {
    if (isEditMode) {
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
          const bill =
            billResponse?.payload || billResponse?.data || billResponse;
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
          if (bill.expenses?.length > 0) {
            setExpenses(
              bill.expenses.map((exp) => ({
                itemName: exp.itemName || exp.expenseName || "",
                quantity: exp.quantity || 1,
                unitPrice:
                  exp.unitPrice?.toString() || exp.amount?.toString() || "",
                totalPrice: exp.totalPrice || exp.amount || 0,
                comments: exp.comments || "",
              })),
            );
          } else {
            setExpenses([]);
          }
          setSelectedBudgets(
            bill.budgetIds && Array.isArray(bill.budgetIds)
              ? bill.budgetIds
              : [],
          );
        } catch (error) {
          setLoadError(
            error.message || t("editBill.messages.invalidData"),
          );
        } finally {
          setIsLoading(false);
        }
      };
      loadBillData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, currentBillId, dispatch, friendId, expenseId, t]);

  useEffect(() => {
    if (isCreateMode) {
      dispatch(getListOfBudgetsById(today, friendId || ""));
    }
  }, [isCreateMode, dispatch, today, friendId]);

  useEffect(() => {
    if (isEditMode && billData.date) {
      dispatch(getListOfBudgetsById(billData.date, friendId || ""));
    }
  }, [isEditMode, dispatch, billData.date, friendId]);

  useEffect(() => {
    const totalAmount = expenses.reduce(
      (sum, exp) => sum + (exp.totalPrice || 0),
      0,
    );
    setBillData((prev) => {
      if (prev.amount === totalAmount.toString()) return prev;
      return { ...prev, amount: totalAmount.toString() };
    });
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
    const updated = [...tempExpenses];
    if (field === "quantity" || field === "unitPrice") {
      const numValue = parseFloat(value);
      if (value === "" || numValue > 0) {
        updated[index][field] = value;
      } else {
        return;
      }
    } else {
      updated[index][field] = value;
    }
    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(updated[index].quantity) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      updated[index].totalPrice = qty * price;
    }
    setTempExpenses(updated);
    setHasUnsavedExpenseChanges(true);
  };

  const handleItemNameChange = (index, event, newValue) => {
    const updated = [...tempExpenses];
    updated[index].itemName = newValue || "";
    const qty = parseFloat(updated[index].quantity) || 1;
    const price = parseFloat(updated[index].unitPrice) || 0;
    updated[index].totalPrice = qty * price;
    setTempExpenses(updated);
    setHasUnsavedExpenseChanges(true);
    setTimeout(() => setTempExpenses([...updated]), 0);
  };

  const addTempExpenseRow = () => {
    if (BillExpenseTable.isRowComplete(tempExpenses[tempExpenses.length - 1])) {
      setTempExpenses([...tempExpenses, { ...EMPTY_TEMP_ROW }]);
      setHasUnsavedExpenseChanges(true);
      setTimeout(() => {
        if (lastRowRef.current) {
          lastRowRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
          const input = lastRowRef.current.querySelector("input");
          if (input) input.focus();
        }
      }, 100);
    }
  };

  const removeTempExpenseRow = (index) => {
    if (tempExpenses.length > 1) {
      setTempExpenses(tempExpenses.filter((_, i) => i !== index));
      setHasUnsavedExpenseChanges(true);
    }
  };

  const hasValidExpenseEntries = () => {
    return tempExpenses.some(
      (exp) =>
        exp.itemName.trim() !== "" ||
        (exp.unitPrice !== "" &&
          !isNaN(parseFloat(exp.unitPrice)) &&
          parseFloat(exp.unitPrice) > 0) ||
        (exp.quantity !== "" &&
          !isNaN(parseFloat(exp.quantity)) &&
          parseFloat(exp.quantity) > 0),
    );
  };

  const handleSaveExpenses = () => {
    const valid = tempExpenses.filter((exp) =>
      BillExpenseTable.isRowComplete(exp),
    );
    if (valid.length === 0) {
      alert(
        t(
          isCreateMode
            ? "billCommon.messages.addExpenseValidationDetailed"
            : "billCommon.messages.addExpenseValidationSimple",
        ),
      );
      return;
    }
    setExpenses(valid);
    setShowExpenseTable(false);
    setHasUnsavedExpenseChanges(false);
    setTempExpenses([{ ...EMPTY_TEMP_ROW }]);
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
        setTempExpenses([{ ...EMPTY_TEMP_ROW }]);
        setHasUnsavedExpenseChanges(false);
        setShowExpenseTable(false);
      }
    } else {
      if (isCreateMode && expenses.length > 0) {
        setTempExpenses([...expenses]);
      } else if (isCreateMode) {
        setTempExpenses([
          { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0 },
        ]);
      }
      setShowExpenseTable(false);
    }
  };

  const handleToggleBudgetTable = () => {
    setShowBudgetTable(!showBudgetTable);
    if (showExpenseTable) setShowExpenseTable(false);
  };

  const handleCloseBudgetTable = () => setShowBudgetTable(false);

  const handleOcrDataExtracted = (extractedData) => {
    if (!extractedData) return;
    setBillData((prev) => ({
      ...prev,
      name: extractedData.name || prev.name,
      description: extractedData.description || prev.description,
      amount: extractedData.amount?.toString() || prev.amount,
      paymentMethod: extractedData.paymentMethod || prev.paymentMethod,
      date: extractedData.date || prev.date,
    }));
    const successTitle = t("billCommon.receiptScanner.successMessage.title");
    const successBody = t("billCommon.receiptScanner.successMessage.body", {
      name: extractedData.name || t("common.notAvailable"),
      amount: `${currencySymbol}${extractedData.amount || "0"}`,
      date: extractedData.date || t("common.notAvailable"),
    });
    window.alert(`${successTitle}\n\n${successBody}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!billData.name) newErrors.name = true;
    if (!billData.date) newErrors.date = true;
    if (!billData.type) newErrors.type = true;

    const validExpenses = expenses.filter(
      (exp) =>
        exp.itemName.trim() !== "" &&
        exp.unitPrice !== "" &&
        !isNaN(parseFloat(exp.unitPrice)) &&
        parseFloat(exp.unitPrice) > 0 &&
        !exp.unitPrice.toString().includes("-") &&
        exp.quantity !== "" &&
        !isNaN(parseFloat(exp.quantity)) &&
        parseFloat(exp.quantity) > 0 &&
        !exp.quantity.toString().includes("-"),
    );

    if (validExpenses.length === 0) {
      newErrors.expenses = true;
      alert(
        t(
          isCreateMode
            ? "billCommon.messages.expensesRequiredCreate"
            : "billCommon.messages.expensesRequiredUpdate",
        ),
      );
    }

    if (isEditMode) {
      const invalid = expenses.filter(
        (exp) =>
          exp.itemName.trim() !== "" &&
          (exp.unitPrice === "" ||
            isNaN(parseFloat(exp.unitPrice)) ||
            parseFloat(exp.unitPrice) <= 0 ||
            exp.unitPrice.toString().includes("-") ||
            exp.quantity === "" ||
            isNaN(parseFloat(exp.quantity)) ||
            parseFloat(exp.quantity) <= 0 ||
            exp.quantity.toString().includes("-")),
      );
      if (invalid.length > 0) {
        newErrors.expenses = true;
        alert(t("billCommon.messages.invalidQuantityOrPrice"));
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const totalAmount = validExpenses.reduce(
        (sum, exp) => sum + exp.totalPrice,
        0,
      );
      if (totalAmount <= 0) {
        alert(t("billCommon.messages.totalAmountInvalid"));
        return;
      }

      const normalizedMethod = normalizePaymentMethod(billData.paymentMethod);
      const creditDue =
        billData.type === "loss" && normalizedMethod === "creditNeedToPaid"
          ? totalAmount
          : 0;

      if (isCreateMode) {
        const payload = {
          name: billData.name.trim(),
          description: billData.description?.trim() || "",
          amount: totalAmount,
          netAmount: totalAmount,
          paymentMethod: normalizedMethod,
          type: billData.type,
          date: billData.date,
          categoryId: billData.categoryId || 0,
          expenses: validExpenses.map((exp) => ({
            itemName: exp.itemName.trim(),
            quantity: parseFloat(exp.quantity),
            unitPrice: parseFloat(exp.unitPrice),
            totalPrice: exp.totalPrice,
            comments: exp.comments?.trim() || "",
          })),
          budgetIds: selectedBudgets || [],
          creditDue,
          includeInBudget: selectedBudgets.length > 0,
        };

        const resultAction = await dispatch(
          createBill(payload, friendId || ""),
        );
        if (resultAction && !resultAction.error) {
          alert(t("createBill.messages.success"));
          setBillData({
            name: "",
            description: "",
            amount: "",
            paymentMethod: "cash",
            type: "loss",
            date: dateFromQuery || today,
            categoryId: "",
          });
          setExpenses([]);
          setTempExpenses([
            { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0 },
          ]);
          setSelectedBudgets([]);
          setErrors({});
          setShowExpenseTable(false);
          setShowBudgetTable(false);
          setHasUnsavedExpenseChanges(false);
          if (onSuccess) onSuccess(resultAction.payload || resultAction);
          if (onClose) {
            onClose();
          } else {
            navigate(-1);
            navigateWithState(-1, { preserve: false });
            navigateWithState(-1, { preserve: false });
          }
        } else {
          const msg =
            resultAction?.error?.message ||
            resultAction?.payload?.message ||
            resultAction?.message ||
            "Failed to create bill. Please try again.";
          alert(t("createBill.messages.errorWithReason", { message: msg }));
        }
      } else {
        const updatedPayload = {
          id: currentBillId,
          name: billData.name,
          description: billData.description,
          amount: totalAmount,
          paymentMethod: normalizedMethod,
          type: billData.type,
          date: billData.date,
          categoryId: billData.categoryId || 0,
          budgetIds: selectedBudgets || [],
          expenses,
          netAmount: totalAmount,
          creditDue,
        };

        const result = await dispatch(
          updateBill(currentBillId, updatedPayload, friendId || ""),
        );
        if (result) {
          alert(t("editBill.messages.success"));
          if (onSuccess) onSuccess(result);
          if (onClose) {
            onClose();
          } else {
            navigateWithState(-1, { preserve: false });
          }
        }
      }
    } catch (error) {
      const key = isCreateMode
        ? "createBill.messages.errorWithReason"
        : "editBill.messages.errorWithReason";
      alert(
        t(key, {
          message:
            error.message ||
            t(
              isCreateMode
                ? "createBill.messages.failure"
                : "editBill.messages.failure",
            ),
        }),
      );
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (isEditMode) {
      navigateWithState(-1, { preserve: false });
    } else {
      navigate(-1);
    }
  };

  const autoFillBadge = (field) => {
    if (!isCreateMode || !autoFilledFields[field]) return null;
    return (
      <div
        className="absolute top-[-24px] right-0"
        style={{
          background: "linear-gradient(135deg, #00dac6 0%, #00b8a0 100%)",
          color: "#fff",
          fontSize: "0.65rem",
          padding: "2px 6px",
          borderRadius: "4px",
          fontWeight: "600",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 4px rgba(0,218,198,0.3)",
          zIndex: 10,
        }}
      >
        {t("billCommon.indicators.autoFilled")}
      </div>
    );
  };

  const labelStyle = {
    width: "150px",
    minWidth: "150px",
    display: "flex",
    alignItems: "center",
    color: colors.primary_text,
  };

  const renderNameInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="name"
          className="text-sm sm:text-base font-semibold mr-4"
          style={labelStyle}
        >
          {t("billCommon.fields.name")}
          <span className="text-red-500"> *</span>
        </label>
        <div style={isEditMode ? { width: "100%", maxWidth: 300 } : undefined}>
          <ExpenseNameAutocomplete
            value={billData.name}
            onChange={(val) => {
              setBillData((prev) => ({ ...prev, name: val }));
              if (errors.name)
                setErrors((prev) => ({ ...prev, name: false }));
            }}
            friendId={friendId}
            placeholder={t("billCommon.placeholders.searchBillName")}
            error={errors.name}
            size="medium"
            maxSuggestions={500}
            noDataText="No expense names found"
          />
        </div>
      </div>
    </div>
  );

  const renderDescriptionInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center relative">
        <label
          htmlFor="description"
          className="text-sm sm:text-base font-semibold mr-4"
          style={labelStyle}
        >
          {t("billCommon.fields.description")}
        </label>
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          {autoFillBadge("description")}
          {isCreateMode ? (
            <ThemedTextField
              id="description"
              name="description"
              value={billData.description}
              onChange={(e) => {
                handleInputChange(e);
                markUserModified("description");
              }}
              placeholder={t("billCommon.placeholders.description")}
              colors={colors}
            />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );

  const renderDateInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="date"
          className="text-sm sm:text-base font-semibold mr-4"
          style={labelStyle}
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

  const renderTypeAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center relative">
        <label
          htmlFor="type"
          className="text-sm sm:text-base font-semibold mr-4"
          style={labelStyle}
        >
          {t("billCommon.fields.type")}
          <span className="text-red-500"> *</span>
        </label>
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          <ThemedAutocomplete
            options={TYPE_OPTIONS}
            value={billData.type || ""}
            onChange={(event, newValue) => {
              handleTypeChange(event, newValue);
              if (isCreateMode) markUserModified("type");
            }}
            getOptionLabel={(option) => t(`billCommon.typeOptions.${option}`)}
            colors={colors}
            error={errors.type}
            placeholder={t("billCommon.placeholders.type")}
          />
          {autoFillBadge("type")}
        </div>
      </div>
    </div>
  );

  const renderPaymentMethodAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center relative">
        <label
          htmlFor="paymentMethod"
          className="text-sm sm:text-base font-semibold mr-4"
          style={labelStyle}
        >
          {t("billCommon.fields.paymentMethod")}
        </label>
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          <PaymentMethodAutocomplete
            value={billData.paymentMethod}
            onChange={(val) => {
              setBillData((prev) => ({ ...prev, paymentMethod: val }));
              if (isCreateMode) markUserModified("paymentMethod");
            }}
            transactionType={billData.type}
            friendId={friendId}
            placeholder={t("billCommon.placeholders.paymentMethod")}
            size="medium"
          />
          {autoFillBadge("paymentMethod")}
        </div>
      </div>
    </div>
  );

  const renderCategoryAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center relative">
        <label
          htmlFor="category"
          className="text-sm sm:text-base font-semibold mr-4"
          style={labelStyle}
        >
          {t("billCommon.fields.category")}
        </label>
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          <CategoryAutocomplete
            value={billData.categoryId}
            onChange={(categoryId) => {
              setBillData((prev) => ({ ...prev, categoryId }));
              if (isCreateMode) markUserModified("category");
            }}
            friendId={friendId}
            placeholder={t("billCommon.placeholders.category")}
            size="medium"
          />
          {autoFillBadge("category")}
        </div>
      </div>
    </div>
  );

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
        <Skeleton variant="text" width={90} height={16} sx={{ bgcolor: colors.hover_bg }} />
        <Skeleton variant="text" width={50} height={16} sx={{ bgcolor: colors.hover_bg }} />
      </div>
      <Skeleton variant="text" width={120} height={12} sx={{ bgcolor: colors.secondary_bg }} />
      <Skeleton variant="text" width={100} height={12} sx={{ bgcolor: colors.secondary_bg }} />
      <Skeleton variant="text" width={80} height={12} sx={{ bgcolor: colors.secondary_bg }} />
    </div>
  );

  if (isEditMode && loadError) {
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

  if (isEditMode && isLoading) {
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

  const pageTitle = isCreateMode ? t("createBill.title") : t("editBill.title");
  const expenseButtonLabel = showExpenseTable
    ? t("billCommon.actions.hideExpenses")
    : isCreateMode
      ? t("billCommon.actions.addExpenses")
      : t("billCommon.actions.editExpenses");
  const submitLabel = isCreateMode
    ? t("billCommon.actions.submit")
    : t("billCommon.actions.update");
  const expenseTableTitle = isCreateMode
    ? t("createBill.labels.expenseTableTitle")
    : t("editBill.labels.expenseTableTitle");
  const emptySubtitle = isCreateMode
    ? t("createBill.summary.noItemsSubtitle")
    : t("editBill.summary.noItemsSubtitle");

  return (
    <>
      <FormPageShell
        title={pageTitle}
        onClose={handleClose}
        colors={colors}
        rightContent={
          isCreateMode &&
          billData.name?.trim().length >= 2 &&
          billData.date && (
            <PreviousExpenseIndicator
              expense={previousExpense}
              isLoading={loadingPreviousExpense}
              position="right"
              variant="gradient"
              showTooltip={true}
              dateFormat={dateFormat}
              label={t("billCommon.indicators.previouslyAdded")}
              labelPosition="top"
              icon="calendar"
              tooltipConfig={{
                showAmount: true,
                showPaymentMethod: true,
                showType: true,
              }}
              colorScheme={{
                primary: "#00dac6",
                secondary: "#00b8a0",
                text: "#ffffff",
                subtext: "#9ca3af",
              }}
            />
          )
        }
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
          <div className="flex gap-2">
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

            {isCreateMode && (
              <Tooltip title={t("billCommon.receiptScanner.tooltip")}>
                <Button
                  onClick={() => setShowReceiptScanModal(true)}
                  startIcon={<CameraIcon />}
                  sx={{
                    backgroundColor: colors.primary_accent || "#00dac6",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor:
                        colors.primary_accent_hover || "#00b8a0",
                    },
                  }}
                >
                  {t("billCommon.receiptScanner.buttonLabel")}
                </Button>
              </Tooltip>
            )}
          </div>

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
            {expenseButtonLabel}
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
            expenseTableTitle={expenseTableTitle}
            {...(isEditMode && {
              saveLabelKey: "billCommon.actions.saveChanges",
              validationHintKey:
                "billCommon.expenseTable.validationHintSimple",
            })}
          />
        )}

        {!showExpenseTable && !showBudgetTable && (
          <BillExpenseSummary
            expenses={expenses}
            colors={colors}
            currencySymbol={currencySymbol}
            t={t}
            emptyTitle={t("billCommon.summary.noItemsTitle")}
            emptySubtitle={emptySubtitle}
          />
        )}

        {hasWriteAccess && (
          <div className="w-full flex justify-end mt-4 sm:mt-8">
            <SubmitButton
              onClick={handleSubmit}
              label={submitLabel}
              isSubmitting={billLoading}
              colors={colors}
            />
          </div>
        )}
      </FormPageShell>

      {isCreateMode && (
        <ReceiptScanModal
          isOpen={showReceiptScanModal}
          onClose={() => setShowReceiptScanModal(false)}
          onDataExtracted={handleOcrDataExtracted}
        />
      )}
    </>
  );
}
