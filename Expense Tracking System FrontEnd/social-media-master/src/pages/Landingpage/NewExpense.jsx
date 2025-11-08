import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createExpenseAction } from "../../Redux/Expenses/expense.action";
import { Autocomplete, TextField, CircularProgress, Box } from "@mui/material";
import ExpenseNameAutocomplete from "../../components/ExpenseNameAutocomplete";
import PreviousExpenseIndicator from "../../components/PreviousExpenseIndicator";
import CategoryAutocomplete from "../../components/CategoryAutocomplete";
import PaymentMethodAutocomplete from "../../components/PaymentMethodAutocomplete";
import { normalizePaymentMethod } from "../../utils/paymentMethodUtils";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { getListOfBudgetsById } from "../../Redux/Budget/budget.action";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import usePreviousExpense from "../../hooks/usePreviousExpense";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";

const NewExpense = ({ onClose, onSuccess }) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";

  // Dynamic styles based on theme
  const fieldStyles = `px-3 py-2 rounded w-full text-base sm:max-w-[300px] max-w-[200px] border-0 focus:outline-none focus:ring-2 focus:ring-[#00dac6]`;
  const inputWrapper = {
    width: "150px",
    minWidth: "150px",
    display: "flex",
    alignItems: "center",
  };

  const location = useLocation();
  // Get date from query param if present
  const searchParams = new URLSearchParams(location.search);
  const dateFromQuery = searchParams.get("date");

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const { budgets, error: budgetError } = useSelector(
    (state) => state.budgets || {}
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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [checkboxStates, setCheckboxStates] = useState([]);
  const { friendId } = useParams();
  const { hasWriteAccess } = useFriendAccess(friendId);

  // Use custom hook for previous expense functionality
  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    expenseData.expenseName,
    expenseData.date,
    friendId
  );

  // Auto-populate fields when previous expense is found
  useEffect(() => {
    // When expense name is cleared or too short, reset auto-filled indicators and last name
    if (!expenseData.expenseName || expenseData.expenseName.trim().length < 2) {
      if (lastAutoFilledExpenseName) {
        setLastAutoFilledExpenseName("");
        setAutoFilledFields({
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

  // Update checkbox states when budgets change
  useEffect(() => {
    setCheckboxStates(budgets.map((budget) => budget.includeInBudget || false));
  }, [budgets]);

  // Set initial type based on salary date logic if dateFromQuery is present
  React.useEffect(() => {
    if (dateFromQuery) {
      const newDate = new Date(dateFromQuery);
      const lastDayOfMonth = new Date(
        newDate.getFullYear(),
        newDate.getMonth() + 1,
        0
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

    const budgetIds = budgets
      .filter((budget, index) => checkboxStates[index])
      .map((budget) => budget.id);

    dispatch(
      createExpenseAction(
        {
          date: expenseData.date,
          budgetIds: budgetIds,
          categoryId: expenseData.category,
          expense: {
            expenseName: expenseData.expenseName,
            amount: expenseData.amount,
            netAmount: expenseData.amount,
            paymentMethod: normalizedPm,
            type: expenseData.transactionType.toLowerCase(),
            comments: expenseData.comments,
            creditDue: derivedCreditDue,
          },
        },
        friendId || ""
      )
    );

    if (typeof onClose === "function") {
      onClose();
    } else {
      navigate(-1, {
        state: { toastMessage: "Expense created successfully!" },
      });
    }
    if (onSuccess) {
      onSuccess("Expense created successfully!");
    }
  };

  const handleLinkBudgets = () => {
    setShowTable(true);
  };

  const handleCloseTable = () => {
    setShowTable(false);
  };

  const handleCheckboxChange = (index) => {
    setCheckboxStates((prev) =>
      prev.map((state, i) => (i === index ? !state : state))
    );
  };
  const renderInput = (id, type = "text", isTextarea = false) => (
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
          {id
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
          {["expenseName", "amount", "date", "transactionType"].includes(
            id
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
              Auto-filled
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
              placeholder={`Enter ${id}`}
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
              placeholder={`Enter ${id}`}
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

  const renderSelect = (id, options) => (
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
          {id
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
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
          Amount<span className="text-red-500"> *</span>
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
          placeholder="Enter amount"
          variant="outlined"
          error={errors.amount}
          InputProps={{
            className: fieldStyles,
            style: {
              height: "52px",
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
                borderColor: errors.amount ? "#ff4d4f" : "#00dac6",
                borderWidth: errors.amount ? "2px" : "2px",
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
          Date<span className="text-red-500"> *</span>
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
                height: 32,
                fontSize: 18,
              },
              ".MuiSvgIcon-root": { color: "#00dac6" },
              width: 300,
              height: 56,
              minHeight: 56,
              maxHeight: 56,
            }}
            slotProps={{
              textField: {
                size: "medium",
                variant: "outlined",
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
                    color: colors.primary_text,
                  },
                },
                inputProps: {
                  max: dayjs().format("YYYY-MM-DD"),
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
          Expense Name<span className="text-red-500"> *</span>
        </label>
        <ExpenseNameAutocomplete
          value={expenseData.expenseName}
          onChange={(val) => {
            setExpenseData((prev) => ({ ...prev, expenseName: val }));
            if (errors.expenseName && val)
              setErrors((prev) => ({ ...prev, expenseName: false }));
          }}
          friendId={friendId}
          placeholder="Enter expense name"
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
          Category
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
            placeholder="Search category"
            size="medium"
          />
          {autoFilledFields.category && (
            <div
              className="absolute top-0 right-[-8px] transform translate-x-full"
              style={{
                background: "linear-gradient(135deg, #00dac6 0%, #00b8a0 100%)",
                color: "#fff",
                fontSize: "0.65rem",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 4px rgba(0,218,198,0.3)",
              }}
            >
              Auto-filled
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
          Payment Method
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
            placeholder="Select payment method"
            size="medium"
          />
          {autoFilledFields.paymentMethod && (
            <div
              className="absolute top-0 right-[-8px] transform translate-x-full"
              style={{
                background: "linear-gradient(135deg, #00dac6 0%, #00b8a0 100%)",
                color: "#fff",
                fontSize: "0.65rem",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 4px rgba(0,218,198,0.3)",
              }}
            >
              Auto-filled
            </div>
          )}
        </div>
      </div>
    </div>
  );
  // Use lowercase internal values for consistency (gain/loss)
  const typeOptions = ["gain", "loss"];

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
          Transaction Type<span className="text-red-500"> *</span>
        </label>
        <div className="relative flex-1" style={{ maxWidth: "300px" }}>
          <Autocomplete
            autoHighlight
            options={typeOptions}
            getOptionLabel={(option) =>
              option.charAt(0).toUpperCase() + option.slice(1)
            }
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
            noOptionsText="No options found"
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
                  borderColor: errors.transactionType ? "#ff4d4f" : "#00dac6",
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
                placeholder="Select transaction type"
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
                title={option}
              >
                {highlightText(option, inputValue)}
              </li>
            )}
          />
          {autoFilledFields.transactionType && (
            <div
              className="absolute top-0 right-[-8px] transform translate-x-full"
              style={{
                background: "linear-gradient(135deg, #00dac6 0%, #00b8a0 100%)",
                color: "#fff",
                fontSize: "0.65rem",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 4px rgba(0,218,198,0.3)",
              }}
            >
              Auto-filled
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        size: 150,
      },
      {
        header: "In Budget",
        accessorKey: "includeInBudget",
        size: 80,
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={checkboxStates[row.index]}
            onChange={() => handleCheckboxChange(row.index)}
            className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
          />
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
        size: 200,
      },
      {
        header: "Start Date",
        accessorKey: "startDate",
        size: 120,
      },
      {
        header: "End Date",
        accessorKey: "endDate",
        size: 120,
      },
      {
        header: "Remaining Amount",
        accessorKey: "remainingAmount",
        size: 120,
      },
      {
        header: "Amount",
        accessorKey: "amount",
        size: 100,
      },
    ],
    [checkboxStates]
  );

  // Highlight utility (used in renderOption functions)
  const highlightText = (text, needle) => {
    if (!needle) return text;
    const safe = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safe})`, "gi");
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          style={{
            background: "none",
            color: "#00dac6",
            fontWeight: 700,
            padding: 0,
          }}
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // DataGrid columns for budgets
  const dataGridColumns = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 120 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 120 },
    { field: "startDate", headerName: "Start Date", flex: 1, minWidth: 100 },
    { field: "endDate", headerName: "End Date", flex: 1, minWidth: 100 },
    {
      field: "remainingAmount",
      headerName: "Remaining Amount",
      flex: 1,
      minWidth: 120,
    },
    { field: "amount", headerName: "Amount", flex: 1, minWidth: 100 },
  ];

  // DataGrid rows for budgets
  const dataGridRows = Array.isArray(budgets)
    ? budgets.map((item, index) => ({
        ...item,
        id: item.id ?? `temp-${index}-${Date.now()}`,
      }))
    : [];

  // Map checkboxStates to DataGrid selection model
  const selectedIds = dataGridRows
    .filter((_, idx) => checkboxStates[idx])
    .map((row) => row.id);

  const handleDataGridSelection = (newSelection) => {
    // Map DataGrid selection to checkboxStates
    const newCheckboxStates = dataGridRows.map((row, idx) =>
      newSelection.includes(row.id)
    );
    setCheckboxStates(newCheckboxStates);
  };

  const table = useReactTable({
    data: budgets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(budgets.length / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
  });

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPageIndex(0);
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
        <div className="w-full flex justify-between items-center mb-1">
          <p
            style={{ color: colors.primary_text }}
            className="font-extrabold text-4xl"
          >
            New Expense
          </p>

          <div className="flex items-center gap-3">
            {/* Display previous expense indicator only when name and date are set */}
            {expenseData.expenseName?.trim().length >= 2 &&
              expenseData.date && (
                <PreviousExpenseIndicator
                  expense={previousExpense}
                  isLoading={loadingPreviousExpense}
                  position="right"
                  variant="gradient"
                  showTooltip={true}
                  dateFormat={dateFormat}
                  label="Previously Added"
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
              )}

            <button
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  navigate(-1);
                }
              }}
              className="flex items-center justify-center w-12 h-12 text-[32px] font-bold rounded mt-[-10px]"
              style={{ backgroundColor: colors.active_bg, color: "#00dac6" }}
            >
              ×
            </button>
          </div>
        </div>
        <hr
          style={{ borderColor: colors.border_color }}
          className="border-t w-full mt-[-4px]"
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

        <div className="mt-4 sm:mt-[50px] w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            onClick={handleLinkBudgets}
            className="px-6 py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0] w-full sm:w-[150px]"
          >
            Link Budgets
          </button>
          {showTable && (
            <button
              onClick={handleCloseTable}
              className="px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a] mt-2 sm:mt-0 hidden sm:block"
            >
              X
            </button>
          )}
        </div>
        {showTable && (
          <div className="mt-4 sm:mt-6 w-full relative">
            <div className="block sm:hidden space-y-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleCloseTable}
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
              {budgets.length === 0 ? (
                <div
                  className="text-center py-8"
                  style={{ color: colors.secondary_text }}
                >
                  No rows found
                </div>
              ) : (
                budgets.map((row, index) => (
                  <div
                    key={row.id}
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: colors.active_bg,
                      border: `1px solid ${colors.border_color}`,
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span
                        style={{ color: colors.primary_text }}
                        className="font-semibold"
                      >
                        {row.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          style={{ color: colors.secondary_text }}
                          className="text-sm"
                        >
                          In Budget
                        </span>
                        <input
                          type="checkbox"
                          checked={checkboxStates[index]}
                          onChange={() => handleCheckboxChange(index)}
                          className="h-5 w-5 text-[#00dac6] rounded focus:ring-[#00dac6]"
                        />
                      </div>
                    </div>
                    <div
                      className="text-sm space-y-1"
                      style={{ color: colors.secondary_text }}
                    >
                      <p>
                        <span className="font-medium">Description:</span>{" "}
                        {row.description}
                      </p>
                      <p>
                        <span className="font-medium">Start Date:</span>{" "}
                        {row.startDate}
                      </p>
                      <p>
                        <span className="font-medium">End Date:</span>{" "}
                        {row.endDate}
                      </p>
                      <p>
                        <span className="font-medium">Remaining Amount:</span>{" "}
                        {row.remainingAmount}
                      </p>
                      <p>
                        <span className="font-medium">Amount:</span>{" "}
                        {row.amount}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="hidden sm:block">
              <Box
                sx={{
                  height: 320,
                  width: "100%",
                  background: colors.active_bg,
                  borderRadius: 2,
                  border: `1px solid ${colors.border_color}`,
                }}
              >
                <DataGrid
                  rows={dataGridRows}
                  columns={dataGridColumns}
                  getRowId={(row) => row.id}
                  checkboxSelection
                  disableRowSelectionOnClick
                  selectionModel={selectedIds}
                  onRowSelectionModelChange={handleDataGridSelection}
                  pageSizeOptions={[5, 10, 20]}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: pageSize },
                    },
                  }}
                  rowHeight={41}
                  headerHeight={32}
                  sx={{
                    color: colors.primary_text,
                    border: 0,
                    "& .MuiDataGrid-columnHeaders": {
                      background: colors.hover_bg,
                    },
                    "& .MuiDataGrid-row": { background: colors.active_bg },
                    "& .MuiCheckbox-root": { color: "#00dac6 !important" },
                    fontSize: "0.92rem",
                  }}
                />
              </Box>
            </div>
          </div>
        )}

        {budgetError && (
          <div className="text-red-500 text-sm mt-4">
            Error: {budgetError.message || "Failed to load budgets."}
          </div>
        )}

        <div className="w-full flex justify-end mt-4 sm:mt-8">
          {hasWriteAccess && (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0] w-full sm:w-[120px]"
            >
              Submit
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
