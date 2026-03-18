import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
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
import { createBill } from "../../../Redux/Bill/bill.action";
import { getListOfBudgetsById } from "../../../Redux/Budget/budget.action";
import usePreserveNavigationState from "../../../hooks/usePreserveNavigationState";
import ReceiptScanModal from "../../../components/ocr/ReceiptScanModal";
import BudgetSelectionTable from "../../../components/common/BudgetSelectionTable/BudgetSelectionTable";
import useFormPage from "../../../shared/form/hooks/useFormPage";
import FormPageShell from "../../../shared/form/components/FormPageShell";
import ThemedDatePicker from "../../../shared/form/fields/ThemedDatePicker";
import ThemedAutocomplete from "../../../shared/form/fields/ThemedAutocomplete";
import ThemedTextField from "../../../shared/form/fields/ThemedTextField";
import SubmitButton from "../../../shared/form/components/SubmitButton";
import BillExpenseTable from "../components/BillExpenseTable";
import BillExpenseSummary from "../components/BillExpenseSummary";

const REDIRECT_CONFIG = {
  buildFriendPath: (fid) => `/bill/${fid}`,
  selfPath: "/bill",
  defaultPath: "/bill",
};

const CreateBill = ({ onClose, onSuccess }) => {
  const {
    colors,
    t,
    dateFormat,
    currencySymbol,
    navigate,
    dispatch,
    friendId,
    hasWriteAccess,
  } = useFormPage({ redirectConfig: REDIRECT_CONFIG });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dateFromQuery = searchParams.get("date");
  const { navigateWithState } = usePreserveNavigationState();
  const today = new Date().toISOString().split("T")[0];
  const lastRowRef = useRef(null);

  const {
    budgets,
    error: budgetError,
    loading: budgetLoading,
  } = useSelector((state) => state.budgets || {});
  const { loading: billLoading } = useSelector((state) => state.bills || {});

  const [hasUnsavedExpenseChanges, setHasUnsavedExpenseChanges] = useState(false);
  const [billData, setBillData] = useState({
    name: "",
    description: "",
    amount: "",
    paymentMethod: "cash",
    type: "loss",
    date: dateFromQuery || today,
    categoryId: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [tempExpenses, setTempExpenses] = useState([
    { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0 },
  ]);
  const [errors, setErrors] = useState({});
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [showBudgetTable, setShowBudgetTable] = useState(false);
  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [showReceiptScanModal, setShowReceiptScanModal] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState({
    category: false,
    paymentMethod: false,
    type: false,
    description: false,
  });
  const [lastAutoFilledBillName, setLastAutoFilledBillName] = useState("");
  const [userModifiedFields, setUserModifiedFields] = useState({
    category: false,
    paymentMethod: false,
    type: false,
    description: false,
  });

  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    billData.name,
    billData.date,
    friendId,
  );

  const typeOptions = ["gain", "loss"];

  useEffect(() => {
    if (!billData.name || billData.name.trim().length < 2) {
      if (lastAutoFilledBillName) {
        setBillData((prev) => ({
          ...prev,
          categoryId: "",
          paymentMethod: "cash",
          type: "loss",
          description: "",
        }));
        setLastAutoFilledBillName("");
        setAutoFilledFields({
          category: false,
          paymentMethod: false,
          type: false,
          description: false,
        });
        setUserModifiedFields({
          category: false,
          paymentMethod: false,
          type: false,
          description: false,
        });
      }
      return;
    }

    if (previousExpense && billData.name?.trim().length >= 2) {
      const isNewBillName = billData.name.trim() !== lastAutoFilledBillName;
      const updates = {};
      const newAutoFilled = { ...autoFilledFields };

      if (
        previousExpense.categoryId &&
        (!billData.categoryId ||
          (isNewBillName && !userModifiedFields.category))
      ) {
        updates.categoryId = previousExpense.categoryId;
        newAutoFilled.category = true;
      }

      if (
        previousExpense.expense?.paymentMethod &&
        (billData.paymentMethod === "cash" ||
          (isNewBillName && !userModifiedFields.paymentMethod))
      ) {
        updates.paymentMethod = previousExpense.expense.paymentMethod;
        newAutoFilled.paymentMethod = true;
      }

      if (
        previousExpense.expense?.type &&
        (billData.type === "loss" ||
          (isNewBillName && !userModifiedFields.type))
      ) {
        updates.type = previousExpense.expense.type;
        newAutoFilled.type = true;
      }

      if (
        previousExpense.expense?.comments &&
        (!billData.description ||
          (isNewBillName && !userModifiedFields.description))
      ) {
        updates.description = previousExpense.expense.comments;
        newAutoFilled.description = true;
      } else if (
        !previousExpense.expense?.comments &&
        isNewBillName &&
        !userModifiedFields.description
      ) {
        updates.description = "";
        newAutoFilled.description = false;
      }

      if (Object.keys(updates).length > 0) {
        setBillData((prev) => ({ ...prev, ...updates }));
        setAutoFilledFields(newAutoFilled);
        setLastAutoFilledBillName(billData.name.trim());

        if (isNewBillName) {
          setUserModifiedFields({
            category: false,
            paymentMethod: false,
            type: false,
            description: false,
          });
        }

        setTimeout(() => {
          setAutoFilledFields({
            category: false,
            paymentMethod: false,
            type: false,
            description: false,
          });
        }, 3000);
      }
    }
  }, [previousExpense, billData.name]);

  useEffect(() => {
    dispatch(getListOfBudgetsById(today, friendId || ""));
  }, [dispatch, today, friendId]);

  useEffect(() => {
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + (expense.totalPrice || 0),
      0,
    );
    setBillData((prev) => ({ ...prev, amount: totalAmount.toString() }));
  }, [expenses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillData({ ...billData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleTypeChange = (event, newValue) => {
    const newType = newValue || "loss";
    setBillData((prev) => ({ ...prev, type: newType }));
    if (errors.type) {
      setErrors({ ...errors, type: false });
    }
  };

  const handleDateChange = (formatted) => {
    if (formatted) {
      setBillData((prev) => ({ ...prev, date: formatted }));
      dispatch(getListOfBudgetsById(formatted, friendId));
    }
    if (errors.date) {
      setErrors({ ...errors, date: false });
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

    setTimeout(() => {
      setTempExpenses([...updatedExpenses]);
    }, 0);
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
      alert(t("billCommon.messages.addExpenseValidationDetailed"));
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

  const handleCloseExpenseTable = () => {
    setShowExpenseTable(false);
    if (expenses.length > 0) {
      setTempExpenses([...expenses]);
    } else {
      setTempExpenses([
        { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0 },
      ]);
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
      alert(t("billCommon.messages.expensesRequiredCreate"));
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const totalAmount = validExpenses.reduce(
        (sum, expense) => sum + expense.totalPrice,
        0,
      );

      if (totalAmount <= 0) {
        alert(t("billCommon.messages.totalAmountInvalid"));
        return;
      }

      const netAmount = totalAmount;
      const normalizedMethod = normalizePaymentMethod(billData.paymentMethod);

      const billPayload = {
        name: billData.name.trim(),
        description: billData.description?.trim() || "",
        amount: totalAmount,
        netAmount: netAmount,
        paymentMethod: normalizedMethod,
        type: billData.type,
        date: billData.date,
        categoryId: billData.categoryId || 0,
        expenses: validExpenses.map((expense) => ({
          itemName: expense.itemName.trim(),
          quantity: parseFloat(expense.quantity),
          unitPrice: parseFloat(expense.unitPrice),
          totalPrice: expense.totalPrice,
          comments: expense.comments?.trim() || "",
        })),
        budgetIds: selectedBudgets || [],
        creditDue:
          billData.type === "loss" && normalizedMethod === "creditNeedToPaid"
            ? totalAmount
            : 0,
        includeInBudget: selectedBudgets.length > 0,
      };

      const resultAction = await dispatch(
        createBill(billPayload, friendId || ""),
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

        if (onSuccess) {
          onSuccess(resultAction.payload || resultAction);
        }

        if (onClose) {
          onClose();
        } else {
          navigate(-1);
          navigateWithState(-1, { preserve: false });
          navigateWithState(-1, { preserve: false });
        }
      } else {
        const errorMessage =
          resultAction?.error?.message ||
          resultAction?.payload?.message ||
          resultAction?.message ||
          "Failed to create bill. Please try again.";
        alert(
          t("createBill.messages.errorWithReason", { message: errorMessage }),
        );
      }
    } catch (error) {
      alert(
        t("createBill.messages.errorWithReason", {
          message: error.message || t("createBill.messages.failure"),
        }),
      );
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

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
        <ExpenseNameAutocomplete
          value={billData.name}
          onChange={(val) => {
            setBillData((prev) => ({ ...prev, name: val }));
            if (errors.name && val)
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
  );

  const renderDescriptionInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center relative">
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
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          {autoFilledFields.description && (
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
          )}
          <ThemedTextField
            id="description"
            name="description"
            value={billData.description}
            onChange={(e) => {
              handleInputChange(e);
              setUserModifiedFields((prev) => ({ ...prev, description: true }));
              if (autoFilledFields.description) {
                setAutoFilledFields((prev) => ({ ...prev, description: false }));
              }
            }}
            placeholder={t("billCommon.placeholders.description")}
            colors={colors}
          />
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
      <div className="flex items-center relative">
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
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          <PaymentMethodAutocomplete
            value={billData.paymentMethod}
            onChange={(paymentMethodValue) => {
              setBillData((prev) => ({
                ...prev,
                paymentMethod: paymentMethodValue,
              }));
              setUserModifiedFields((prev) => ({
                ...prev,
                paymentMethod: true,
              }));
              if (autoFilledFields.paymentMethod) {
                setAutoFilledFields((prev) => ({
                  ...prev,
                  paymentMethod: false,
                }));
              }
            }}
            transactionType={billData.type}
            friendId={friendId}
            placeholder={t("billCommon.placeholders.paymentMethod")}
            size="medium"
          />
          {autoFilledFields.paymentMethod && (
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
          )}
        </div>
      </div>
    </div>
  );

  const renderTypeAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center relative">
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
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          <ThemedAutocomplete
            options={typeOptions}
            value={billData.type || ""}
            onChange={(event, newValue) => {
              handleTypeChange(event, newValue);
              setUserModifiedFields((prev) => ({ ...prev, type: true }));
              if (autoFilledFields.type) {
                setAutoFilledFields((prev) => ({ ...prev, type: false }));
              }
            }}
            getOptionLabel={(option) => t(`billCommon.typeOptions.${option}`)}
            colors={colors}
            error={errors.type}
            placeholder={t("billCommon.placeholders.type")}
          />
          {autoFilledFields.type && (
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
          )}
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
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          <CategoryAutocomplete
            value={billData.categoryId}
            onChange={(categoryId) => {
              setBillData((prev) => ({ ...prev, categoryId: categoryId }));
              setUserModifiedFields((prev) => ({ ...prev, category: true }));
              if (autoFilledFields.category) {
                setAutoFilledFields((prev) => ({ ...prev, category: false }));
              }
            }}
            friendId={friendId}
            placeholder={t("billCommon.placeholders.category")}
            size="medium"
          />
          {autoFilledFields.category && (
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
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <FormPageShell
        title={t("createBill.title")}
        onClose={handleClose}
        colors={colors}
        rightContent={
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
                "&:hover": {
                  backgroundColor: colors.button_hover,
                },
              }}
            >
              {showBudgetTable
                ? t("billCommon.actions.hideBudgets")
                : t("billCommon.actions.linkBudgets")}
            </Button>

            <Tooltip title={t("billCommon.receiptScanner.tooltip")}>
              <Button
                onClick={() => setShowReceiptScanModal(true)}
                startIcon={<CameraIcon />}
                sx={{
                  backgroundColor: colors.primary_accent || "#00dac6",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: colors.primary_accent_hover || "#00b8a0",
                  },
                }}
              >
                {t("billCommon.receiptScanner.buttonLabel")}
              </Button>
            </Tooltip>
          </div>

          <Button
            onClick={handleOpenExpenseTable}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: showExpenseTable
                ? colors.button_hover
                : colors.button_bg,
              color: colors.button_text,
              "&:hover": {
                backgroundColor: colors.button_hover,
              },
            }}
          >
            {showExpenseTable
              ? t("billCommon.actions.hideExpenses")
              : t("billCommon.actions.addExpenses")}
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
                  "&:hover": {
                    backgroundColor: "#ff444420",
                  },
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
            expenseTableTitle={t("createBill.labels.expenseTableTitle")}
          />
        )}

        {!showExpenseTable && !showBudgetTable && (
          <BillExpenseSummary
            expenses={expenses}
            colors={colors}
            currencySymbol={currencySymbol}
            t={t}
            emptyTitle={t("billCommon.summary.noItemsTitle")}
            emptySubtitle={t("createBill.summary.noItemsSubtitle")}
          />
        )}

        {hasWriteAccess && (
          <div className="w-full flex justify-end mt-4 sm:mt-8">
            <SubmitButton
              onClick={handleSubmit}
              label={t("billCommon.actions.submit")}
              isSubmitting={billLoading}
              colors={colors}
            />
          </div>
        )}
      </FormPageShell>

      <ReceiptScanModal
        isOpen={showReceiptScanModal}
        onClose={() => setShowReceiptScanModal(false)}
        onDataExtracted={handleOcrDataExtracted}
      />
    </>
  );
};

export default CreateBill;
