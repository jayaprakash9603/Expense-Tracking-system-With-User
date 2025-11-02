import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import ItemNameAutocomplete from "./ItemNameAutocomplete";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  IconButton,
  Button,
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
import ExpenseNameAutocomplete from "../../components/ExpenseNameAutocomplete";
import PreviousExpenseIndicator from "../../components/PreviousExpenseIndicator";
import CategoryAutocomplete from "../../components/CategoryAutocomplete";
import PaymentMethodAutocomplete from "../../components/PaymentMethodAutocomplete";
import { normalizePaymentMethod } from "../../utils/paymentMethodUtils";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess"; // still used for hasWriteAccess gating below
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import usePreviousExpense from "../../hooks/usePreviousExpense";
import { createBill } from "../../Redux/Bill/bill.action";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";

const CreateBill = ({ onClose, onSuccess }) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
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
  const searchParams = new URLSearchParams(location.search);
  const dateFromQuery = searchParams.get("date");

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const dispatch = useDispatch();
  const { friendId } = useParams();
  const { hasWriteAccess } = useFriendAccess(friendId);
  // DRY redirect guard
  useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) => `/bill/${fid}`,
    selfPath: "/bill",
    defaultPath: "/bill",
  });
  const lastRowRef = useRef(null);
  const {
    budgets,
    error: budgetError,
    loading: budgetLoading,
  } = useSelector((state) => state.budgets || {});

  const [hasUnsavedExpenseChanges, setHasUnsavedExpenseChanges] =
    useState(false);

  // Add loading state for bill creation
  const { loading: billLoading } = useSelector((state) => state.bills || {});

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
  const [checkboxStates, setCheckboxStates] = useState([]);
  const [selectedBudgets, setSelectedBudgets] = useState([]);

  // Use custom hook for previous expense functionality
  const { previousExpense, loadingPreviousExpense } = usePreviousExpense(
    billData.name,
    billData.date,
    friendId
  );

  // Type options
  const typeOptions = ["gain", "loss"];

  // Validation function for expense items

  const isCurrentRowComplete = (expense) => {
    if (!expense) return false;

    const hasItemName = expense.itemName && expense.itemName.trim() !== "";
    const hasValidUnitPrice =
      expense.unitPrice !== "" &&
      expense.unitPrice !== null &&
      expense.unitPrice !== undefined &&
      !isNaN(parseFloat(expense.unitPrice)) &&
      parseFloat(expense.unitPrice) > 0 &&
      !expense.unitPrice.toString().includes("-"); // Ensure no negative sign
    const hasValidQuantity =
      expense.quantity !== "" &&
      expense.quantity !== null &&
      expense.quantity !== undefined &&
      !isNaN(parseFloat(expense.quantity)) &&
      parseFloat(expense.quantity) > 0 &&
      !expense.quantity.toString().includes("-"); // Ensure no negative sign

    return hasItemName && hasValidUnitPrice && hasValidQuantity;
  };

  // Fetch budgets on component mount
  useEffect(() => {
    dispatch(getListOfBudgetsById(today, friendId || ""));
  }, [dispatch, today]);

  // Update checkbox states when budgets change
  useEffect(() => {
    setCheckboxStates(budgets.map((budget) => budget.includeInBudget || false));
  }, [budgets]);

  // Calculate total amount from saved expenses
  useEffect(() => {
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + (expense.totalPrice || 0),
      0
    );
    setBillData((prev) => ({ ...prev, amount: totalAmount.toString() }));
  }, [expenses]);

  // Update selected budgets when checkbox states change
  useEffect(() => {
    const selected = budgets.filter((_, index) => checkboxStates[index]);
    setSelectedBudgets(selected);
  }, [checkboxStates, budgets]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillData({ ...billData, [name]: value });

    // Clear the error for this field when the user updates it
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleTypeChange = (event, newValue) => {
    const newType = newValue || "loss";

    setBillData((prev) => ({
      ...prev,
      type: newType,
    }));

    if (errors.type) {
      setErrors({ ...errors, type: false });
    }
  };

  const handleDateChange = (newValue) => {
    if (newValue) {
      const formatted = dayjs(newValue).format("YYYY-MM-DD");
      setBillData((prev) => ({ ...prev, date: formatted }));
    }

    // Clear the date error when the user updates it
    if (errors.date) {
      setErrors({ ...errors, date: false });
    }
    const formatted = dayjs(newValue).format("YYYY-MM-DD");
    // Dispatch getListOfBudgetsById with the selected date
    dispatch(getListOfBudgetsById(formatted, friendId));
  };

  // Handle temp expense changes in table

  const handleTempExpenseChange = (index, field, value) => {
    const updatedExpenses = [...tempExpenses];

    // For quantity and unitPrice, ensure only positive values
    if (field === "quantity" || field === "unitPrice") {
      // Convert to number and check if it's positive
      const numValue = parseFloat(value);

      // Allow empty string for editing, but prevent negative values
      if (value === "" || numValue > 0) {
        updatedExpenses[index][field] = value;
      } else {
        // Don't update if the value is negative or zero
        return;
      }
    } else {
      updatedExpenses[index][field] = value;
    }

    // Recalculate total price when quantity or unit price changes
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

    // Recalculate total price when item name changes
    const quantity = parseFloat(updatedExpenses[index].quantity) || 1;
    const unitPrice = parseFloat(updatedExpenses[index].unitPrice) || 0;
    updatedExpenses[index].totalPrice = quantity * unitPrice;

    setTempExpenses(updatedExpenses);

    // Mark as having unsaved changes
    setHasUnsavedExpenseChanges(true);

    // Force a re-render to update the Add Row button state
    // This ensures the validation runs immediately after item name change
    setTimeout(() => {
      // This will trigger a re-render and update the button state
      setTempExpenses([...updatedExpenses]);
    }, 0);
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

      // Mark as having unsaved changes
      setHasUnsavedExpenseChanges(true);

      // Scroll to the new row and focus on item name input after state update
      setTimeout(() => {
        if (lastRowRef.current) {
          lastRowRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });

          // Focus on the item name input of the new row
          const itemNameInput = lastRowRef.current.querySelector(
            'input[placeholder="Item name"]'
          );
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

      // Mark as having unsaved changes
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
          parseFloat(expense.quantity) > 0)
    );
  };

  const handleSaveExpenses = () => {
    const validExpenses = tempExpenses.filter((expense) =>
      isCurrentRowComplete(expense)
    );

    if (validExpenses.length === 0) {
      alert(
        "Please add at least one complete expense item before saving. Item Name, Quantity, and Unit Price are all required."
      );
      return;
    }

    setExpenses(validExpenses);
    setShowExpenseTable(false);

    // Reset unsaved changes flag after successful save
    setHasUnsavedExpenseChanges(false);

    // Reset temp expenses
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

      // Load existing expenses into temp if any
      if (expenses.length > 0) {
        setTempExpenses([...expenses]);
        setHasUnsavedExpenseChanges(false); // No unsaved changes when loading existing data
      }
    }
  };
  const handleCloseExpenseTable = () => {
    setShowExpenseTable(false);
    // Reset temp expenses to current saved expenses
    if (expenses.length > 0) {
      setTempExpenses([...expenses]);
    } else {
      setTempExpenses([
        { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0 },
      ]);
    }
  };

  const handleCloseExpenseTableWithConfirmation = () => {
    // Check if there are unsaved changes and valid entries
    if (hasUnsavedExpenseChanges && hasValidExpenseEntries()) {
      const confirmClose = window.confirm(
        "You have unsaved expense items. Are you sure you want to close without saving? All entered data will be lost."
      );

      if (confirmClose) {
        // Reset temp expenses to initial state
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
      // If user cancels, do nothing (keep the table open)
    } else {
      // No unsaved changes or no valid entries, close normally
      setShowExpenseTable(false);
    }
  };
  const handleToggleBudgetTable = () => {
    setShowBudgetTable(!showBudgetTable);
    if (showExpenseTable) {
      setShowExpenseTable(false); // Close expense table if open
    }
  };

  const handleCloseBudgetTable = () => {
    setShowBudgetTable(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Existing validations...
    if (!billData.name) newErrors.name = true;
    if (!billData.date) newErrors.date = true;
    if (!billData.type) newErrors.type = true;

    // Validate expense items
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
        !expense.quantity.toString().includes("-")
    );

    if (validExpenses.length === 0) {
      newErrors.expenses = true;
      alert("At least one expense item should be added to create a bill.");
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Calculate total amount from valid expenses
      const totalAmount = validExpenses.reduce(
        (sum, expense) => sum + expense.totalPrice,
        0
      );

      // Validate total amount
      if (totalAmount <= 0) {
        alert("Total amount must be greater than zero.");
        return;
      }

      // Calculate net amount
      const netAmount = totalAmount;

      // Prepare bill data for submission
      const normalizedMethod = normalizePaymentMethod(billData.paymentMethod);

      const billPayload = {
        name: billData.name.trim(),
        description: billData.description?.trim() || "",
        amount: totalAmount,
        netAmount: netAmount,
        paymentMethod: normalizedMethod,
        type: billData.type,
        date: billData.date,
        categoryId: billData.categoryId || 0, // Use 0 instead of null
        expenses: validExpenses.map((expense) => ({
          itemName: expense.itemName.trim(),
          quantity: parseFloat(expense.quantity),
          unitPrice: parseFloat(expense.unitPrice),
          totalPrice: expense.totalPrice,
          comments: expense.comments?.trim() || "",
        })),
        budgetIds: selectedBudgets.map((budget) => budget.id) || [],
        creditDue:
          billData.type === "loss" && normalizedMethod === "creditNeedToPaid"
            ? totalAmount
            : 0,
        includeInBudget: selectedBudgets.length > 0, // Add this field
      };

      console.log("Submitting bill with payload:", billPayload);

      // Dispatch the create bill action
      const resultAction = await dispatch(
        createBill(billPayload, friendId || "")
      );

      console.log("Bill creation result:", resultAction);

      // Check if the action was successful
      if (resultAction && !resultAction.error) {
        // Success case
        console.log("Bill created successfully:", resultAction);
        alert("Bill created successfully!");

        // Reset form data
        setBillData({
          name: "",
          description: "",
          amount: "",
          paymentMethod: "cash",
          type: "loss",
          date: dateFromQuery || today,
          categoryId: "",
        });

        // Reset expenses
        setExpenses([]);
        setTempExpenses([
          { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0 },
        ]);

        // Reset selected budgets
        setSelectedBudgets([]);
        setCheckboxStates([]);

        // Reset errors
        setErrors({});

        // Reset table states
        setShowExpenseTable(false);
        setShowBudgetTable(false);
        setHasUnsavedExpenseChanges(false);

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(resultAction.payload || resultAction);
        }

        // Navigate back or close modal
        if (onClose) {
          onClose();
        } else {
          navigate(-1);
        }
      } else {
        // Error case - handle both rejected actions and error responses
        const errorMessage =
          resultAction?.error?.message ||
          resultAction?.payload?.message ||
          resultAction?.message ||
          "Failed to create bill. Please try again.";

        console.error("Bill creation failed:", errorMessage);
        alert(`Error creating bill: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error during bill submission:", error);
      alert(
        `Error creating bill: ${
          error.message || "An unexpected error occurred. Please try again."
        }`
      );
    }
  };

  const handleCheckboxChange = (index) => {
    setCheckboxStates((prev) =>
      prev.map((state, i) => (i === index ? !state : state))
    );
  };

  const renderNameInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="name"
          className={labelStyle}
          style={{ ...inputWrapper, color: colors.primary_text }}
        >
          Name<span className="text-red-500"> *</span>
        </label>
        <ExpenseNameAutocomplete
          value={billData.name}
          onChange={(val) => {
            setBillData((prev) => ({ ...prev, name: val }));
            if (errors.name && val)
              setErrors((prev) => ({ ...prev, name: false }));
          }}
          friendId={friendId}
          placeholder="Search or type bill name"
          error={errors.name}
          size="medium"
        />
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
          Description
        </label>
        <TextField
          id="description"
          name="description"
          value={billData.description}
          onChange={handleInputChange}
          placeholder="Enter description"
          variant="outlined"
          multiline
          rows={1}
          sx={{
            width: "100%",
            maxWidth: "300px",
            "& .MuiInputBase-root": {
              backgroundColor: colors.primary_bg,
              color: colors.primary_text,
              fontSize: "16px",
            },
            "& .MuiInputBase-input": {
              color: colors.primary_text,
              "&::placeholder": {
                color: colors.icon_muted,
                opacity: 1,
              },
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.border_color,
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: colors.border_color,
              },
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
          Date<span className="text-red-500"> *</span>
        </label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={billData.date ? dayjs(billData.date) : null}
            onChange={handleDateChange}
            format={dateFormat}
            sx={{
              background: colors.primary_bg,
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
                  "& input": {
                    height: 32,
                    fontSize: 16,
                  },
                },
                inputProps: {
                  max: dayjs().format("YYYY-MM-DD"),
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
          Payment Method
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
          placeholder="Select payment method"
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
          Type<span className="text-red-500"> *</span>
        </label>
        <Autocomplete
          autoHighlight
          options={typeOptions}
          getOptionLabel={(option) =>
            option.charAt(0).toUpperCase() + option.slice(1)
          }
          value={billData.type || ""}
          onChange={handleTypeChange} // Use the new handler
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select type"
              variant="outlined"
              error={errors.type}
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: colors.primary_bg,
                  color: colors.primary_text,
                  height: "56px",
                  fontSize: "16px",
                },
                "& .MuiInputBase-input": {
                  color: colors.primary_text,
                  "&::placeholder": {
                    color: colors.icon_muted,
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
          sx={{
            width: "100%",
            maxWidth: "300px",
          }}
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
          Category
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
          placeholder="Search category"
          size="medium"
        />
      </div>
    </div>
  );

  // DataGrid columns for budgets
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
        index,
        id: item.id ?? `temp-${index}-${Date.now()}`,
        includeInBudget: checkboxStates[index],
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

  return (
    <>
      <div
        className="flex flex-col relative create-bill-container"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: colors.tertiary_bg,
          borderRadius: "8px",
          border: `1px solid ${colors.border_color}`,
          padding: "20px",
          marginRight: "20px",
          overflowY: "auto",
        }}
      >
        <div className="w-full flex justify-between items-center mb-1">
          <p
            className="font-extrabold text-4xl"
            style={{ color: colors.primary_text }}
          >
            Create Bill
          </p>

          <div className="flex items-center gap-3">
            {/* Display previous expense indicator only when name and date are set */}
            {billData.name?.trim().length >= 2 && billData.date && (
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
              style={{
                backgroundColor: colors.secondary_bg,
                color: colors.secondary_accent,
              }}
            >
              ×
            </button>
          </div>
        </div>
        <hr
          className="border-t w-full mt-[-4px] mb-0"
          style={{ borderColor: colors.border_color }}
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

        {/* Action Buttons - Same Line */}
        <div className="mt-6 flex justify-between items-center">
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
            {showBudgetTable ? "Hide" : "Link"} Budgets
          </Button>

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
            {showExpenseTable ? "Hide" : "Add"} Expense Items
          </Button>
        </div>

        {/* Budget Table Section - Only show when showBudgetTable is true and expense table is closed */}
        {showBudgetTable && !showExpenseTable && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-xl font-semibold"
                style={{ color: colors.primary_text }}
              >
                Available Budgets for Selected Date
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
                Error: {budgetError.message || "Failed to load budgets."}
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
                No budgets found for the selected date
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
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
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

        {/* Expense Items Table Section - Show when showExpenseTable is true */}
        {showExpenseTable && !showBudgetTable && (
          <div className="mt-6 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-xl font-semibold"
                style={{ color: colors.primary_text }}
              >
                Expense Items
              </h3>
              <IconButton
                onClick={handleCloseExpenseTableWithConfirmation} // Use the new function
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

            <div
              className="rounded border px-3 pt-3 flex-1 flex flex-col min-h-0"
              style={{
                backgroundColor: colors.secondary_bg,
                borderColor: colors.border_color,
              }}
            >
              {/* Table Header - Updated */}
              <div
                className="grid grid-cols-6 gap-3 mb-3 pb-2 border-b"
                style={{ borderColor: colors.border_color }}
              >
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  Item Name *
                </div>
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  Quantity *
                </div>
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  Unit Price *
                </div>
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  Total Price
                </div>

                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  Comments
                </div>
                <div
                  className="font-semibold text-sm col-span-1"
                  style={{ color: colors.primary_text }}
                >
                  Actions
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
                      className={`grid grid-cols-6 gap-3 items-center p-3 rounded ${
                        isIncomplete ? "border border-red-500" : "border"
                      }`}
                      style={{
                        backgroundColor: isIncomplete
                          ? "rgba(255, 68, 68, 0.1)"
                          : colors.secondary_bg,
                        borderColor: isIncomplete
                          ? "#ef4444"
                          : colors.border_color,
                      }}
                    >
                      {/* Item Name Autocomplete - Updated */}
                      <div className="col-span-1">
                        <ItemNameAutocomplete
                          value={expense.itemName}
                          onChange={(event, newValue) =>
                            handleItemNameChange(index, event, newValue)
                          }
                          placeholder="Item name"
                          autoFocus={isLastRow && expense.itemName === ""}
                        />
                      </div>

                      {/* Quantity Input - Updated with positive value validation */}
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Qty *"
                          value={expense.quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow empty string or positive numbers only
                            if (
                              value === "" ||
                              (parseFloat(value) > 0 && !value.includes("-"))
                            ) {
                              handleTempExpenseChange(index, "quantity", value);
                            }
                          }}
                          onKeyDown={(e) => {
                            // Prevent entering negative sign, 'e', 'E', '+', and '.'
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

                      {/* Unit Price Input - Updated with positive value validation */}
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Unit Price *"
                          value={expense.unitPrice}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow empty string or positive numbers only
                            if (
                              value === "" ||
                              (parseFloat(value) > 0 && !value.includes("-"))
                            ) {
                              handleTempExpenseChange(
                                index,
                                "unitPrice",
                                value
                              );
                            }
                          }}
                          onKeyDown={(e) => {
                            // Prevent entering negative sign, 'e', 'E', '+'
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

                      {/* Total Price Input */}
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

                      {/* Comments Input */}
                      <div className="col-span-1">
                        <input
                          type="text"
                          placeholder="Comments"
                          value={expense.comments || ""}
                          onChange={(e) =>
                            handleTempExpenseChange(
                              index,
                              "comments",
                              e.target.value
                            )
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

                      {/* Actions */}
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

              {/* Add Row Button and Actions - Fixed at bottom */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <Button
                      onClick={addTempExpenseRow}
                      startIcon={<AddIcon />}
                      disabled={
                        !isCurrentRowComplete(
                          tempExpenses[tempExpenses.length - 1]
                        )
                      }
                      sx={{
                        backgroundColor: isCurrentRowComplete(
                          tempExpenses[tempExpenses.length - 1]
                        )
                          ? "#00DAC6"
                          : "#666",
                        color: isCurrentRowComplete(
                          tempExpenses[tempExpenses.length - 1]
                        )
                          ? "black"
                          : "#999",
                        "&:hover": {
                          backgroundColor: isCurrentRowComplete(
                            tempExpenses[tempExpenses.length - 1]
                          )
                            ? "#00b8a0"
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
                      Add Row
                    </Button>

                    {!isCurrentRowComplete(
                      tempExpenses[tempExpenses.length - 1]
                    ) && (
                      <div className="text-red-400 text-xs mt-1">
                        Complete the current item (Item Name, Quantity, and Unit
                        Price are all required) to add more rows
                      </div>
                    )}
                  </div>

                  {/* Total Summary - Centered */}
                  {tempExpenses.length > 0 && (
                    <div className="text-white font-semibold">
                      Total Amount: {currencySymbol}
                      {tempExpenses
                        .reduce(
                          (sum, expense) => sum + (expense.totalPrice || 0),
                          0
                        )
                        .toFixed(2)}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCloseExpenseTableWithConfirmation} // Use the new function
                      sx={{
                        backgroundColor: "#ff4444",
                        color: "white",
                        fontSize: "0.875rem",
                        padding: "6px 12px",
                        "&:hover": {
                          backgroundColor: "#ff6666",
                        },
                      }}
                      size="small"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveExpenses}
                      sx={{
                        backgroundColor: "#00DAC6",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "#00b8a0",
                        },
                        fontSize: "0.875rem",

                        padding: "6px 12px",
                      }}
                      size="small"
                    >
                      Save Expenses
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expense Items Summary - Show when not in table view */}

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
                  Expense Items Summary
                </h4>
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.secondary_accent }}
                >
                  {expenses.length} item{expenses.length !== 1 ? "s" : ""} added
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
                    ⚠️ No expense items added yet
                  </p>
                  <p className="text-xs" style={{ color: colors.icon_muted }}>
                    At least one expense item is required to create a bill
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Responsive grid container for expense items - Reduced height */}
                  <div
                    className="max-h-80 overflow-y-auto pr-2"
                    style={{
                      maxHeight: "285px",
                      scrollbarWidth: "thin",
                      scrollbarColor: `${colors.primary_accent} ${colors.primary_bg}`,
                    }}
                  >
                    {/* Grid layout: 1 column on mobile, 2 on tablet, 3 on desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                      {expenses.map((expense, index) => (
                        <div
                          key={index}
                          className="rounded-lg p-2 border hover:border-gray-600 transition-colors"
                          style={{
                            backgroundColor: colors.primary_bg,
                            borderColor: colors.border_color,
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
                                Qty
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
                                Unit
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
                                Calc
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
                                  Comments
                                </div>
                                <div
                                  className="text-[10px] p-1 rounded border break-words max-h-16 overflow-auto"
                                  style={{
                                    color: colors.secondary_text,
                                    backgroundColor: colors.secondary_bg,
                                    borderColor: colors.border_color,
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

                  {/* Total summary section */}
                  <div className="border-t border-gray-600 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium text-sm">
                        Total Amount:
                      </span>
                      <span className="text-[#00dac6] font-bold text-lg">
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
              onMouseEnter={(e) =>
                !billLoading &&
                (e.target.style.backgroundColor = colors.button_hover)
              }
              onMouseLeave={(e) =>
                !billLoading &&
                (e.target.style.backgroundColor = colors.button_bg)
              }
            >
              {billLoading ? (
                <CircularProgress
                  size={20}
                  sx={{ color: colors.button_text }}
                />
              ) : (
                "Submit"
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
            height: 4px;
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
            .create-bill-container {
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

export default CreateBill;
