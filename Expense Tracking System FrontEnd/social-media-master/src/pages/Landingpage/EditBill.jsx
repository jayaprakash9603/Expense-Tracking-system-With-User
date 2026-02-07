import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ItemNameAutocomplete from "./ItemNameAutocomplete";
import {
  CategoryAutocomplete,
  PaymentMethodAutocomplete,
  ExpenseNameAutocomplete,
} from "../../components/ui";
import PageHeader from "../../components/PageHeader";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  IconButton,
  Button,
  Skeleton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { getListOfBudgetsById } from "../../Redux/Budget/budget.action";
import { useLocation, useParams } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess"; // retains gating
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import {
  updateBill,
  getBillById,
  getBillByExpenseId,
} from "../../Redux/Bill/bill.action";
import { normalizePaymentMethod } from "../../utils/paymentMethodUtils";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useTranslation } from "../../hooks/useTranslation";
import usePreserveNavigationState from "../../hooks/usePreserveNavigationState";

const EditBill = ({ onClose, onSuccess, billId }) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const currencySymbol = settings.getCurrency().symbol;
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";

  const labelStyle = `text-sm sm:text-base font-semibold mr-4`;
  const inputWrapper = {
    width: "150px",
    minWidth: "150px",
    display: "flex",
    alignItems: "center",
  };
  const location = useLocation();
  const { navigateWithState } = usePreserveNavigationState();
  const dispatch = useDispatch();
  const { id, friendId, expenseId } = useParams();
  const { hasWriteAccess } = useFriendAccess(friendId);
  useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) => `/bill/${fid}`,
    selfPath: "/bill",
    defaultPath: "/bill",
  });
  const lastRowRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // (redirect handled by hook)

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
    { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0, comments: "" },
  ]);

  const [errors, setErrors] = useState({});
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [showBudgetTable, setShowBudgetTable] = useState(false);
  const [checkboxStates, setCheckboxStates] = useState([]);
  const [selectedBudgets, setSelectedBudgets] = useState([]);

  // Load bill data on component mount
  useEffect(() => {
    const loadBillData = async () => {
      // If neither bill ID nor expense ID is provided, show error
      if (!currentBillId && !expenseId) {
        setLoadError(t("editBill.messages.noBillId"));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);

        let billResponse;

        // If accessed via expense ID route, fetch bill by expense ID
        if (expenseId && !currentBillId) {
          billResponse = await dispatch(
            getBillByExpenseId(expenseId, friendId || ""),
          );
        } else {
          // Fetch bill by bill ID
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
          const formattedExpenses = bill.expenses.map((expense, index) => ({
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
        console.error("Error loading bill:", error);
        setLoadError(error.message || t("editBill.messages.invalidData"));
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false); // Mark initial load as complete
      }
    };

    loadBillData();
  }, [currentBillId, dispatch, id, friendId, expenseId, t]);

  const isCurrentRowComplete = (expense) => {
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
  };

  useEffect(() => {
    if (billData.date) {
      dispatch(getListOfBudgetsById(billData.date, friendId || ""));
    }
  }, [dispatch, billData.date]);

  useEffect(() => {
    if (budgets.length > 0) {
      const newCheckboxStates = budgets.map(
        (budget) =>
          selectedBudgets.includes(budget.id) ||
          budget.includeInBudget ||
          false,
      );
      setCheckboxStates((prev) =>
        JSON.stringify(prev) !== JSON.stringify(newCheckboxStates)
          ? newCheckboxStates
          : prev,
      );
    }
  }, [budgets, selectedBudgets]);

  useEffect(() => {
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + (expense.totalPrice || 0),
      0,
    );
    if (billData.amount !== totalAmount.toString()) {
      setBillData((prev) => ({ ...prev, amount: totalAmount.toString() }));
    }
  }, [expenses]);

  // useEffect(() => {
  //   const selected = budgets.filter((_, index) => checkboxStates[index]);
  //   setSelectedBudgets((prev) =>
  //     JSON.stringify(prev) !== JSON.stringify(selected.map((b) => b.id))
  //       ? selected.map((b) => b.id)
  //       : prev
  //   );
  // }, [checkboxStates, budgets]);

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

  const handleDateChange = (newValue) => {
    if (newValue) {
      const formatted = dayjs(newValue).format("YYYY-MM-DD");
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
    if (isCurrentRowComplete(tempExpenses[tempExpenses.length - 1])) {
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
      isCurrentRowComplete(expense),
    );

    if (validExpenses.length === 0) {
      alert(t("billCommon.messages.addExpenseValidationSimple"));
      return;
    }

    setExpenses(validExpenses);
    setShowExpenseTable(false);
    setHasUnsavedExpenseChanges(false);
    setTempExpenses([
      { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0, comments: "" },
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
      const selectedBudgetIds = budgets
        .filter((_, index) => checkboxStates[index])
        .map((budget) => budget.id);

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
      console.error("Error updating bill:", error);
      alert(t("editBill.messages.errorWithReason", { message: error.message }));
    }
  };

  const handleCheckboxChange = (index) => {
    setCheckboxStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  // Skeleton helpers to avoid layout shift while loading
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
      <>
        {/* <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}
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
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  navigateWithState(-1, { preserve: false });
                }
              }}
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
      </>
    );
  }

  const renderNameInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="name"
          className={labelStyle}
          style={{ ...inputWrapper, color: colors.primary_text }}
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
          className={labelStyle}
          style={{ ...inputWrapper, color: colors.primary_text }}
        >
          {t("billCommon.fields.description")}
        </label>
        <TextField
          id="description"
          name="description"
          value={billData.description}
          onChange={handleInputChange}
          placeholder={t("billCommon.placeholders.description")}
          variant="outlined"
          multiline
          rows={1}
          sx={{
            width: "100%",
            maxWidth: "300px",
            "& .MuiInputBase-root": {
              backgroundColor: colors.secondary_bg,
              color: colors.primary_text,
              fontSize: "16px",
            },
            "& .MuiInputBase-input": {
              color: colors.primary_text,
              "&::placeholder": { color: colors.placeholder_text, opacity: 1 },
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.border_color,
                borderWidth: "1px",
              },
              "&:hover fieldset": { borderColor: colors.border_color },
              "&.Mui-focused fieldset": {
                borderColor: colors.secondary_accent,
                borderWidth: "2px",
              },
            },
          }}
        />
      </div>
    </div>
  );

  const renderDateInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="date"
          className={labelStyle}
          style={{ ...inputWrapper, color: colors.primary_text }}
        >
          {t("billCommon.fields.date")}
          <span className="text-red-500"> *</span>
        </label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={billData.date ? dayjs(billData.date) : null}
            onChange={handleDateChange}
            format={dateFormat}
            sx={{
              background: colors.secondary_bg,
              borderRadius: 2,
              color: colors.primary_text,
              ".MuiInputBase-input": {
                color: colors.primary_text,
                height: 32,
                fontSize: 16,
              },
              ".MuiSvgIcon-root": { color: colors.secondary_accent },
              width: 300,
              height: 56,
              minHeight: 56,
              maxHeight: 56,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: errors.date ? "#ff4d4f" : colors.border_color,
                  borderWidth: "1px",
                },
                "&:hover fieldset": {
                  borderColor: errors.date ? "#ff4d4f" : colors.border_color,
                },
                "&.Mui-focused fieldset": {
                  borderColor: errors.date
                    ? "#ff4d4f"
                    : colors.secondary_accent,
                  borderWidth: "2px",
                },
              },
            }}
            slotProps={{
              textField: {
                size: "medium",
                variant: "outlined",
                error: errors.date,
                sx: {
                  color: colors.primary_text,
                  height: 56,
                  minHeight: 56,
                  maxHeight: 56,
                  width: 300,
                  fontSize: 16,
                  "& .MuiInputBase-root": {
                    height: 56,
                    minHeight: 56,
                    maxHeight: 56,
                  },
                  "& input": { height: 32, fontSize: 16 },
                },
                inputProps: { max: dayjs().format("YYYY-MM-DD") },
              },
              popper: {
                sx: {
                  "& .MuiPaper-root": {
                    backgroundColor: colors.card_bg,
                    color: colors.primary_text,
                    border: `1px solid ${colors.border_color}`,
                  },
                  "& .MuiPickersDay-root": {
                    color: colors.primary_text,
                    "&:hover": { backgroundColor: colors.hover_bg },
                    "&.Mui-selected": {
                      backgroundColor: colors.primary_accent,
                      color: colors.button_text,
                    },
                  },
                  "& .MuiPickersCalendarHeader-label": {
                    color: colors.primary_text,
                  },
                  "& .MuiPickersCalendarHeader-switchViewButton": {
                    color: colors.primary_accent,
                  },
                  "& .MuiPickersArrowSwitcher-button": {
                    color: colors.primary_accent,
                  },
                  "& .MuiDayCalendar-weekDayLabel": {
                    color: colors.icon_muted,
                  },
                  "& .MuiPickersYear-yearButton": {
                    color: colors.primary_text,
                    "&:hover": { backgroundColor: colors.hover_bg },
                    "&.Mui-selected": {
                      backgroundColor: colors.primary_accent,
                      color: colors.button_text,
                    },
                  },
                },
              },
            }}
            disableFuture
          />
        </LocalizationProvider>
      </div>
    </div>
  );

  const renderPaymentMethodAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="paymentMethod"
          className={labelStyle}
          style={{ ...inputWrapper, color: colors.primary_text }}
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
          className={labelStyle}
          style={{ ...inputWrapper, color: colors.primary_text }}
        >
          {t("billCommon.fields.type")}
          <span className="text-red-500"> *</span>
        </label>
        <Autocomplete
          autoHighlight
          options={["gain", "loss"]}
          getOptionLabel={(option) => t(`billCommon.typeOptions.${option}`)}
          value={billData.type || ""}
          onChange={handleTypeChange}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("billCommon.placeholders.type")}
              variant="outlined"
              error={errors.type}
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: colors.secondary_bg,
                  color: colors.primary_text,
                  height: "56px",
                  fontSize: "16px",
                },
                "& .MuiInputBase-input": {
                  color: colors.primary_text,
                  "&::placeholder": {
                    color: colors.placeholder_text,
                    opacity: 1,
                  },
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: errors.type ? "#ff4d4f" : colors.border_color,
                    borderWidth: "1px",
                  },
                  "&:hover fieldset": {
                    borderColor: errors.type ? "#ff4d4f" : colors.border_color,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: errors.type
                      ? "#ff4d4f"
                      : colors.secondary_accent,
                    borderWidth: "2px",
                  },
                },
              }}
            />
          )}
          sx={{ width: "100%", maxWidth: "300px" }}
        />
      </div>
    </div>
  );

  const renderCategoryAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="category"
          className={labelStyle}
          style={{ ...inputWrapper, color: colors.primary_text }}
        >
          {t("billCommon.fields.category")}
        </label>
        <CategoryAutocomplete
          value={billData.categoryId}
          onChange={(categoryId) => {
            setBillData((prev) => ({
              ...prev,
              categoryId: categoryId,
            }));
          }}
          friendId={friendId}
          placeholder={t("billCommon.placeholders.category")}
          size="medium"
        />
      </div>
    </div>
  );

  const dataGridColumns = [
    {
      field: "includeInBudget",
      headerName: (
        <input
          type="checkbox"
          checked={checkboxStates.length > 0 && checkboxStates.every(Boolean)}
          ref={(el) => {
            if (el) {
              el.indeterminate =
                checkboxStates.some(Boolean) && !checkboxStates.every(Boolean);
            }
          }}
          onChange={(e) => {
            const checked = e.target.checked;
            setCheckboxStates(Array(budgets.length).fill(checked));
          }}
          className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
          style={{ accentColor: "#00b8a0", marginLeft: 2, marginRight: 2 }}
        />
      ),
      flex: 0.25,
      minWidth: 40,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={checkboxStates[params.row.index]}
          onChange={() => handleCheckboxChange(params.row.index)}
          className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
          style={{ accentColor: "#00b8a0" }}
        />
      ),
    },
    {
      field: "name",
      headerName: t("billCommon.budgets.columns.name"),
      flex: 1,
      minWidth: 120,
    },
    {
      field: "description",
      headerName: t("billCommon.budgets.columns.description"),
      flex: 1,
      minWidth: 120,
    },
    {
      field: "startDate",
      headerName: t("billCommon.budgets.columns.startDate"),
      flex: 1,
      minWidth: 100,
    },
    {
      field: "endDate",
      headerName: t("billCommon.budgets.columns.endDate"),
      flex: 1,
      minWidth: 100,
    },
    {
      field: "remainingAmount",
      headerName: t("billCommon.budgets.columns.remainingAmount"),
      flex: 1,
      minWidth: 120,
    },
    {
      field: "amount",
      headerName: t("billCommon.budgets.columns.amount"),
      flex: 1,
      minWidth: 100,
    },
  ];

  const dataGridRows = Array.isArray(budgets)
    ? budgets.map((item, index) => ({
        ...item,
        index,
        id: item.id ?? `temp-${index}-${Date.now()}`,
        includeInBudget: checkboxStates[index],
      }))
    : [];

  const selectedIds = dataGridRows
    .filter((_, idx) => checkboxStates[idx])
    .map((row) => row.id);

  const handleDataGridSelection = (newSelection) => {
    const newCheckboxStates = dataGridRows.map((row) =>
      newSelection.includes(row.id),
    );
    setCheckboxStates(newCheckboxStates);
  };

  const expenseSummaryCountKey =
    expenses.length === 1
      ? "billCommon.summary.singleItem"
      : "billCommon.summary.multipleItems";
  const expenseSummaryCountLabel = t(expenseSummaryCountKey, {
    count: expenses.length,
  });

  return (
    <>
      {/* <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}
      <div
        className="flex flex-col relative edit-bill-container"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: colors.tertiary_bg,
          borderRadius: "8px",
          marginRight: "20px",
          border: `1px solid ${colors.border_color}`,
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <PageHeader
          title={t("editBill.title")}
          onClose={() => {
            if (onClose) {
              onClose();
            } else {
              navigateWithState(-1, { preserve: false });
            }
          }}
        />

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
              <Box
                sx={{
                  height: 325,
                  width: "100%",
                  background: colors.secondary_bg,
                  borderRadius: 2,
                  border: `1px solid ${colors.border_color}`,
                }}
              >
                <DataGrid
                  rows={dataGridRows}
                  columns={dataGridColumns}
                  getRowId={(row) => row.id}
                  disableRowSelectionOnClick
                  selectionModel={selectedIds}
                  onRowSelectionModelChange={handleDataGridSelection}
                  pageSizeOptions={[5, 10, 20]}
                  initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 5 } },
                  }}
                  rowHeight={42}
                  headerHeight={32}
                  sx={{
                    color: colors.primary_text,
                    border: 0,
                    "& .MuiDataGrid-columnHeaders": {
                      background: colors.tertiary_bg,
                    },
                    "& .MuiDataGrid-row": { background: colors.secondary_bg },
                    "& .MuiCheckbox-root": {
                      color: `${colors.primary_accent} !important`,
                    },
                    fontSize: "0.92rem",
                  }}
                />
              </Box>
            )}
          </div>
        )}

        {showExpenseTable && !showBudgetTable && (
          <div className="mt-6 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-xl font-semibold"
                style={{ color: colors.primary_text }}
              >
                {t("editBill.labels.expenseTableTitle")}
              </h3>
              <IconButton
                onClick={handleCloseExpenseTableWithConfirmation}
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
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  {t("billCommon.expenseTable.headers.itemName")}
                </div>
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  {t("billCommon.expenseTable.headers.quantity")}
                </div>
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  {t("billCommon.expenseTable.headers.unitPrice")}
                </div>
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  {t("billCommon.expenseTable.headers.totalPrice")}
                </div>
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  {t("billCommon.expenseTable.headers.comments")}
                </div>
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  {t("billCommon.expenseTable.headers.actions")}
                </div>
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
                            handleItemNameChange(index, event, newValue)
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
                              handleTempExpenseChange(index, "quantity", value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (["-", "e", "E", "+", "."].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className={`w-full px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 text-sm ${
                            hasItemName &&
                            (!expense.quantity ||
                              parseFloat(expense.quantity) <= 0)
                              ? "border border-red-400 focus:ring-red-400 outline-none"
                              : ""
                          }`}
                          style={{
                            backgroundColor:
                              hasItemName &&
                              (!expense.quantity ||
                                parseFloat(expense.quantity) <= 0)
                                ? "rgba(255, 68, 68, 0.2)"
                                : colors.secondary_bg,
                            color: colors.primary_text,
                            borderColor:
                              hasItemName &&
                              (!expense.quantity ||
                                parseFloat(expense.quantity) <= 0)
                                ? "#ff4d4f"
                                : colors.border_color,
                          }}
                          onFocus={(e) => {
                            if (
                              !(
                                hasItemName &&
                                (!expense.quantity ||
                                  parseFloat(expense.quantity) <= 0)
                              )
                            ) {
                              e.target.style.outline = `2px solid ${colors.secondary_accent}`;
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.outline = "none";
                          }}
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
                              handleTempExpenseChange(
                                index,
                                "unitPrice",
                                value,
                              );
                            }
                          }}
                          onKeyDown={(e) => {
                            if (["-", "e", "E", "+"].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className={`w-full px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 text-sm ${
                            isIncomplete
                              ? "border border-red-400 focus:ring-red-400 outline-none"
                              : ""
                          }`}
                          style={{
                            backgroundColor: isIncomplete
                              ? "rgba(255, 68, 68, 0.2)"
                              : colors.secondary_bg,
                            color: colors.primary_text,
                            borderColor: isIncomplete
                              ? "#ff4d4f"
                              : colors.border_color,
                          }}
                          onFocus={(e) => {
                            if (!isIncomplete) {
                              e.target.style.outline = `2px solid ${colors.secondary_accent}`;
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.outline = "none";
                          }}
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
                            handleTempExpenseChange(
                              index,
                              "comments",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 text-sm"
                          style={{
                            backgroundColor: colors.secondary_bg,
                            color: colors.primary_text,
                          }}
                          onFocus={(e) => {
                            e.target.style.outline = `2px solid ${colors.secondary_accent}`;
                          }}
                          onBlur={(e) => {
                            e.target.style.outline = "none";
                          }}
                        />
                      </div>
                      <div className="col-span-1 flex gap-2">
                        <IconButton
                          onClick={() => removeTempExpenseRow(index)}
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
                className="mt-4 pt-4 border-t"
                style={{ borderColor: colors.border_color }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <Button
                      onClick={addTempExpenseRow}
                      startIcon={<AddIcon />}
                      disabled={
                        !isCurrentRowComplete(
                          tempExpenses[tempExpenses.length - 1],
                        )
                      }
                      sx={{
                        backgroundColor: isCurrentRowComplete(
                          tempExpenses[tempExpenses.length - 1],
                        )
                          ? colors.button_bg
                          : "#666",
                        color: isCurrentRowComplete(
                          tempExpenses[tempExpenses.length - 1],
                        )
                          ? colors.button_text
                          : "#999",
                        "&:hover": {
                          backgroundColor: isCurrentRowComplete(
                            tempExpenses[tempExpenses.length - 1],
                          )
                            ? colors.button_hover
                            : "#666",
                        },
                        "&:disabled": {
                          backgroundColor: "#666",
                          color: "#999",
                        },
                        fontSize: "0.875rem",
                        padding: "6px 12px",
                      }}
                      size="small"
                    >
                      {t("billCommon.actions.addRow")}
                    </Button>
                    {!isCurrentRowComplete(
                      tempExpenses[tempExpenses.length - 1],
                    ) && (
                      <div className="text-red-400 text-xs mt-1">
                        {t("billCommon.expenseTable.validationHintSimple")}
                      </div>
                    )}
                  </div>
                  {tempExpenses.length > 0 && (
                    <div
                      className="font-semibold"
                      style={{ color: colors.primary_text }}
                    >
                      {t("billCommon.expenseTable.totalLabel")}:{" "}
                      {currencySymbol}
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
                      onClick={handleCloseExpenseTableWithConfirmation}
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
                      onClick={handleSaveExpenses}
                      sx={{
                        backgroundColor: colors.button_bg,
                        color: colors.button_text,
                        "&:hover": { backgroundColor: colors.button_hover },
                        fontSize: "0.875rem",
                        padding: "6px 12px",
                      }}
                      size="small"
                    >
                      {t("billCommon.actions.saveChanges")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showExpenseTable && !showBudgetTable && (
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
                  {expenseSummaryCountLabel}
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
                    {t("billCommon.summary.noItemsTitle")}
                  </p>
                  <p className="text-xs" style={{ color: colors.icon_muted }}>
                    {t("editBill.summary.noItemsSubtitle")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className="max-h-80 overflow-y-auto pr-2"
                    style={{
                      maxHeight: "285px",
                      scrollbarWidth: "thin",
                      scrollbarColor: `${colors.secondary_accent} ${colors.primary_bg}`,
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
                                {t(
                                  "billCommon.expenseTable.summaryLabels.unit",
                                )}
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
                                {t(
                                  "billCommon.expenseTable.summaryLabels.calc",
                                )}
                              </span>
                              <span style={{ color: colors.secondary_text }}>
                                {expense.quantity} × {currencySymbol}
                                {parseFloat(expense.unitPrice).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {expense.comments &&
                            expense.comments.trim() !== "" && (
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
                    className="border-t pt-3 mt-3"
                    style={{ borderColor: colors.border_color }}
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
                          .reduce((sum, expense) => sum + expense.totalPrice, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {hasWriteAccess && (
          <div className="w-full flex justify-end mt-4 sm:mt-8">
            <button
              onClick={handleSubmit}
              disabled={billLoading}
              className="px-6 py-2 font-semibold rounded w-full sm:w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.button_bg,
                color: colors.button_text,
              }}
              onMouseEnter={(e) => {
                if (!billLoading) {
                  e.target.style.backgroundColor = colors.button_hover;
                }
              }}
              onMouseLeave={(e) => {
                if (!billLoading) {
                  e.target.style.backgroundColor = colors.button_bg;
                }
              }}
            >
              {billLoading ? (
                <CircularProgress
                  size={20}
                  sx={{ color: colors.button_text }}
                />
              ) : (
                t("billCommon.actions.update")
              )}
            </button>
          </div>
        )}

        <style>
          {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: url('https://cdn-icons-png.flaticon.com/128/8350/8350450.png') no-repeat;
            background-size: 18px;
            filter: invert(1) brightness(100) contrast(100);
          }
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
            appearance: none;
          }
          .overflow-y-auto::-webkit-scrollbar {
            width: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: ${colors.primary_bg};
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: ${colors.secondary_accent};
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: ${colors.button_hover};
          }
          .overflow-x-auto::-webkit-scrollbar {
            height: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-track {
            background: ${colors.primary_bg};
          }
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: ${colors.secondary_accent};
            border-radius: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: ${colors.button_hover};
          }
          @media (max-width: 640px) {
            .edit-bill-container {
              width: 100vw !important;
              height: auto !important;
              padding: 16px;
            }
            .form-row {
              flex-direction: column !important;
              gap: 12px;
            }
            .field-styles {
              max-width: 100% !important;
              width: 100% !important;
              padding: 8px;
              font-size: 0.875rem;
            }
            .label-style {
              width: 100% !important;
              font-size: 0.875rem;
            }
            .input-wrapper {
              width: 100% !important;
              min-width: 100% !important;
              flex-direction: column !important;
              align-items: flex-start !important;
              margin-bottom: 8px;
            }
            .action-buttons {
              flex-direction: column !important;
              gap: 8px !important;
              width: 100% !important;
            }
            .action-buttons button {
              width: 100% !important;
              font-size: 0.875rem !important;
            }
            .expense-table-header {
              display: none !important;
            }
            .expense-table-row {
              display: flex !important;
              flex-direction: column !important;
              gap: 8px !important;
              padding: 12px !important;
              border: 1px solid #444 !important;
              border-radius: 8px !important;
              margin-bottom: 12px !important;
            }
            .expense-table-row > div {
              width: 100% !important;
            }
            .expense-table-row input {
              width: 100% !important;
              font-size: 0.875rem !important;
            }
            .expense-actions {
              flex-direction: column !important;
              gap: 8px !important;
              width: 100% !important;
            }
            .expense-actions button {
              width: 100% !important;
              font-size: 0.875rem !important;
            }
            .total-summary {
              text-align: center !important;
              font-size: 0.875rem !important;
              margin: 8px 0 !important;
            }
          }
          `}
        </style>
      </div>
    </>
  );
};

export default EditBill;
