import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ItemNameAutocomplete from "./ItemNameAutocomplete";
import ExpenseNameAutocomplete from "../../components/ExpenseNameAutocomplete";
import CategoryAutocomplete from "../../components/CategoryAutocomplete";
import PaymentMethodAutocomplete from "../../components/PaymentMethodAutocomplete";
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
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess"; // retains gating
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import { updateBill, getBillById } from "../../Redux/Bill/bill.action";
import { normalizePaymentMethod } from "../../utils/paymentMethodUtils";

const labelStyle = "text-white text-sm sm:text-base font-semibold mr-4";
const inputWrapper = {
  width: "150px",
  minWidth: "150px",
  display: "flex",
  alignItems: "center",
};

const EditBill = ({ onClose, onSuccess, billId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id, friendId } = useParams();
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
      if (!currentBillId) {
        setLoadError("No bill ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);

        const billResponse = await dispatch(
          getBillById(currentBillId, friendId || "")
        );
        let bill = billResponse?.payload || billResponse?.data || billResponse;

        if (!bill || !bill.id) {
          throw new Error("Bill data is missing or invalid");
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
        setLoadError(error.message || "Failed to load bill data");
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false); // Mark initial load as complete
      }
    };

    loadBillData();
  }, [currentBillId, dispatch, id]);

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
          selectedBudgets.includes(budget.id) || budget.includeInBudget || false
      );
      setCheckboxStates((prev) =>
        JSON.stringify(prev) !== JSON.stringify(newCheckboxStates)
          ? newCheckboxStates
          : prev
      );
    }
  }, [budgets, selectedBudgets]);

  useEffect(() => {
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + (expense.totalPrice || 0),
      0
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
      alert("Please add at least one complete expense item before saving.");
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
        "You have unsaved expense items. Are you sure you want to close without saving?"
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
        !expense.quantity.toString().includes("-")
    );

    if (validExpenses.length === 0) {
      newErrors.expenses = true;
      alert("At least one expense item should be added to update the bill.");
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
          expense.quantity.toString().includes("-"))
    );

    if (invalidExpenses.length > 0) {
      newErrors.expenses = true;
      alert(
        "Please enter valid positive values for both quantity and unit price."
      );
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const totalAmount = expenses.reduce(
        (sum, expense) => sum + (expense.totalPrice || 0),
        0
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
        updateBill(currentBillId, updatedBillData, friendId || "")
      );
      if (result) {
        alert("Bill updated successfully!");
        if (onSuccess) {
          onSuccess(result);
        }
        if (onClose) {
          onClose();
        } else {
          navigate(-1);
        }
      }
    } catch (error) {
      console.error("Error updating bill:", error);
      alert(`Error updating bill: ${error.message}`);
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
      sx={{ bgcolor: "#29282b", borderRadius: 1 }}
    />
  );

  const ExpenseItemSkeleton = () => (
    <div className="bg-[#1b1b1b] rounded-lg p-2 border border-gray-700 animate-pulse">
      <div className="flex justify-between mb-2">
        <Skeleton
          variant="text"
          width={90}
          height={16}
          sx={{ bgcolor: "#333" }}
        />
        <Skeleton
          variant="text"
          width={50}
          height={16}
          sx={{ bgcolor: "#333" }}
        />
      </div>
      <Skeleton
        variant="text"
        width={120}
        height={12}
        sx={{ bgcolor: "#2d2d2d" }}
      />
      <Skeleton
        variant="text"
        width={100}
        height={12}
        sx={{ bgcolor: "#2d2d2d" }}
      />
      <Skeleton
        variant="text"
        width={80}
        height={12}
        sx={{ bgcolor: "#2d2d2d" }}
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
            backgroundColor: "rgb(11, 11, 11)",
            borderRadius: "8px",
            border: "1px solid rgb(0, 0, 0)",
            padding: "20px",
          }}
        >
          <div className="text-red-400 text-xl mb-4">⚠️ Error Loading Bill</div>
          <p className="text-gray-400 text-center mb-6">{loadError}</p>
          <div className="flex gap-4">
            <Button
              onClick={() => window.location.reload()}
              sx={{
                backgroundColor: "#00DAC6",
                color: "black",
                "&:hover": { backgroundColor: "#00b8a0" },
              }}
            >
              Retry
            </Button>
            <Button
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  navigate(-1);
                }
              }}
              sx={{
                backgroundColor: "#ff4444",
                color: "white",
                "&:hover": { backgroundColor: "#ff6666" },
              }}
            >
              Go Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  const renderNameInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor="name" className={labelStyle} style={inputWrapper}>
          Name<span className="text-red-500"> *</span>
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
            placeholder="Enter name"
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
              "&::placeholder": { color: "#9ca3af", opacity: 1 },
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgb(75, 85, 99)",
                borderWidth: "1px",
              },
              "&:hover fieldset": { borderColor: "rgb(75, 85, 99)" },
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
                  "& input": { height: 32, fontSize: 16 },
                },
                inputProps: { max: dayjs().format("YYYY-MM-DD") },
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
        <label htmlFor="type" className={labelStyle} style={inputWrapper}>
          Type<span className="text-red-500"> *</span>
        </label>
        <Autocomplete
          autoHighlight
          options={["gain", "loss"]}
          getOptionLabel={(option) =>
            option.charAt(0).toUpperCase() + option.slice(1)
          }
          value={billData.type || ""}
          onChange={handleTypeChange}
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
                  "&::placeholder": { color: "#9ca3af", opacity: 1 },
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
          sx={{ width: "100%", maxWidth: "300px" }}
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
      newSelection.includes(row.id)
    );
    setCheckboxStates(newCheckboxStates);
  };

  return (
    <>
      {/* <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}
      <div
        className="flex flex-col relative edit-bill-container"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          marginRight: "20px",
          border: "1px solid rgb(0, 0, 0)",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <div className="w-full flex justify-between items-center mb-1">
          <p className="text-white font-extrabold text-4xl">Edit Bill</p>
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
        <hr
          className="border-t border-gray-600 w-full mt-[-4px] mb-0"
          style={{ marginBottom: 0 }}
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
              backgroundColor: showBudgetTable ? "#00b8a0" : "#00DAC6",
              color: "black",
              "&:hover": { backgroundColor: "#00b8a0" },
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
              "&:hover": { backgroundColor: "#00b8a0" },
            }}
          >
            {showExpenseTable ? "Hide" : "Edit"} Expense Items
          </Button>
        </div>

        {showBudgetTable && !showExpenseTable && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-semibold">
                Available Budgets for Selected Date
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
                    pagination: { paginationModel: { page: 0, pageSize: 5 } },
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

        {showExpenseTable && !showBudgetTable && (
          <div className="mt-6 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-semibold">
                Edit Expense Items
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

            <div className="bg-[#29282b] rounded border border-gray-600 px-3 pt-3 flex-1 flex flex-col min-h-0">
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
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Qty *"
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
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Unit Price *"
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
                                value
                              );
                            }
                          }}
                          onKeyDown={(e) => {
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
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={expense.totalPrice.toFixed(2)}
                          readOnly
                          className="w-full px-3 py-2 rounded bg-[#333] text-gray-400 cursor-not-allowed text-sm"
                        />
                      </div>
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
                        Complete the current item to add more rows
                      </div>
                    )}
                  </div>
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
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveExpenses}
                      sx={{
                        backgroundColor: "#00DAC6",
                        color: "black",
                        "&:hover": { backgroundColor: "#00b8a0" },
                        fontSize: "0.875rem",
                        padding: "6px 12px",
                      }}
                      size="small"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    At least one expense item is required to update the bill
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className="max-h-80 overflow-y-auto pr-2"
                    style={{
                      maxHeight: "285px",
                      scrollbarWidth: "thin",
                      scrollbarColor: "#00dac6 #1b1b1b",
                    }}
                  >
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
                "Update"
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
