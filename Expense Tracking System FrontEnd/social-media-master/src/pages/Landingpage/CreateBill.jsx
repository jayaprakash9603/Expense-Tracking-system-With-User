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
import { getExpensesSuggestions } from "../../Redux/Expenses/expense.action";
import NameAutocomplete from "../../components/NameAutocomplete";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess"; // still used for hasWriteAccess gating below
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import { fetchCategories } from "../../Redux/Category/categoryActions";
import { createBill } from "../../Redux/Bill/bill.action";
import { fetchAllPaymentMethods } from "../../Redux/Payment Method/paymentMethod.action";

const labelStyle = "text-white text-sm sm:text-base font-semibold mr-4";
const inputWrapper = {
  width: "150px",
  minWidth: "150px",
  display: "flex",
  alignItems: "center",
};

const CreateBill = ({ onClose, onSuccess }) => {
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
  const {
    topExpenses: expenseNameSuggestions = [],
    loading: suggestionsLoading,
  } = useSelector((state) => state.expenses || {});
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categories || {});
  const {
    paymentMethods,
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = useSelector((state) => state.paymentMethods || {});

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
  const [localPaymentMethods, setLocalPaymentMethods] = useState([]);
  const [localPaymentMethodsLoading, setLocalPaymentMethodsLoading] =
    useState(false);
  const [localPaymentMethodsError, setLocalPaymentMethodsError] =
    useState(null);

  const formatPaymentMethodName = (name) => {
    const n = String(name || "")
      .toLowerCase()
      .trim();
    if (n === "cash") return "Cash";
    if (
      n === "creditneedtopaid" ||
      n === "credit due" ||
      n === "credit need to paid" ||
      n === "credit need to pay" ||
      n === "creditneedtopay"
    )
      return "Credit Due";
    if (n === "creditpaid" || n === "credit paid") return "Credit Paid";
    // For other payment methods, convert to title case
    return String(name || "")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Normalize any payment method label/value into backend-friendly keys
  const normalizePaymentMethod = (name) => {
    const raw = String(name || "").trim();
    const key = raw.toLowerCase().replace(/\s+/g, "").replace(/_/g, "");
    switch (key) {
      case "creditneedtopaid":
      case "creditdue":
        return "creditNeedToPaid";
      case "creditpaid":
        return "creditPaid";
      case "cash":
        return "cash";
      default:
        return raw; // keep custom methods as-is
    }
  };

  const defaultPaymentMethods = [
    { name: "cash", label: "Cash", type: "expense" },
    { name: "creditNeedToPaid", label: "Credit Due", type: "expense" },
    { name: "creditPaid", label: "Credit Paid", type: "expense" },
    { name: "cash", label: "Cash", type: "income" },
    { name: "creditPaid", label: "Credit Paid", type: "income" },
    { name: "creditNeedToPaid", label: "Credit Due", type: "income" },
  ];
  // Payment method options
  // Fix the filtering logic in processedPaymentMethods
  const processedPaymentMethods = useMemo(() => {
    console.log("Processing local payment methods:", {
      localPaymentMethods,
      isArray: Array.isArray(localPaymentMethods),
      length: localPaymentMethods?.length,
      billType: billData.type,
    });

    let availablePaymentMethods = [];

    // If we have valid payment methods from local state
    if (Array.isArray(localPaymentMethods) && localPaymentMethods.length > 0) {
      const filteredMethods = localPaymentMethods.filter((pm) => {
        if (billData.type === "loss") {
          return pm.type && pm.type.toLowerCase() === "expense";
        } else if (billData.type === "gain") {
          return pm.type && pm.type.toLowerCase() === "income";
        }
        return true;
      });

      availablePaymentMethods = filteredMethods.map((pm) => ({
        value: normalizePaymentMethod(pm.name),
        label: formatPaymentMethodName(pm.name),
        ...pm,
      }));
    }

    // Dedupe by value (avoid Credit Due duplicates from variations)
    if (availablePaymentMethods.length > 0) {
      const map = new Map();
      for (const pm of availablePaymentMethods) {
        if (!map.has(pm.value)) map.set(pm.value, pm);
      }
      availablePaymentMethods = Array.from(map.values());
    }

    // If no filtered methods available, use default fallback based on type
    if (availablePaymentMethods.length === 0) {
      console.log(
        "Using default payment methods as fallback for type:",
        billData.type
      );

      // Filter default methods by both name AND type
      const defaultMethodsForType = defaultPaymentMethods.filter((pm) => {
        if (billData.type === "loss") {
          // Only return expense type payment methods
          return pm.type === "expense";
        } else if (billData.type === "gain") {
          // Only return income type payment methods
          return pm.type === "income";
        }
        return true;
      });

      availablePaymentMethods = defaultMethodsForType.map((pm) => ({
        value: normalizePaymentMethod(pm.name),
        label: pm.label,
        type: pm.type,
      }));
    }

    // Final dedupe including defaults
    if (availablePaymentMethods.length > 0) {
      const final = new Map();
      for (const pm of availablePaymentMethods) {
        if (!final.has(pm.value)) final.set(pm.value, pm);
      }
      availablePaymentMethods = Array.from(final.values());
    }

    console.log("Final available payment methods:", availablePaymentMethods);
    return availablePaymentMethods;
  }, [localPaymentMethods, billData.type]);

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

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLocalPaymentMethodsLoading(true);
        setLocalPaymentMethodsError(null);

        console.log(
          "Fetching payment methods for friendId:",
          friendId || "current user"
        );

        // Dispatch the action and wait for the result
        const resultAction = await dispatch(
          fetchAllPaymentMethods(friendId || "")
        );

        console.log("Payment methods action result:", resultAction);

        // Check if the action was successful and extract the payload
        if (resultAction) {
          const paymentMethodsData = resultAction || resultAction || [];
          console.log("Setting local payment methods:", paymentMethodsData);
          setLocalPaymentMethods(
            Array.isArray(paymentMethodsData) ? paymentMethodsData : []
          );
        } else {
          const errorMessage =
            resultAction.error?.message ||
            resultAction.payload ||
            "Failed to fetch payment methods";
          console.error("Payment methods fetch failed:", errorMessage);
          setLocalPaymentMethodsError(errorMessage);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        setLocalPaymentMethodsError(
          error.message || "Failed to fetch payment methods"
        );
      } finally {
        setLocalPaymentMethodsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [dispatch]);
  // Fetch budgets on component mount
  useEffect(() => {
    dispatch(getListOfBudgetsById(today, friendId || ""));
  }, [dispatch, today]);

  // Fetch expense name suggestions for autocomplete (top expense names)
  useEffect(() => {
    dispatch(getExpensesSuggestions(friendId || ""));
  }, [dispatch, friendId]);

  // Update checkbox states when budgets change
  useEffect(() => {
    setCheckboxStates(budgets.map((budget) => budget.includeInBudget || false));
  }, [budgets]);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories(friendId || ""));
  }, [dispatch]);

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
      // Reset payment method to first available option for the new type
      paymentMethod: "cash", // This will be updated by the effect below
    }));

    if (errors.type) {
      setErrors({ ...errors, type: false });
    }
  };

  //Add useEffect to update payment method when type changes and options are available
  useEffect(() => {
    if (processedPaymentMethods.length > 0) {
      // Check if current payment method is still valid for the selected type
      const currentMethodValid = processedPaymentMethods.some(
        (pm) => pm.value === billData.paymentMethod
      );

      // If current method is not valid, set to first available option
      if (!currentMethodValid) {
        setBillData((prev) => ({
          ...prev,
          paymentMethod: normalizePaymentMethod(
            processedPaymentMethods[0]?.value || "cash"
          ),
        }));
      }
    }
  }, [processedPaymentMethods, billData.paymentMethod]);
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
        <label htmlFor="name" className={labelStyle} style={inputWrapper}>
          Name<span className="text-red-500"> *</span>
        </label>
        <NameAutocomplete
          value={billData.name}
          onChange={(val) => {
            setBillData((prev) => ({ ...prev, name: val }));
            if (errors.name && val)
              setErrors((prev) => ({ ...prev, name: false }));
          }}
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
          style={inputWrapper}
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
              backgroundColor: "#29282b",
              color: "#fff",
              fontSize: "16px",
            },
            "& .MuiInputBase-input": {
              color: "#fff",
              "&::placeholder": {
                color: "#9ca3af",
                opacity: 1,
              },
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgb(75, 85, 99)",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: "rgb(75, 85, 99)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00dac6",
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
        <label htmlFor="date" className={labelStyle} style={inputWrapper}>
          Date<span className="text-red-500"> *</span>
        </label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={billData.date ? dayjs(billData.date) : null}
            onChange={handleDateChange}
            sx={{
              background: "#29282b",
              borderRadius: 2,
              color: "#fff",
              ".MuiInputBase-input": {
                color: "#fff",
                height: 32,
                fontSize: 16,
              },
              ".MuiSvgIcon-root": { color: "#00dac6" },
              width: 300,
              height: 56,
              minHeight: 56,
              maxHeight: 56,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: errors.date ? "#ff4d4f" : "rgb(75, 85, 99)",
                  borderWidth: "1px",
                },
                "&:hover fieldset": {
                  borderColor: errors.date ? "#ff4d4f" : "rgb(75, 85, 99)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: errors.date ? "#ff4d4f" : "#00dac6",
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
                  color: "#fff",
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
            format="DD-MM-YYYY"
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
          style={inputWrapper}
        >
          Payment Method
        </label>
        <Autocomplete
          autoHighlight
          options={processedPaymentMethods}
          getOptionLabel={(option) => option.label || option}
          value={
            processedPaymentMethods.find(
              (pm) => pm.value === billData.paymentMethod
            ) || null
          }
          onChange={(event, newValue) => {
            setBillData((prev) => ({
              ...prev,
              paymentMethod: newValue
                ? normalizePaymentMethod(newValue.value)
                : "cash",
            }));
          }}
          loading={localPaymentMethodsLoading}
          noOptionsText={
            billData.type
              ? `No ${
                  billData.type === "loss" ? "expense" : "income"
                } payment methods available`
              : "No payment methods available"
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select payment method"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {localPaymentMethodsLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "#29282b",
                  color: "#fff",
                  height: "56px",
                  fontSize: "16px",
                },
                "& .MuiInputBase-input": {
                  color: "#fff",
                  "&::placeholder": {
                    color: "#9ca3af",
                    opacity: 1,
                  },
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgb(75, 85, 99)",
                    borderWidth: "1px",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgb(75, 85, 99)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00dac6",
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

      {/* Error display using local state */}
      {localPaymentMethodsError && (
        <div className="text-red-400 text-xs mt-1">
          Error: {localPaymentMethodsError}
        </div>
      )}

      {/* Debug info - remove in production */}
      {/* <div className="text-gray-400 text-xs mt-1">
        Options: {processedPaymentMethods.length} available for{" "}
        {billData.type || "all types"}
        {localPaymentMethodsLoading && " (Loading...)"}
      </div> */}
    </div>
  );

  const renderTypeAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor="type" className={labelStyle} style={inputWrapper}>
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
                  backgroundColor: "#29282b",
                  color: "#fff",
                  height: "56px",
                  fontSize: "16px",
                },
                "& .MuiInputBase-input": {
                  color: "#fff",
                  "&::placeholder": {
                    color: "#9ca3af",
                    opacity: 1,
                  },
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: errors.type ? "#ff4d4f" : "rgb(75, 85, 99)",
                    borderWidth: "1px",
                  },
                  "&:hover fieldset": {
                    borderColor: errors.type ? "#ff4d4f" : "rgb(75, 85, 99)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: errors.type ? "#ff4d4f" : "#00dac6",
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
        <label htmlFor="category" className={labelStyle} style={inputWrapper}>
          Category
        </label>
        <Autocomplete
          autoHighlight
          options={Array.isArray(categories) ? categories : []}
          getOptionLabel={(option) => option.name || ""}
          value={
            Array.isArray(categories)
              ? categories.find((cat) => cat.id === billData.categoryId) || null
              : null
          }
          onChange={(event, newValue) => {
            setBillData((prev) => ({
              ...prev,
              categoryId: newValue ? newValue.id : "",
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search category"
              variant="outlined"
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "#29282b",
                  color: "#fff",
                  height: "56px",
                  fontSize: "16px",
                },
                "& .MuiInputBase-input": {
                  color: "#fff",
                  "&::placeholder": {
                    color: "#9ca3af",
                    opacity: 1,
                  },
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgb(75, 85, 99)",
                    borderWidth: "1px",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgb(75, 85, 99)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00dac6",
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
      {/* <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}
      <div
        className="flex flex-col relative create-bill-container"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          border: "1px solid rgb(0, 0, 0)",
          padding: "20px",
          marginRight: "20px",
          overflowY: "auto",
        }}
      >
        <div className="w-full flex justify-between items-center mb-1">
          <p className="text-white font-extrabold text-4xl">Create Bill</p>
          <button
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center justify-center w-12 h-12 text-[32px] font-bold bg-[#29282b] rounded mt-[-10px]"
            style={{ color: "#00dac6" }}
          >
            ×
          </button>
        </div>
        <hr className="border-t border-gray-600 w-full mt-[-4px] mb-0" />

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
              backgroundColor: showBudgetTable ? "#00b8a0" : "#00DAC6",
              color: "black",
              "&:hover": {
                backgroundColor: "#00b8a0",
              },
            }}
          >
            {showBudgetTable ? "Hide" : "Link"} Budgets
          </Button>

          <Button
            onClick={handleOpenExpenseTable}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: showExpenseTable ? "#00b8a0" : "#00DAC6",
              color: "black",
              "&:hover": {
                backgroundColor: "#00b8a0",
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
              <h3 className="text-white text-xl font-semibold">
                Available Budgets for Selected Date
              </h3>
              <IconButton
                onClick={handleCloseBudgetTable}
                sx={{
                  color: "#ff4444", // Changed color to red
                  "&:hover": {
                    backgroundColor: "#ff444420", // Light red hover effect
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
                <CircularProgress sx={{ color: "#00DAC6" }} />
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center text-gray-400 py-8 bg-[#29282b] rounded border border-gray-600">
                No budgets found for the selected date
              </div>
            ) : (
              <Box
                sx={{
                  height: 325,
                  width: "100%",
                  background: "#29282b",
                  borderRadius: 2,
                  border: "1px solid #444",
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
                    color: "#fff",
                    border: 0,
                    "& .MuiDataGrid-columnHeaders": { background: "#222" },
                    "& .MuiDataGrid-row": { background: "#29282b" },
                    "& .MuiCheckbox-root": { color: "#00dac6 !important" },
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
              <h3 className="text-white text-xl font-semibold">
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

            <div className="bg-[#29282b] rounded border border-gray-600 px-3 pt-3 flex-1 flex flex-col min-h-0">
              {/* Table Header - Updated */}
              <div className="grid grid-cols-6 gap-3 mb-3 pb-2 border-b border-gray-600">
                <div className="text-white font-semibold text-sm col-span-1">
                  Item Name *
                </div>
                <div className="text-white font-semibold text-sm col-span-1">
                  Quantity *
                </div>
                <div className="text-white font-semibold text-sm col-span-1">
                  Unit Price *
                </div>
                <div className="text-white font-semibold text-sm col-span-1">
                  Total Price
                </div>

                <div className="text-white font-semibold text-sm col-span-1">
                  Comments
                </div>
                <div className="text-white font-semibold text-sm col-span-1">
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
                        isIncomplete
                          ? "bg-[#2d1b1b] border border-red-500"
                          : "bg-[#1b1b1b]"
                      }`}
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
                          className={`w-full px-3 py-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 text-sm ${
                            hasItemName &&
                            (!expense.quantity ||
                              parseFloat(expense.quantity) <= 0)
                              ? "bg-[#3d2b2b] border border-red-400 focus:ring-red-400 outline-none"
                              : "bg-[#29282b] focus:ring-[#00dac6]"
                          }`}
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
                          className={`w-full px-3 py-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 text-sm ${
                            isIncomplete
                              ? "bg-[#3d2b2b] border border-red-400 focus:ring-red-400 outline-none"
                              : "bg-[#29282b] focus:ring-[#00dac6]"
                          }`}
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
                          className="w-full px-3 py-2 rounded bg-[#333] text-gray-400 cursor-not-allowed text-sm"
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
                          className="w-full px-3 py-2 rounded bg-[#29282b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] text-sm"
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
                      Total Amount: ₹
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
            <div className="bg-[#29282b] rounded border border-gray-600 p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-white font-semibold text-base">
                  Expense Items Summary
                </h4>
                <span className="text-[#00dac6] text-sm font-medium">
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
                  <p className="text-gray-400 text-xs">
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
                      scrollbarColor: "#00dac6 #1b1b1b",
                    }}
                  >
                    {/* Grid layout: 1 column on mobile, 2 on tablet, 3 on desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                      {expenses.map((expense, index) => (
                        <div
                          key={index}
                          className="bg-[#1b1b1b] rounded-lg p-2 border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 min-w-0 pr-2">
                              <h5
                                className="text-white font-medium text-xs truncate max-w-[140px]"
                                title={expense.itemName}
                              >
                                {expense.itemName}
                              </h5>
                            </div>
                            <div className="text-[#00dac6] font-semibold text-xs whitespace-nowrap">
                              ₹{expense.totalPrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Qty</span>
                              <span className="text-white font-medium">
                                {expense.quantity}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Unit</span>
                              <span className="text-white font-medium">
                                ₹{parseFloat(expense.unitPrice).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Calc</span>
                              <span className="text-gray-300">
                                {expense.quantity} × ₹
                                {parseFloat(expense.unitPrice).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {expense.comments &&
                            expense.comments.trim() !== "" && (
                              <div className="mt-1 pt-1 border-t border-gray-700">
                                <div className="text-gray-500 text-[10px] mb-0.5">
                                  Comments
                                </div>
                                <div className="text-gray-300 text-[10px] bg-[#29282b] p-1 rounded border border-gray-600 break-words max-h-16 overflow-auto">
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
                        ₹
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
              className="px-6 py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0] w-full sm:w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {billLoading ? (
                <CircularProgress size={20} color="inherit" />
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
