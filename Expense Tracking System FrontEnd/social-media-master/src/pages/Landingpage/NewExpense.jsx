import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createExpenseAction } from "../../Redux/Expenses/expense.action";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  CategoryAutocomplete,
  PaymentMethodAutocomplete,
  ExpenseNameAutocomplete,
  FilterPopover,
} from "../../components/ui";
import PreviousExpenseIndicator from "../../components/PreviousExpenseIndicator";
import PageHeader from "../../components/PageHeader";
import { normalizePaymentMethod } from "../../utils/paymentMethodUtils";
import { getListOfBudgetsById } from "../../Redux/Budget/budget.action";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import usePreviousExpense from "../../hooks/usePreviousExpense";
import { useBudgetTableConfig } from "../../hooks/useBudgetTableConfig";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useTranslation } from "../../hooks/useTranslation";
import HighlightedText from "../../components/common/HighlightedText";
import { createFuzzyFilterOptions } from "../../utils/fuzzyMatchUtils";
import GroupedDataTable from "../../components/common/GroupedDataTable/GroupedDataTable";

const NewExpense = ({ onClose, onSuccess }) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";

  const pageTitle = t("newExpense.title");
  const previouslyAddedLabel = t("newExpense.header.previouslyAdded");
  const autoFilledLabel = t("newExpense.indicators.autoFilled");
  const linkBudgetsLabel = t("newExpense.actions.linkBudgets");
  const submitLabel = t("newExpense.actions.submit");
  const tableNoRowsText = t("newExpense.table.noRows");
  const errorLoadingBudgets = t("newExpense.messages.errorLoadingBudgets");
  const successMessage = t("newExpense.actions.successMessage");
  const noOptionsText = t("newExpense.autocomplete.noOptions");
  const closeLabel = t("common.close");

  // Dynamic styles based on theme
  const fieldStyles = `px-3 py-2 rounded w-full text-base sm:max-w-[300px] max-w-[200px] border-0 focus:outline-none focus:ring-2`;
  const fieldHeight = "48px"; // Consistent height for all form fields
  const inputWrapper = {
    width: "150px",
    minWidth: "150px",
    display: "flex",
    alignItems: "center",
  };

  const fieldLabels = useMemo(
    () => ({
      expenseName: t("newExpense.fields.expenseName"),
      amount: t("newExpense.fields.amount"),
      date: t("newExpense.fields.date"),
      transactionType: t("newExpense.fields.transactionType"),
      category: t("newExpense.fields.category"),
      paymentMethod: t("newExpense.fields.paymentMethod"),
      comments: t("newExpense.fields.comments"),
    }),
    [t],
  );

  const fieldPlaceholders = useMemo(
    () => ({
      expenseName: t("newExpense.placeholders.expenseName"),
      amount: t("newExpense.placeholders.amount"),
      date: t("newExpense.placeholders.date"),
      transactionType: t("newExpense.placeholders.transactionType"),
      category: t("newExpense.placeholders.category"),
      paymentMethod: t("newExpense.placeholders.paymentMethod"),
      comments: t("newExpense.placeholders.comments"),
    }),
    [t],
  );

  const tableHeaders = useMemo(
    () => ({
      name: t("newExpense.table.headers.name"),
      inBudget: t("newExpense.table.headers.inBudget"),
      description: t("newExpense.table.headers.description"),
      startDate: t("newExpense.table.headers.startDate"),
      endDate: t("newExpense.table.headers.endDate"),
      remainingAmount: t("newExpense.table.headers.remainingAmount"),
      amount: t("newExpense.table.headers.amount"),
    }),
    [t],
  );

  const transactionTypeLabels = useMemo(
    () => ({
      gain: t("newExpense.transactionTypes.gain"),
      loss: t("newExpense.transactionTypes.loss"),
    }),
    [t],
  );

  // Use lowercase internal values for consistency (gain/loss)
  const typeOptions = ["gain", "loss"];

  const formatLabelFromId = (value) =>
    value
      ? value
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
      : "";

  const getFieldLabel = (fieldId) =>
    fieldLabels[fieldId] || formatLabelFromId(fieldId);

  const getPlaceholderForField = (fieldId, fallbackLabel) =>
    fieldPlaceholders[fieldId] ||
    t("newExpense.placeholders.generic", {
      field: fallbackLabel || formatLabelFromId(fieldId),
    });

  const getTransactionTypeLabel = (option) => {
    if (!option) return "";
    const key = option.toLowerCase();
    return (
      transactionTypeLabels[key] ||
      option.charAt(0).toUpperCase() + option.slice(1)
    );
  };

  const transactionTypeFilterOptions = useMemo(() => {
    return createFuzzyFilterOptions({
      getOptionLabel: getTransactionTypeLabel,
    });
  }, [transactionTypeLabels]);

  const location = useLocation();
  // Get date from query param if present
  const searchParams = new URLSearchParams(location.search);
  const dateFromQuery = searchParams.get("date");

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const { budgets, error: budgetError } = useSelector(
    (state) => state.budgets || {},
  );
  const dispatch = useDispatch();
  const [expenseData, setExpenseData] = useState({
    expenseName: "",
    amount: "",
    netAmount: "",
    paymentMethod: "cash",
    transactionType: "loss",
    comments: "",
    date: dateFromQuery || today,
    creditDue: "",
  });
  const [errors, setErrors] = useState({});
  const [autoFilledFields, setAutoFilledFields] = useState({
    category: false,
    paymentMethod: false,
    transactionType: false,
    comments: false,
  });
  const [lastAutoFilledExpenseName, setLastAutoFilledExpenseName] =
    useState("");
  const [userModifiedFields, setUserModifiedFields] = useState({
    category: false,
    paymentMethod: false,
    transactionType: false,
    comments: false,
  });
  // Suggestions now handled by generic NameAutocomplete component
  const [showTable, setShowTable] = useState(false);
  const [selectedBudgetIds, setSelectedBudgetIds] = useState({});
  const { friendId } = useParams();
  const { hasWriteAccess } = useFriendAccess(friendId);

  // Use custom hook for previous expense functionality
  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    expenseData.expenseName,
    expenseData.date,
    friendId,
  );

  // Auto-populate fields when previous expense is found
  useEffect(() => {
    // When expense name is cleared or too short, reset to default values
    if (!expenseData.expenseName || expenseData.expenseName.trim().length < 2) {
      if (lastAutoFilledExpenseName) {
        // Reset to default values
        setExpenseData((prev) => ({
          ...prev,
          category: "",
          paymentMethod: "cash",
          transactionType: "loss",
          comments: "",
        }));
        setLastAutoFilledExpenseName("");
        setAutoFilledFields({
          category: false,
          paymentMethod: false,
          transactionType: false,
          comments: false,
        });
        // Reset user modification flags
        setUserModifiedFields({
          category: false,
          paymentMethod: false,
          transactionType: false,
          comments: false,
        });
      }
      return;
    }

    if (previousExpense && expenseData.expenseName?.trim().length >= 2) {
      // Check if this is a new expense name (different from last auto-filled)
      const isNewExpenseName =
        expenseData.expenseName.trim() !== lastAutoFilledExpenseName;

      // Only auto-populate if fields are empty, default, or expense name changed
      const updates = {};
      const newAutoFilled = { ...autoFilledFields };

      // Auto-populate category if:
      // - Previous expense has categoryId AND
      // - (Current is empty OR expense name changed and user hasn't manually modified it)
      if (
        previousExpense.categoryId &&
        (!expenseData.category ||
          (isNewExpenseName && !userModifiedFields.category))
      ) {
        updates.category = previousExpense.categoryId;
        newAutoFilled.category = true;
      }

      // Auto-populate payment method if:
      // - Previous expense has paymentMethod AND
      // - (Current is default OR expense name changed and user hasn't manually modified it)
      if (
        previousExpense.expense?.paymentMethod &&
        (expenseData.paymentMethod === "cash" ||
          (isNewExpenseName && !userModifiedFields.paymentMethod))
      ) {
        updates.paymentMethod = previousExpense.expense.paymentMethod;
        newAutoFilled.paymentMethod = true;
      }

      // Auto-populate type if:
      // - Previous expense has type AND
      // - (Current is default OR expense name changed and user hasn't manually modified it)
      if (
        previousExpense.expense?.type &&
        (expenseData.transactionType === "loss" ||
          (isNewExpenseName && !userModifiedFields.transactionType))
      ) {
        updates.transactionType = previousExpense.expense.type;
        newAutoFilled.transactionType = true;
      }

      // Auto-populate comments if:
      // - Previous expense has comments AND
      // - (Current is empty OR expense name changed and user hasn't manually modified it)
      if (
        previousExpense.expense?.comments &&
        (!expenseData.comments ||
          (isNewExpenseName && !userModifiedFields.comments))
      ) {
        updates.comments = previousExpense.expense.comments;
        newAutoFilled.comments = true;
      } else if (
        !previousExpense.expense?.comments &&
        isNewExpenseName &&
        !userModifiedFields.comments
      ) {
        // Clear comments if no suggestion available for new expense name
        updates.comments = "";
        newAutoFilled.comments = false;
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        setExpenseData((prev) => ({ ...prev, ...updates }));
        setAutoFilledFields(newAutoFilled);
        setLastAutoFilledExpenseName(expenseData.expenseName.trim());

        // Reset user modification flags if expense name changed
        if (isNewExpenseName) {
          setUserModifiedFields({
            category: false,
            paymentMethod: false,
            transactionType: false,
            comments: false,
          });
        }

        // Clear auto-filled indicators after 3 seconds
        setTimeout(() => {
          setAutoFilledFields({
            category: false,
            paymentMethod: false,
            transactionType: false,
            comments: false,
          });
        }, 3000);
      }
    }
  }, [previousExpense, expenseData.expenseName]);

  // Updated redirect base paths to /friends/expenses*
  useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) => `/friends/expenses/${fid}`,
    selfPath: "/friends/expenses",
    defaultPath: "/friends/expenses",
  });

  console.log("FriendId ", friendId);

  // Fetch budgets on component mount
  useEffect(() => {
    dispatch(getListOfBudgetsById(today, friendId || ""));
  }, [dispatch, today, friendId]);

  // Update selection states when budgets change
  useEffect(() => {
    if (budgets && Array.isArray(budgets)) {
      const initialSelection = {};
      budgets.forEach((budget) => {
        if (budget.includeInBudget) {
          initialSelection[budget.id] = true;
        }
      });
      setSelectedBudgetIds(initialSelection);
    }
  }, [budgets]);

  // Set initial type based on salary date logic if dateFromQuery is present
  React.useEffect(() => {
    if (dateFromQuery) {
      const newDate = new Date(dateFromQuery);
      const lastDayOfMonth = new Date(
        newDate.getFullYear(),
        newDate.getMonth() + 1,
        0,
      );
      let salaryDate = new Date(lastDayOfMonth);
      if (salaryDate.getDay() === 6) {
        salaryDate.setDate(salaryDate.getDate() - 1);
      } else if (salaryDate.getDay() === 0) {
        salaryDate.setDate(salaryDate.getDate() - 2);
      }
      const isSalary = newDate.toDateString() === salaryDate.toDateString();
      if (isSalary) {
        setExpenseData((prev) => ({ ...prev, transactionType: "gain" }));
      } else {
        setExpenseData((prev) => ({ ...prev, transactionType: "loss" }));
      }
    }
  }, [dateFromQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData({ ...expenseData, [name]: value });

    // Clear the error for this field when the user updates it
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleDateChange = (newValue) => {
    if (newValue) {
      const formatted = dayjs(newValue).format("YYYY-MM-DD");
      setExpenseData((prev) => ({ ...prev, date: formatted }));
    }

    // Clear the date error when the user updates it
    if (errors.date) {
      setErrors({ ...errors, date: false });
    }

    // Dispatch getListOfBudgetsById with the selected date
    dispatch(getListOfBudgetsById(newValue, friendId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasWriteAccess) return; // safety: block submit if no write
    const newErrors = {};
    if (!expenseData.expenseName) newErrors.expenseName = true;
    if (!expenseData.amount) newErrors.amount = true;
    if (!expenseData.date) newErrors.date = true;
    if (!expenseData.transactionType) newErrors.transactionType = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Use normalized payment method string for backend
    const normalizedPm = normalizePaymentMethod(expenseData.paymentMethod);

    // Derive creditDue value based on payment method and amount
    const amt = parseFloat(expenseData.amount) || 0;
    const derivedCreditDue = normalizedPm === "creditNeedToPaid" ? amt : 0;

    const budgetIds = Object.keys(selectedBudgetIds)
      .filter((id) => selectedBudgetIds[id])
      // Ensure we're passing numbers if IDs are numbers, or strings if strings
      .map((id) => {
        // find original budget to get type of ID
        const budget = budgets.find((b) => String(b.id) === String(id));
        return budget ? budget.id : id;
      });

    dispatch(
      createExpenseAction(
        {
          date: expenseData.date,
          budgetIds: budgetIds,
          categoryId: expenseData.category,
          expense: {
            expenseName: expenseData.expenseName,
            amount: amt,
            netAmount: amt,
            paymentMethod: normalizedPm,
            type: expenseData.transactionType.toLowerCase(),
            comments: expenseData.comments,
            creditDue: derivedCreditDue,
          },
        },
        friendId || "",
      ),
    );

    if (typeof onClose === "function") {
      onClose();
    } else {
      navigate(-1, {
        state: { toastMessage: successMessage },
      });
    }
    if (onSuccess) {
      onSuccess(successMessage);
    }
  };

  const handleLinkBudgets = () => {
    setShowTable(true);
  };

  const handleCloseTable = () => {
    setShowTable(false);
  };

  const handleRowSelect = (row, checked) => {
    setSelectedBudgetIds((prev) => ({
      ...prev,
      [row.id]: checked,
    }));
  };

  const handleSelectAll = (displayedRows, checked) => {
    const newSelection = { ...selectedBudgetIds };
    displayedRows.forEach((row) => {
      newSelection[row.id] = checked;
    });
    setSelectedBudgetIds(newSelection);
  };

  const renderInput = (id, type = "text", isTextarea = false) => {
    const labelText = getFieldLabel(id);
    const placeholderText = getPlaceholderForField(id, labelText);

    return (
      <div className="flex flex-col flex-1">
        <div className="flex items-start relative">
          <label
            htmlFor={id}
            style={{
              ...inputWrapper,
              color: colors.primary_text,
              fontSize: "0.875rem",
              fontWeight: "600",
              paddingTop: isTextarea ? "8px" : "0px",
            }}
          >
            {labelText}
            {["expenseName", "amount", "date", "transactionType"].includes(
              id,
            ) && <span className="text-red-500"> *</span>}
          </label>
          <div
            className="relative flex-1"
            style={{ maxWidth: isTextarea ? "100%" : "300px" }}
          >
            {id === "comments" && autoFilledFields.comments && (
              <div
                className="absolute top-[-20px] left-[300px]"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary_accent} 0%, ${colors.tertiary_accent} 100%)`,
                  color: colors.button_text,
                  fontSize: "0.65rem",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  boxShadow: `0 2px 4px ${colors.primary_accent}4D`,
                  zIndex: 10,
                }}
              >
                {autoFilledLabel}
              </div>
            )}
            {isTextarea ? (
              <textarea
                id={id}
                name={id}
                value={expenseData[id]}
                onChange={(e) => {
                  handleInputChange(e);
                  // Mark comments as user-modified when manually edited
                  if (id === "comments") {
                    setUserModifiedFields((prev) => ({
                      ...prev,
                      comments: true,
                    }));
                    if (autoFilledFields.comments) {
                      setAutoFilledFields((prev) => ({
                        ...prev,
                        comments: false,
                      }));
                    }
                  }
                }}
                placeholder={placeholderText}
                rows="3"
                className={fieldStyles}
                style={{
                  height: "80px",
                  backgroundColor: colors.primary_bg,
                  color: colors.primary_text,
                  borderColor: errors[id] ? "#ff4d4f" : colors.border_color,
                  borderWidth: errors[id] ? "2px" : "1px",
                  width: "100%",
                }}
              />
            ) : (
              <input
                id={id}
                name={id}
                type={type}
                value={expenseData[id]}
                onChange={handleInputChange}
                placeholder={placeholderText}
                className={fieldStyles}
                style={{
                  backgroundColor: colors.primary_bg,
                  color: colors.primary_text,
                  borderColor: errors[id] ? "#ff4d4f" : colors.border_color,
                  borderWidth: errors[id] ? "2px" : "1px",
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSelect = (id, options) => {
    const labelText = getFieldLabel(id);
    return (
      <div className="flex flex-col flex-1">
        <div className="flex items-center">
          <label
            htmlFor={id}
            style={{
              ...inputWrapper,
              color: colors.primary_text,
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            {labelText}
          </label>
          <select
            id={id}
            name={id}
            value={expenseData[id]}
            onChange={handleInputChange}
            className={fieldStyles}
            style={{
              backgroundColor: colors.primary_bg,
              color: colors.primary_text,
              borderColor: colors.border_color,
              borderWidth: "1px",
              height: fieldHeight,
            }}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {errors[id] && (
          <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
            {errors[id]}
          </span>
        )}
      </div>
    );
  };

  const renderAmountInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="amount"
          style={{
            ...inputWrapper,
            color: colors.primary_text,
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {fieldLabels.amount}
          <span className="text-red-500"> *</span>
        </label>
        <TextField
          id="amount"
          name="amount"
          type="number"
          value={expenseData.amount || ""}
          onChange={(e) => {
            handleInputChange(e);

            // Clear the error when the user types
            if (errors.amount) {
              setErrors({ ...errors, amount: false });
            }
          }}
          placeholder={fieldPlaceholders.amount}
          variant="outlined"
          error={errors.amount}
          InputProps={{
            className: fieldStyles,
            style: {
              height: fieldHeight,
              backgroundColor: colors.primary_bg,
              color: colors.primary_text,
              borderColor: errors.amount ? "#ff4d4f" : colors.border_color,
              borderWidth: errors.amount ? "2px" : "1px",
            },
          }}
          sx={{
            width: "100%",
            maxWidth: "300px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: errors.amount ? "#ff4d4f" : colors.border_color,
                borderWidth: errors.amount ? "2px" : "1px",
                borderStyle: "solid",
              },
              "&:hover fieldset": {
                borderColor: errors.amount ? "#ff4d4f" : colors.border_color,
                borderWidth: errors.amount ? "2px" : "1px",
                borderStyle: "solid",
              },
              "&.Mui-focused fieldset": {
                borderColor: errors.amount ? "#ff4d4f" : colors.primary_accent,
                borderStyle: "solid",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: errors.amount ? "#ff4d4f" : colors.border_color,
                borderWidth: errors.amount ? "2px" : "1px",
                borderStyle: "solid",
              },
            },
            "& .MuiInputBase-input": {
              color: colors.primary_text,
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
          style={{
            ...inputWrapper,
            color: colors.primary_text,
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {fieldLabels.date}
          <span className="text-red-500"> *</span>
        </label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={expenseData.date ? dayjs(expenseData.date) : null}
            onChange={(newValue) => {
              if (newValue) {
                const formatted = dayjs(newValue).format("YYYY-MM-DD");
                setExpenseData((prev) => ({ ...prev, date: formatted }));
              }
            }}
            sx={{
              background: colors.primary_bg,
              borderRadius: 2,
              color: colors.primary_text,
              ".MuiInputBase-input": {
                color: colors.primary_text,
                height: 20,
                fontSize: 15,
              },
              ".MuiSvgIcon-root": { color: colors.primary_accent },
              width: 300,
              height: 48,
              minHeight: 48,
              maxHeight: 48,
            }}
            slotProps={{
              textField: {
                size: "medium",
                variant: "outlined",
                placeholder: fieldPlaceholders.date,
                sx: {
                  color: colors.primary_text,
                  height: 48,
                  minHeight: 48,
                  maxHeight: 48,
                  width: 300,
                  fontSize: 15,
                  "& .MuiInputBase-root": {
                    height: 48,
                    minHeight: 48,
                    maxHeight: 48,
                  },
                  "& input": {
                    height: 20,
                    fontSize: 15,
                    color: colors.primary_text,
                  },
                },
                inputProps: {
                  max: dayjs().format("YYYY-MM-DD"),
                },
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
            format={dateFormat}
          />
        </LocalizationProvider>
      </div>
      {errors.date && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors.date}
        </span>
      )}
    </div>
  );

  const renderExpenseNameWithSuggestions = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="expenseName"
          style={{
            ...inputWrapper,
            color: colors.primary_text,
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {fieldLabels.expenseName}
          <span className="text-red-500"> *</span>
        </label>
        <ExpenseNameAutocomplete
          value={expenseData.expenseName}
          onChange={(val) => {
            setExpenseData((prev) => ({ ...prev, expenseName: val }));
            if (errors.expenseName && val)
              setErrors((prev) => ({ ...prev, expenseName: false }));
          }}
          friendId={friendId}
          placeholder={fieldPlaceholders.expenseName}
          error={errors.expenseName}
          size="medium"
        />
      </div>
    </div>
  );

  const renderCategoryAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center relative">
        <label
          htmlFor="category"
          style={{
            ...inputWrapper,
            color: colors.primary_text,
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {fieldLabels.category}
        </label>
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          <CategoryAutocomplete
            value={expenseData.category}
            onChange={(categoryId) => {
              setExpenseData((prev) => ({
                ...prev,
                category: categoryId,
              }));
              // Mark as user-modified and clear auto-filled indicator
              setUserModifiedFields((prev) => ({ ...prev, category: true }));
              if (autoFilledFields.category) {
                setAutoFilledFields((prev) => ({ ...prev, category: false }));
              }
            }}
            friendId={friendId}
            placeholder={fieldPlaceholders.category}
            size="medium"
          />
          {autoFilledFields.category && (
            <div
              className="absolute top-0 right-[-8px] transform translate-x-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary_accent} 0%, ${colors.tertiary_accent} 100%)`,
                color: colors.button_text,
                fontSize: "0.65rem",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                boxShadow: `0 2px 4px ${colors.primary_accent}4D`,
              }}
            >
              {autoFilledLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPaymentMethodAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center relative">
        <label
          htmlFor="paymentMethod"
          style={{
            ...inputWrapper,
            color: colors.primary_text,
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {fieldLabels.paymentMethod}
        </label>
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          <PaymentMethodAutocomplete
            value={expenseData.paymentMethod}
            onChange={(paymentMethodValue) => {
              setExpenseData((prev) => ({
                ...prev,
                paymentMethod: paymentMethodValue,
              }));
              // Mark as user-modified and clear auto-filled indicator
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
            transactionType={expenseData.transactionType}
            friendId={friendId}
            placeholder={fieldPlaceholders.paymentMethod}
            size="medium"
          />
          {autoFilledFields.paymentMethod && (
            <div
              className="absolute top-0 right-[-8px] transform translate-x-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary_accent} 0%, ${colors.tertiary_accent} 100%)`,
                color: colors.button_text,
                fontSize: "0.65rem",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                boxShadow: `0 2px 4px ${colors.primary_accent}4D`,
              }}
            >
              {autoFilledLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  const renderTransactionTypeAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center relative">
        <label
          htmlFor="transactionType"
          style={{
            ...inputWrapper,
            color: colors.primary_text,
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {fieldLabels.transactionType}
          <span className="text-red-500"> *</span>
        </label>
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          <Autocomplete
            autoHighlight
            options={typeOptions}
            getOptionLabel={(option) => getTransactionTypeLabel(option)}
            filterOptions={transactionTypeFilterOptions}
            value={(expenseData.transactionType || "loss").toLowerCase()}
            onInputChange={(event, newValue) => {
              setExpenseData((prev) => ({
                ...prev,
                transactionType: (newValue || "").toLowerCase(),
              }));

              // Clear the error when the user types
              if (errors.transactionType) {
                setErrors({ ...errors, transactionType: false });
              }
              // Note: Don't clear auto-filled indicator here as this fires during auto-fill
            }}
            onChange={(event, newValue) => {
              setExpenseData((prev) => ({
                ...prev,
                transactionType: (newValue || "").toLowerCase(),
              }));

              // Clear the error when the user selects a value
              if (errors.transactionType) {
                setErrors({ ...errors, transactionType: false });
              }
              // Mark as user-modified when user manually selects from dropdown
              setUserModifiedFields((prev) => ({
                ...prev,
                transactionType: true,
              }));
              // Clear auto-filled indicator when user manually changes
              if (autoFilledFields.transactionType) {
                setAutoFilledFields((prev) => ({
                  ...prev,
                  transactionType: false,
                }));
              }
            }}
            noOptionsText={noOptionsText}
            sx={{
              width: "100%",
              maxWidth: "300px",
              "& .MuiAutocomplete-option": {
                fontSize: "0.92rem",
                paddingTop: "4px",
                paddingBottom: "4px",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: errors.transactionType
                    ? "#ff4d4f"
                    : "rgb(75, 85, 99)",
                  borderWidth: errors.transactionType ? "2px" : "1px",
                  borderStyle: "solid",
                },
                "&:hover fieldset": {
                  borderColor: errors.transactionType
                    ? "#ff4d4f"
                    : "rgb(75, 85, 99)",
                  borderWidth: errors.transactionType ? "2px" : "1px",
                  borderStyle: "solid",
                },
                "&.Mui-focused fieldset": {
                  borderColor: errors.transactionType
                    ? "#ff4d4f"
                    : colors.primary_accent,
                  borderWidth: errors.transactionType ? "2px" : "2px",
                  borderStyle: "solid",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: errors.transactionType
                    ? "#ff4d4f"
                    : "rgb(75, 85, 99)",
                  borderWidth: errors.transactionType ? "2px" : "1px",
                  borderStyle: "solid",
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={fieldPlaceholders.transactionType}
                variant="outlined"
                error={errors.transactionType}
                InputProps={{
                  ...params.InputProps,
                  className: fieldStyles,
                  style: {
                    backgroundColor: colors.primary_bg,
                    color: colors.primary_text,
                  },
                }}
              />
            )}
            renderOption={(props, option, { inputValue }) => (
              <li
                {...props}
                style={{
                  fontSize: "0.92rem",
                  paddingTop: 4,
                  paddingBottom: 12,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 300,
                }}
                title={getTransactionTypeLabel(option)}
              >
                <HighlightedText
                  text={getTransactionTypeLabel(option)}
                  query={inputValue}
                  title={getTransactionTypeLabel(option)}
                />
              </li>
            )}
          />
          {autoFilledFields.transactionType && (
            <div
              className="absolute top-0 right-[-8px] transform translate-x-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary_accent} 0%, ${colors.tertiary_accent} 100%)`,
                color: colors.button_text,
                fontSize: "0.65rem",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                boxShadow: `0 2px 4px ${colors.primary_accent}4D`,
              }}
            >
              {autoFilledLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Budget Table Configuration
  const {
    columns: budgetColumns,
    filteredRows,
    sort,
    setSort,
    search,
    setSearch,
    columnFilters,
    setColumnFilters,
  } = useBudgetTableConfig(budgets, t);

  // Filter Popover State
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);

  const handleFilterClick = (e, column) => {
    setFilterAnchorEl(e.currentTarget);
    setFilterColumn(column);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setFilterColumn(null);
  };

  const handleFilterApply = (filterData) => {
    if (filterColumn) {
      setColumnFilters((prev) => ({
        ...prev,
        [filterColumn.key]: filterData,
      }));
    }
  };

  const handleFilterClear = () => {
    if (filterColumn) {
      setColumnFilters((prev) => {
        const next = { ...prev };
        delete next[filterColumn.key];
        return next;
      });
    }
  };

  // (Manual redirect effect removed in favor of generic hook)

  return (
    <>
      {/* <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}
      <div
        className="flex flex-col relative new-expense-container"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          marginRight: "20px",
          border: `1px solid ${colors.border_color}`,
          padding: "20px",
        }}
      >
        <PageHeader
          title={pageTitle}
          onClose={() => {
            if (onClose) {
              onClose();
            } else {
              navigate(-1);
            }
          }}
          rightContent={
            expenseData.expenseName?.trim().length >= 2 &&
            expenseData.date && (
              <PreviousExpenseIndicator
                expense={previousExpense}
                isLoading={loadingPreviousExpense}
                position="right"
                variant="gradient"
                showTooltip={true}
                dateFormat={dateFormat}
                label={previouslyAddedLabel}
                labelPosition="top"
                icon="calendar"
                tooltipConfig={{
                  showAmount: true,
                  showPaymentMethod: true,
                  showType: true,
                }}
                colorScheme={{
                  primary: colors.primary_accent,
                  secondary: colors.tertiary_accent,
                  text: colors.primary_text,
                  subtext: colors.placeholder_text,
                }}
              />
            )
          }
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-1 gap-4 items-center">
            {renderExpenseNameWithSuggestions()}
            {renderAmountInput()}
            {renderDateInput()}
          </div>
          <div className="flex flex-1 gap-4 items-center">
            {renderTransactionTypeAutocomplete()}
            {renderCategoryAutocomplete()}
            {renderPaymentMethodAutocomplete()}
          </div>
          <div className="flex flex-1 items-center">
            {renderInput("comments", "text", true)}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            onClick={handleLinkBudgets}
            className="px-6 py-2 font-semibold rounded w-full sm:w-auto"
            style={{
              backgroundColor: colors.button_bg,
              color: colors.button_text,
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = colors.button_hover)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = colors.button_bg)
            }
          >
            {linkBudgetsLabel}
          </button>
          {showTable && (
            <button
              onClick={handleCloseTable}
              aria-label={closeLabel}
              className="px-2 py-1 rounded mt-2 sm:mt-0 hidden sm:block"
              style={{
                backgroundColor: colors.active_bg,
                color: colors.primary_text,
                border: `1px solid ${colors.border_color}`,
              }}
            >
              X
            </button>
          )}
        </div>
        {showTable && (
          <div
            className="mt-4 sm:mt-6 w-full relative"
            style={{
              "--pm-text-primary": colors.primary_text,
              "--pm-text-secondary": colors.secondary_text,
              "--pm-text-tertiary": colors.secondary_text,
              "--pm-bg-primary": colors.active_bg,
              "--pm-bg-secondary": colors.secondary_bg,
              "--pm-border-color": colors.border_color,
              "--pm-accent-color": colors.primary_accent,
              "--pm-hover-bg": colors.hover_bg,
              "--pm-scrollbar-thumb": colors.primary_accent,
              "--pm-scrollbar-track": colors.secondary_bg,
            }}
          >
            {/* Mobile Close Button (Search removed) */}
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-4 gap-2 sm:hidden">
              <div className="block sm:hidden self-end">
                <button
                  onClick={handleCloseTable}
                  aria-label={closeLabel}
                  className="px-2 py-1 rounded"
                  style={{
                    backgroundColor: colors.active_bg,
                    color: colors.primary_text,
                    border: `1px solid ${colors.border_color}`,
                  }}
                >
                  X
                </button>
              </div>
            </div>

            <GroupedDataTable
              rows={filteredRows}
              columns={budgetColumns}
              sort={sort}
              onSortChange={setSort}
              columnFilters={columnFilters}
              onFilterClick={handleFilterClick}
              enableSelection={true}
              selectedRows={selectedBudgetIds}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
              resolveRowKey={(row) => row.id}
              className="w-full"
              defaultPageSize={5}
            />
          </div>
        )}

        {budgetError && (
          <div className="text-red-500 text-sm mt-4">
            {errorLoadingBudgets}:{" "}
            {typeof budgetError === "string"
              ? budgetError
              : typeof budgetError === "object"
                ? budgetError.message ||
                  budgetError.error ||
                  JSON.stringify(budgetError).substring(0, 100)
                : tableNoRowsText}
          </div>
        )}

        <div className="w-full flex justify-end mt-4 sm:mt-8">
          {hasWriteAccess && (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 font-semibold rounded w-full sm:w-auto"
              style={{
                backgroundColor: colors.button_bg,
                color: colors.button_text,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = colors.button_hover)
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = colors.button_bg)
              }
            >
              {submitLabel}
            </button>
          )}
        </div>

        <FilterPopover
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl}
          column={filterColumn}
          type={filterColumn?.filterType || "text"}
          initialOperator={
            filterColumn && columnFilters[filterColumn.key]
              ? columnFilters[filterColumn.key].operator
              : undefined
          }
          initialValue={
            filterColumn && columnFilters[filterColumn.key]
              ? columnFilters[filterColumn.key].value
              : undefined
          }
          onClose={handleFilterClose}
          onApply={handleFilterApply}
          onClear={handleFilterClear}
        />

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
            width: 8px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #1b1b1b;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #00dac6;
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #00b8a0;
          }
          .overflow-x-auto::-webkit-scrollbar {
            height: 8px;
          }
          .overflow-x-auto::-webkit-scrollbar-track {
            background: #1b1b1b;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #00dac6;
            border-radius: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: #00b8a0;
          }
            @media (max-width: 640px) {
         .new-expense-container {
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
      }
      .error-message {
        margin-left: 0 !important;
        text-align: left;
      }
      .budget-card {
        padding: 12px;
        font-size: 0.875rem;
      }
      .table-container {
        display: none !important;
      }
      .mobile-card-container {
        display: block !important;
      }
      .submit-button {
        bottom: 16px !important;
        right: 16px !important;
        width: 100% !important;
        max-width: 120px;
      }
      .link-budget-button,
      .close-table-button {
        width: 100% !important;
        padding: 8px 16px;
        font-size: 0.875rem;
      }
      .autocomplete-container {
        max-width: 100% !important;
      }
      .textarea-field {
        rows: 2 !important;
        font-size: 0.875rem;
      }
      .overflow-y-auto::-webkit-scrollbar {
        width: 6px;
      }      .overflow-x-auto::-webkit-scrollbar {
        height: 6px;

    }
    /* Existing scrollbar styles */
    .overflow-y-auto::-webkit-scrollbar {
      width: 8px;
    }
        `}
        </style>
      </div>
    </>
  );
};

export default NewExpense;
