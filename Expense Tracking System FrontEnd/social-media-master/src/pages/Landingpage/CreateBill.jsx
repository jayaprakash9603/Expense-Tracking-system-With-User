import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { fetchCategories } from "../../Redux/Category/categoryActions";
import { createBill } from "../../Redux/Bill/bill.action";

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

  const {
    budgets,
    error: budgetError,
    loading: budgetLoading,
  } = useSelector((state) => state.budgets || {});
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categories || {});

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

  // Payment method options
  const paymentMethods = ["cash", "debit", "credit"];

  // Type options
  const typeOptions = ["gain", "loss"];

  // Fetch budgets on component mount
  useEffect(() => {
    dispatch(getListOfBudgetsById(today, friendId || ""));
  }, [dispatch, today]);

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
    updatedExpenses[index][field] = value;

    // Calculate total price when quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      const quantity = parseFloat(updatedExpenses[index].quantity) || 0;
      const unitPrice = parseFloat(updatedExpenses[index].unitPrice) || 0;
      updatedExpenses[index].totalPrice = quantity * unitPrice;
    }

    setTempExpenses(updatedExpenses);
  };

  const addTempExpenseRow = () => {
    setTempExpenses([
      ...tempExpenses,
      { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0 },
    ]);
  };

  const removeTempExpenseRow = (index) => {
    if (tempExpenses.length > 1) {
      const updatedExpenses = tempExpenses.filter((_, i) => i !== index);
      setTempExpenses(updatedExpenses);
    }
  };

  const handleSaveExpenses = () => {
    // Filter out empty expense items and save to main expenses state
    const validExpenses = tempExpenses.filter(
      (expense) => expense.itemName.trim() !== ""
    );
    setExpenses(validExpenses);
    setShowExpenseTable(false);
  };

  const handleOpenExpenseTable = () => {
    // Load existing expenses into temp state
    if (expenses.length > 0) {
      setTempExpenses([...expenses]);
    } else {
      setTempExpenses([
        { itemName: "", quantity: 1, unitPrice: "", totalPrice: 0 },
      ]);
    }
    setShowExpenseTable(true);
    setShowBudgetTable(false); // Hide budget table when expense table opens
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

    if (!billData.name) newErrors.name = true;
    if (!billData.date) newErrors.date = true;
    if (!billData.type) newErrors.type = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const budgetIds = selectedBudgets.map((budget) => budget.id);

    const formattedExpenses = tempExpenses.map((expense) => ({
      itemName: expense.itemName,
      quantity: expense.quantity,
      unitPrice: expense.unitPrice,
      totalPrice: expense.totalPrice,
      comments: expense.comments || "", // Include comments field
    }));

    const billPayload = {
      ...billData,
      expenses: formattedExpenses,
    };

    try {
      await dispatch(createBill(billPayload, friendId || ""));
      console.log("Bill Data to Submit:", billPayload);

      if (typeof onClose === "function") {
        onClose();
      } else {
        navigate(-1, {
          state: { toastMessage: "Bill created successfully!" },
        });
      }
      if (onSuccess) {
        onSuccess("Bill created successfully!");
      }
    } catch (error) {
      console.error("Error creating bill:", error);
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
        <TextField
          id="name"
          name="name"
          value={billData.name}
          onChange={handleInputChange}
          placeholder="Enter name"
          variant="outlined"
          error={errors.name}
          sx={{
            width: "100%",
            maxWidth: "300px",
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
                borderColor: errors.name ? "#ff4d4f" : "rgb(75, 85, 99)",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: errors.name ? "#ff4d4f" : "rgb(75, 85, 99)",
              },
              "&.Mui-focused fieldset": {
                borderColor: errors.name ? "#ff4d4f" : "#00dac6",
                borderWidth: "2px",
              },
            },
          }}
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
          options={paymentMethods}
          getOptionLabel={(option) =>
            option.charAt(0).toUpperCase() + option.slice(1)
          }
          value={billData.paymentMethod || ""}
          onChange={(event, newValue) => {
            setBillData((prev) => ({
              ...prev,
              paymentMethod: newValue || "cash",
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select payment method"
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
          onChange={(event, newValue) => {
            setBillData((prev) => ({ ...prev, type: newValue || "loss" }));
            if (errors.type) {
              setErrors({ ...errors, type: false });
            }
          }}
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

  return (
    <>
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
      <div
        className="flex flex-col relative create-bill-container"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          border: "1px solid rgb(0, 0, 0)",
          padding: "20px",
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
        <hr className="border-t border-gray-600 w-full mt-[-4px]" />

        <div className="flex flex-col gap-4 mt-4">
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
                  checkboxSelection
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
                onClick={handleCloseExpenseTable}
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

            <div className="bg-[#29282b] rounded border border-gray-600 px-3 pt-3 flex-1 flex flex-col min-h-0">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-3 mb-3 pb-2 border-b border-gray-600">
                <div className="text-white font-semibold text-sm col-span-1">
                  Item Name
                </div>
                <div className="text-white font-semibold text-sm col-span-1">
                  Quantity
                </div>
                <div className="text-white font-semibold text-sm col-span-1">
                  Unit Price
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
                {tempExpenses.map((expense, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-6 gap-3 items-center bg-[#1b1b1b] p-3 rounded"
                  >
                    <div className="col-span-1">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={expense.itemName}
                        onChange={(e) =>
                          handleTempExpenseChange(
                            index,
                            "itemName",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded bg-[#29282b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={expense.quantity}
                        onChange={(e) =>
                          handleTempExpenseChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded bg-[#29282b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] text-sm"
                        min="1"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        placeholder="Unit Price"
                        value={expense.unitPrice}
                        onChange={(e) =>
                          handleTempExpenseChange(
                            index,
                            "unitPrice",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded bg-[#29282b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] text-sm"
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
                          color: tempExpenses.length === 1 ? "#666" : "#ff4444",
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
                ))}
              </div>

              {/* Add Row Button and Actions - Fixed at bottom */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex justify-between items-center mb-4">
                  <Button
                    onClick={addTempExpenseRow}
                    startIcon={<AddIcon />}
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
                    Add Row
                  </Button>

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
                      onClick={handleCloseExpenseTable}
                      sx={{
                        backgroundColor: "#ff4444", // Changed color to red
                        color: "white",
                        fontSize: "0.875rem",
                        padding: "6px 12px",
                        "&:hover": {
                          backgroundColor: "#ff6666", // Light red hover effect
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
            width: 4px; // Decreased scrollbar width
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
            height: 4px; // Decreased scrollbar height
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
            .submit-button {
              width: 100% !important;
              margin-top: 16px !important;
            }
            .budget-table {
              font-size: 0.75rem !important;
            }
            .budget-table .MuiDataGrid-root {
              min-height: 200px !important;
            }
          }
        `}
        </style>
      </div>
    </>
  );
};

export default CreateBill;
