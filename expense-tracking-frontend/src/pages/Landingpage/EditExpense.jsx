import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import { useTheme } from "../../hooks/useTheme";
import PageHeader from "../../components/PageHeader";
import ToastNotification from "./ToastNotification";
import {
  editExpenseAction,
  getExpenseAction,
} from "../../Redux/Expenses/expense.action";
import {
  getListOfBudgetsByExpenseId,
  getListOfBudgetsById,
} from "../../Redux/Budget/budget.action";
import { Box, InputAdornment, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from "@mui/material/Autocomplete";
import {
  CategoryAutocomplete,
  PaymentMethodAutocomplete,
  ExpenseNameAutocomplete,
} from "../../components/ui";
import { normalizePaymentMethod } from "../../utils/paymentMethodUtils";
import TextField from "@mui/material/TextField";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import useUserSettings from "../../hooks/useUserSettings";
import { useTranslation } from "../../hooks/useTranslation";
import HighlightedText from "../../components/common/HighlightedText";
import { createFuzzyFilterOptions } from "../../utils/fuzzyMatchUtils";
import BudgetSelectionTable from "../../components/common/BudgetSelectionTable/BudgetSelectionTable";

const EditExpense = ({}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const { t } = useTranslation();
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const { id, friendId } = useParams();
  const { hasWriteAccess } = useFriendAccess(friendId);

  const pageTitle = t("editExpense.title");
  const linkBudgetsLabel = t("editExpense.actions.linkBudgets");
  const submitLabel = t("editExpense.actions.submit");
  const successMessage = t("editExpense.actions.successMessage");
  const updateErrorMessage = t("editExpense.messages.updateError");
  const errorLoadingBudgets = t("editExpense.messages.errorLoadingBudgets");
  const noOptionsText = t("editExpense.autocomplete.noOptions");
  const tableNoRowsText = t("editExpense.table.noRows");
  const closeLabel = t("common.close");

  const fieldLabels = useMemo(
    () => ({
      expenseName: t("editExpense.fields.expenseName"),
      amount: t("editExpense.fields.amount"),
      date: t("editExpense.fields.date"),
      transactionType: t("editExpense.fields.transactionType"),
      category: t("editExpense.fields.category"),
      paymentMethod: t("editExpense.fields.paymentMethod"),
      comments: t("editExpense.fields.comments"),
    }),
    [t],
  );

  const fieldPlaceholders = useMemo(
    () => ({
      expenseName: t("editExpense.placeholders.expenseName"),
      amount: t("editExpense.placeholders.amount"),
      date: t("editExpense.placeholders.date"),
      transactionType: t("editExpense.placeholders.transactionType"),
      category: t("editExpense.placeholders.category"),
      paymentMethod: t("editExpense.placeholders.paymentMethod"),
      comments: t("editExpense.placeholders.comments"),
      generic: t("editExpense.placeholders.generic"),
    }),
    [t],
  );

  const validationMessages = useMemo(
    () => ({
      expenseName: t("editExpense.validation.expenseName"),
      amount: t("editExpense.validation.amount"),
      date: t("editExpense.validation.date"),
      transactionType: t("editExpense.validation.transactionType"),
    }),
    [t],
  );

  const tableHeaders = useMemo(
    () => ({
      name: t("editExpense.table.headers.name"),
      inBudget: t("editExpense.table.headers.inBudget"),
      description: t("editExpense.table.headers.description"),
      startDate: t("editExpense.table.headers.startDate"),
      endDate: t("editExpense.table.headers.endDate"),
      remainingAmount: t("editExpense.table.headers.remainingAmount"),
      amount: t("editExpense.table.headers.amount"),
    }),
    [t],
  );

  const transactionTypeLabels = useMemo(
    () => ({
      gain: t("editExpense.transactionTypes.gain"),
      loss: t("editExpense.transactionTypes.loss"),
    }),
    [t],
  );

  const typeOptions = ["gain", "loss"];

  const formatLabelFromId = (value) =>
    value
      ? value
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
      : "";

  const getFieldLabel = (fieldId) =>
    fieldLabels[fieldId] || formatLabelFromId(fieldId);

  const getPlaceholder = (fieldId, fallbackLabel) => {
    const resolvedLabel = fallbackLabel || formatLabelFromId(fieldId);
    if (fieldPlaceholders[fieldId]) {
      return fieldPlaceholders[fieldId];
    }
    if (fieldPlaceholders.generic) {
      return fieldPlaceholders.generic.replace("{{field}}", resolvedLabel);
    }
    return resolvedLabel;
  };

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

  // Dynamic styles based on theme
  const fieldStyles = `px-3 py-2 rounded text-base sm:max-w-[300px] max-w-[200px] border-0`;
  const labelStyle = `text-sm sm:text-base font-semibold mr-4`;
  const formRow = "mt-4 flex flex-col sm:flex-row sm:items-center gap-2 w-full";
  const firstFormRow =
    "mt-2 flex flex-col sm:flex-row sm:items-center gap-2 w-full";
  const inputWrapper = { width: "150px" };

  // Updated redirect base paths to /friends/expenses*
  useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) => `/friends/expenses/${fid}`,
    selfPath: "/friends/expenses",
    defaultPath: "/friends/expenses",
  });
  const { expense } = useSelector((state) => state.expenses || {});
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
    date: today,
    category: "",
    categoryName: "",
  });
  const [errors, setErrors] = useState({});
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");
  const [showTable, setShowTable] = useState(false);
  const [selectedBudgetIds, setSelectedBudgetIds] = useState([]);
  // Suggestions handled by NameAutocomplete component / hook

  // Get topExpenses from Redux, just like NewExpense
  // topExpenses now fetched internally by NameAutocomplete's hook; keep minimal expense slice access if needed elsewhere

  // Fetch budgets and expense data on component mount
  useEffect(() => {
    const fetchDate = expense?.date || today;
    console.log(
      "Initial fetch budgets with expenseId:",
      id,
      "date:",
      fetchDate,
    );
    dispatch(
      getListOfBudgetsByExpenseId({
        id,
        date: fetchDate,
        targetId: friendId || "",
      }),
    );
    dispatch(getExpenseAction(id || "", friendId || ""));
  }, [dispatch]);

  // Update selection states when budgets change
  useEffect(() => {
    console.log("Budgets updated:", budgets);
    if (budgets && Array.isArray(budgets)) {
      const initialSelection = budgets
        .filter((budget) => budget.includeInBudget)
        .map((budget) => budget.id);
      setSelectedBudgetIds(initialSelection);
    }
  }, [budgets]);

  // Update form data when expense is fetched
  useEffect(() => {
    if (expense) {
      console.log("Expense data received:", expense);
      setExpenseData({
        expenseName: expense.expense.expenseName || "",
        amount: expense.expense.amount || "",
        netAmount: expense.expense.netAmount || "",
        paymentMethod: normalizePaymentMethod(
          expense.expense.paymentMethod || "cash",
        ),
        transactionType: expense.expense.type || "loss",
        comments: expense.expense.comments || "",
        date: expense.date || today,
        category: expense.categoryId || "",
        categoryName: expense.categoryName || "",
      });
    }
  }, [expense, today]);

  // Removed local fetchSuggestions; NameAutocomplete handles filtering.

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData({ ...expenseData, [name]: value });
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    const newDate = new Date(value);

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

    setExpenseData((prevState) => ({
      ...prevState,
      date: value,
      transactionType: isSalary ? "gain" : "loss",
    }));

    console.log("Fetching budgets for expenseId:", id, "date:", value);
    dispatch(
      getListOfBudgetsByExpenseId({
        id,
        date: value,
        targetId: friendId || "",
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!expenseData.expenseName)
      newErrors.expenseName = validationMessages.expenseName;
    if (!expenseData.amount) newErrors.amount = validationMessages.amount;
    if (!expenseData.date) newErrors.date = validationMessages.date;
    if (!expenseData.transactionType)
      newErrors.transactionType = validationMessages.transactionType;
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const budgetIds = selectedBudgetIds;

    try {
      // Normalize payment method and compute creditDue per rules
      const normalizedPm = normalizePaymentMethod(expenseData.paymentMethod);
      const amt = parseFloat(expenseData.amount) || 0;
      const derivedCreditDue = normalizedPm === "creditNeedToPaid" ? amt : 0;

      if (!hasWriteAccess) return; // safety
      await dispatch(
        editExpenseAction(
          id,
          {
            date: expenseData.date,
            budgetIds: budgetIds,
            categoryId: expenseData.category || "",
            expense: {
              expenseName: expenseData.expenseName,
              amount: expenseData.amount,
              netAmount: expenseData.amount,
              paymentMethod: normalizedPm,
              type: (expenseData.transactionType || "").toLowerCase(),
              comments: expenseData.comments,
              creditDue: derivedCreditDue,
            },
          },
          friendId || "",
        ),
      );
      setToastMessage(successMessage);
      setToastSeverity("success");
      setOpenToast(true);
      navigate(-1, {
        state: { successMessage },
      });
    } catch (err) {
      console.error("Error updating expense:", err);
      setToastMessage(updateErrorMessage);
      setToastSeverity("error");
      setOpenToast(true);
    }
  };

  const handleLinkBudgets = () => {
    setShowTable(true);
  };

  const handleCloseTable = () => {
    setShowTable(false);
  };

  // Render input fields with consistent style and required asterisk
  const renderInput = (id, type = "text", isTextarea = false) => {
    const labelText = getFieldLabel(id);
    const placeholderText = getPlaceholder(id, labelText);

    return (
      <div className="flex flex-col flex-1">
        <div className="flex items-center">
          <label
            htmlFor={id}
            style={{ color: colors.primary_text, ...inputWrapper }}
            className={labelStyle}
          >
            {labelText}
            {["expenseName", "amount", "date", "transactionType"].includes(
              id,
            ) && <span className="text-red-500"> *</span>}
          </label>
          {isTextarea ? (
            <textarea
              id={id}
              name={id}
              value={expenseData[id]}
              onChange={handleInputChange}
              placeholder={placeholderText}
              rows="3"
              className={fieldStyles}
              style={{
                height: "80px",
                backgroundColor: colors.primary_bg,
                color: colors.primary_text,
                borderColor: errors[id] ? "#ff4d4f" : colors.border_color,
                borderWidth: errors[id] ? "2px" : "1px",
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
        {errors[id] && (
          <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
            {errors[id]}
          </span>
        )}
      </div>
    );
  };

  const renderSelect = (id, options) => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor={id}
          style={{ color: colors.primary_text, ...inputWrapper }}
          className={labelStyle}
        >
          {getFieldLabel(id)}
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

  const renderCustomDateInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="date"
          style={{ color: colors.primary_text, ...inputWrapper }}
          className={labelStyle}
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
                handleDateChange({ target: { value: formatted } });
              }
            }}
            sx={{
              background: colors.primary_bg,
              borderRadius: 2,
              color: colors.primary_text,
              ".MuiInputBase-input": {
                color: colors.primary_text,
                height: 32,
                fontSize: 18,
              },
              ".MuiSvgIcon-root": { color: colors.primary_accent },
              width: 300,
              height: 56,
              minHeight: 56,
              maxHeight: 56,
            }}
            slotProps={{
              textField: {
                size: "medium",
                variant: "outlined",
                placeholder: fieldPlaceholders.date,
                sx: {
                  color: colors.primary_text,
                  height: 56,
                  minHeight: 56,
                  maxHeight: 56,
                  width: 300,
                  fontSize: 18,
                  "& .MuiInputBase-root": {
                    height: 56,
                    minHeight: 56,
                    maxHeight: 56,
                  },
                  "& input": {
                    height: 32,
                    fontSize: 18,
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

  const renderCategoryAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="category"
          style={{ color: colors.primary_text, ...inputWrapper }}
          className={labelStyle}
        >
          {fieldLabels.category}
        </label>
        <CategoryAutocomplete
          value={expenseData.category}
          onChange={(categoryId) => {
            setExpenseData((prev) => ({
              ...prev,
              category: categoryId,
            }));
          }}
          friendId={friendId}
          placeholder={fieldPlaceholders.category}
          size="medium"
          error={!!errors.category}
        />
      </div>
      {errors.category && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors.category}
        </span>
      )}
    </div>
  );

  const renderPaymentMethodAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="paymentMethod"
          style={{ color: colors.primary_text, ...inputWrapper }}
          className={labelStyle}
        >
          {fieldLabels.paymentMethod}
        </label>
        <PaymentMethodAutocomplete
          value={expenseData.paymentMethod}
          onChange={(paymentMethodValue) => {
            setExpenseData((prev) => ({
              ...prev,
              paymentMethod: paymentMethodValue,
            }));
          }}
          transactionType={expenseData.transactionType}
          friendId={friendId}
          placeholder={fieldPlaceholders.paymentMethod}
          size="medium"
        />
      </div>
    </div>
  );

  const handleOnClose = () => {
    navigate(-1);
  };

  // Render input fields with consistent style and required asterisk
  const renderExpenseNameWithSuggestions = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="expenseName"
          style={{ color: colors.primary_text, ...inputWrapper }}
          className={labelStyle}
        >
          {fieldLabels.expenseName}
          <span className="text-red-500"> *</span>
        </label>
        <ExpenseNameAutocomplete
          value={expenseData.expenseName}
          onChange={(val) =>
            setExpenseData((prev) => ({ ...prev, expenseName: val }))
          }
          friendId={friendId}
          placeholder={fieldPlaceholders.expenseName}
          error={!!errors.expenseName}
          size="medium"
        />
      </div>
      {errors.expenseName && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors.expenseName}
        </span>
      )}
    </div>
  );

  // (Manual redirect effect removed; handled by generic hook)

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
        <PageHeader title={pageTitle} onClose={handleOnClose} />

        <div className={firstFormRow}>
          {/* Expense Name (MUI Autocomplete with suggestions) */}
          {renderExpenseNameWithSuggestions()}
          {/* Amount (MUI TextField) */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center">
              <label
                htmlFor="amount"
                style={{ color: colors.primary_text, ...inputWrapper }}
                className={labelStyle}
              >
                Amount<span className="text-red-500"> *</span>
              </label>
              <TextField
                id="amount"
                name="amount"
                type="number"
                value={expenseData.amount || ""}
                onChange={(e) =>
                  setExpenseData((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                placeholder={fieldPlaceholders.amount}
                variant="outlined"
                error={!!errors.amount}
                InputProps={{
                  className: fieldStyles,
                  style: {
                    height: "52px",
                    backgroundColor: colors.primary_bg,
                    color: colors.primary_text,
                    borderColor: errors.amount
                      ? "#ff4d4f"
                      : colors.border_color,
                    borderWidth: errors.amount ? "2px" : "1px",
                  },
                }}
                sx={{
                  width: "100%",
                  maxWidth: "300px",
                  "& .MuiInputBase-input": {
                    color: colors.primary_text,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: errors.amount
                        ? "#ff4d4f"
                        : colors.border_color,
                      borderWidth: errors.amount ? "2px" : "1px",
                      borderStyle: "solid",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.amount
                        ? "#ff4d4f"
                        : colors.border_color,
                      borderWidth: errors.amount ? "2px" : "1px",
                      borderStyle: "solid",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.amount
                        ? "#ff4d4f"
                        : colors.primary_accent,
                      borderWidth: errors.amount ? "2px" : "2px",
                      borderStyle: "solid",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: errors.amount
                        ? "#ff4d4f"
                        : colors.border_color,
                      borderWidth: errors.amount ? "2px" : "1px",
                      borderStyle: "solid",
                    },
                  },
                }}
              />
            </div>
            {errors.amount && (
              <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
                {errors.amount}
              </span>
            )}
          </div>
          {/* Date (MUI DatePicker) */}
          {renderCustomDateInput()}
        </div>
        <div className={formRow}>
          {/* Transaction Type (MUI Autocomplete) */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center">
              <label
                htmlFor="transactionType"
                style={{ color: colors.primary_text, ...inputWrapper }}
                className={labelStyle}
              >
                {fieldLabels.transactionType}
                <span className="text-red-500"> *</span>
              </label>
              <Autocomplete
                autoHighlight
                options={typeOptions}
                getOptionLabel={(option) => getTransactionTypeLabel(option)}
                filterOptions={transactionTypeFilterOptions}
                value={(expenseData.transactionType || "").toLowerCase()}
                onInputChange={(event, newValue) => {
                  setExpenseData((prev) => ({
                    ...prev,
                    transactionType: (newValue || "").toLowerCase(),
                  }));
                }}
                onChange={(event, newValue) => {
                  setExpenseData((prev) => ({
                    ...prev,
                    transactionType: (newValue || "").toLowerCase(),
                  }));
                }}
                noOptionsText={noOptionsText}
                sx={{
                  width: "100%",
                  maxWidth: "300px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: errors.transactionType
                        ? "#ff4d4f"
                        : colors.border_color,
                      borderWidth: errors.transactionType ? "2px" : "1px",
                      borderStyle: "solid",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.transactionType
                        ? "#ff4d4f"
                        : colors.border_color,
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
                        : colors.border_color,
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
                    error={!!errors.transactionType}
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
            </div>
            {errors.transactionType && (
              <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
                {errors.transactionType}
              </span>
            )}
          </div>
          {/* Category (MUI Autocomplete) */}
          {renderCategoryAutocomplete()}
          {/* Payment Method (MUI Autocomplete) */}
          {renderPaymentMethodAutocomplete()}
        </div>
        <div className={formRow}>
          {/* Comments (MUI TextField multiline) */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center">
              <label
                htmlFor="comments"
                style={{ color: colors.primary_text, ...inputWrapper }}
                className={labelStyle}
              >
                {fieldLabels.comments}
              </label>
              <TextField
                id="comments"
                name="comments"
                value={expenseData.comments || ""}
                onChange={(e) =>
                  setExpenseData((prev) => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
                placeholder={fieldPlaceholders.comments}
                variant="outlined"
                multiline
                minRows={3}
                maxRows={5}
                InputProps={{
                  className: fieldStyles,
                  style: {
                    height: "auto",
                    backgroundColor: colors.primary_bg,
                    color: colors.primary_text,
                  },
                }}
                sx={{
                  width: "100%",
                  maxWidth: "920px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: colors.border_color,
                      borderWidth: "1px",
                      borderStyle: "solid",
                    },
                    "&:hover fieldset": {
                      borderColor: colors.border_color,
                      borderWidth: "1px",
                      borderStyle: "solid",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary_accent,
                      borderWidth: "2px",
                      borderStyle: "solid",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 w-full flex flex-col sm:flex-row items-center justify-between gap-2">
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
              className="px-2 py-1 border rounded hover:bg-[#3a3a3a] mt-2 sm:mt-0 hidden sm:block"
              style={{
                backgroundColor: colors.active_bg,
                borderColor: colors.border_color,
                color: colors.primary_text,
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
                  className="px-2 py-1 border rounded hover:bg-[#3a3a3a]"
                  style={{
                    backgroundColor: colors.active_bg,
                    borderColor: colors.border_color,
                    color: colors.primary_text,
                  }}
                >
                  X
                </button>
              </div>
            </div>

            <BudgetSelectionTable
              budgets={budgets}
              selectedBudgetIds={selectedBudgetIds}
              onSelectionChange={setSelectedBudgetIds}
            />
          </div>
        )}

        {budgetError && (
          <div className="text-red-500 text-sm mt-4">
            {errorLoadingBudgets}: {budgetError.message || tableNoRowsText}
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

        <style>
          {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: url('https://cdn-icons-png.flaticon.com/128/8350/8350450.png') no-repeat;
            background-size: 18px;
            filter: invert(1) brightness(100) contrast(100);
          }
          input[type="date"], input[type="number"] {
            color: white;
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
      }
      .overflow-x-auto::-webkit-scrollbar {
        height: 6px;
      }
    }
        `}
        </style>
        <ToastNotification
          open={openToast}
          message={toastMessage}
          severity={toastSeverity}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={() => setOpenToast(false)}
        />
      </div>
    </>
  );
};

export default EditExpense;
