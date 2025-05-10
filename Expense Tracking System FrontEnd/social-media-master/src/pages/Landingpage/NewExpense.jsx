import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createExpenseAction,
  fetchPreviousExpenses,
  getExpensesSuggestions,
} from "../../Redux/Expenses/expense.action";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { getListOfBudgetsById } from "../../Redux/Budget/budget.action";

const fieldStyles =
  "px-3 py-2 rounded bg-[#29282b] text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] w-full text-base sm:max-w-[350px] max-w-[250px]";
const labelStyle = "text-white text-sm sm:text-base font-semibold mr-2";
const formRow = "mt-4 flex flex-col sm:flex-row sm:items-center gap-2 w-full";
const firstFormRow =
  "mt-2 flex flex-col sm:flex-row sm:items-center gap-2 w-full";
const inputWrapper = { width: "150px" };

const NewExpense = ({ onClose, onSuccess }) => {
  const today = new Date().toISOString().split("T")[0];
  const { topExpenses, loading: loading } = useSelector(
    (state) => state.expenses || {}
  );
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
    date: today,
    creditDue: "",
  });
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [checkboxStates, setCheckboxStates] = useState([]);

  // Fetch budgets on component mount
  useEffect(() => {
    dispatch(getListOfBudgetsById(today));
  }, [dispatch, today]);

  // Update checkbox states when budgets change
  useEffect(() => {
    setCheckboxStates(budgets.map((budget) => budget.includeInBudget || false));
  }, [budgets]);

  // Fetch expenses suggestions
  useEffect(() => {
    dispatch(getExpensesSuggestions());
  }, [dispatch]);

  const fetchSuggestions = (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);

    const filtered = topExpenses.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered);
    setLoadingSuggestions(false);
  };

  const highlightText = (text, inputValue) => {
    const regex = new RegExp(`(${inputValue})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === inputValue.toLowerCase() ? (
        <span key={index} style={{ fontWeight: 700, color: "#00b8a0" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

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
      0
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

    // Dispatch getListOfBudgetsById with the selected date
    dispatch(getListOfBudgetsById(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!expenseData.expenseName)
      newErrors.expenseName = "Expense title is required.";
    if (!expenseData.amount) newErrors.amount = "Amount is required.";
    if (!expenseData.date) newErrors.date = "Date is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const budgetIds = budgets
      .filter((budget, index) => checkboxStates[index])
      .map((budget) => budget.id);

    dispatch(
      createExpenseAction({
        date: expenseData.date,
        budgetIds: budgetIds,
        expense: {
          expenseName: expenseData.expenseName,
          amount: expenseData.amount,
          netAmount: expenseData.amount,
          paymentMethod: expenseData.paymentMethod,
          type: expenseData.transactionType,
          comments: expenseData.comments,
          creditDue: expenseData.creditDue || 0,
        },
      })
    );

    onClose();
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
      <div className="flex items-center">
        <label htmlFor={id} className={labelStyle} style={inputWrapper}>
          {id
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
        </label>
        {isTextarea ? (
          <textarea
            id={id}
            name={id}
            value={expenseData[id]}
            onChange={handleInputChange}
            placeholder={`Enter ${id}`}
            rows="3"
            className={fieldStyles}
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

  const renderSelect = (id, options) => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor={id} className={labelStyle} style={inputWrapper}>
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
        <label htmlFor="date" className={labelStyle} style={inputWrapper}>
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={expenseData.date}
          onChange={handleDateChange}
          className={fieldStyles}
        />
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
          className={labelStyle}
          style={inputWrapper}
        >
          Expense Name
        </label>
        <Autocomplete
          freeSolo
          autoHighlight
          options={suggestions}
          loading={loading}
          loadingText="Loading"
          noOptionsText="No Data Found"
          value={expenseData.expenseName}
          onInputChange={(event, newValue) => {
            setExpenseData((prev) => ({ ...prev, expenseName: newValue }));
            fetchSuggestions(newValue);
          }}
          // onFocus={() => {
          //   if (expenseData.expenseName) {
          //     fetchSuggestions(expenseData.expenseName);
          //   }
          // }}
          onChange={(event, newValue) => {
            setExpenseData((prev) => ({ ...prev, expenseName: newValue }));
          }}
          openOnFocus
          sx={{
            width: "100%",
            maxWidth: "350px",
            "& .MuiInputBase-root": {
              backgroundColor: "#29282b",
              color: "white",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#444",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00dac6",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00dac6",
            },
            "& .MuiAutocomplete-listbox": {
              backgroundColor: "#29282b",
              color: "white",
              "& .MuiAutocomplete-noOptions": {
                color: "white",
                padding: "8px 16px",
              },
            },
            "& .MuiAutocomplete-option": {
              backgroundColor: "transparent",
              color: "white",
              "&[aria-selected='true']": {
                backgroundColor: "#00dac6",
              },
              "&:hover": {
                backgroundColor: "#444",
              },
            },
            "& .MuiAutocomplete-clearIndicator": {
              color: "white",
            },
            "& .MuiAutocomplete-popupIndicator": {
              color: "white",
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Enter expense name"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingSuggestions ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option, { inputValue }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <div>{highlightText(option, inputValue)}</div>
              </li>
            );
          }}
        />
      </div>
      {errors.expenseName && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors.expenseName}
        </span>
      )}
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

  return (
    <div
      className="flex flex-col relative"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        backgroundColor: "rgb(11, 11, 11)",
        borderRadius: "8px",
        border: "1px solid rgb(0, 0, 0)",
        padding: "20px",
      }}
    >
      <div className="w-full flex justify-between items-center mb-1">
        <p className="text-white font-extrabold text-4xl">New Expense</p>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-12 h-12 text-[32px] font-bold bg-[#29282b] rounded mt-[-10px]"
          style={{ color: "#00dac6" }}
        >
          ×
        </button>
      </div>
      <hr className="border-t border-gray-600 w-full mt-[-4px]" />

      <div className={firstFormRow}>
        {renderExpenseNameWithSuggestions()}
        {renderInput("amount", "number")}
      </div>
      <div className={formRow}>
        {renderCustomDateInput()}
        {renderSelect("transactionType", ["gain", "loss"])}
      </div>
      <div className={formRow}>
        {renderSelect("paymentMethod", [
          "cash",
          "creditNeedToPaid",
          "creditPaid",
        ])}
        {renderInput("comments", "text", true)}
      </div>

      <div className="mt-2 w-full flex flex-col sm:flex-row items-center justify-between gap-2">
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
                className="px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a]"
              >
                X
              </button>
            </div>
            {budgets.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No rows found
              </div>
            ) : (
              table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="bg-[#29282b] border border-gray-600 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">
                      {row.original.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-sm">In Budget</span>
                      <input
                        type="checkbox"
                        checked={checkboxStates[row.index]}
                        onChange={() => handleCheckboxChange(row.index)}
                        className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
                      />
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>
                      <span className="font-medium">Description:</span>{" "}
                      {row.original.description}
                    </p>
                    <p>
                      <span className="font-medium">Start Date:</span>{" "}
                      {row.original.startDate}
                    </p>
                    <p>
                      <span className="font-medium">End Date:</span>{" "}
                      {row.original.endDate}
                    </p>
                    <p>
                      <span className="font-medium">Remaining Amount:</span>{" "}
                      {row.original.remainingAmount}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span>{" "}
                      {row.original.amount}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div
            className="hidden sm:block overflow-x-auto overflow-y-auto border border-gray-600 rounded"
            style={{ height: "260px" }}
          >
            <table className="w-full text-white border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-2 sm:px-4 py-2 text-left bg-[#29282b] border-b border-gray-600 sticky top-0 z-10"
                        style={{
                          width: header.column.columnDef.size,
                          minWidth: header.column.columnDef.size,
                          maxWidth: header.column.columnDef.size,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : header.column.columnDef.header}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {budgets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-2 sm:px-4 py-2 text-center text-gray-400 border-b border-gray-600"
                      style={{ height: "200px" }}
                    >
                      No rows found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-600">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-2 sm:px-4 py-2"
                          style={{
                            width: cell.column.columnDef.size,
                            minWidth: cell.column.columnDef.size,
                            maxWidth: cell.column.columnDef.size,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {cell.column.columnDef.cell
                            ? cell.column.columnDef.cell(cell)
                            : cell.getValue()}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex flex-row justify-between items-center bg-[#0b0b0b] py-2 z-20 relative gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageIndex(pageIndex - 1)}
                disabled={!table.getCanPreviousPage()}
                className={`px-3 py-1 rounded text-sm ${
                  table.getCanPreviousPage()
                    ? "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                Previous
              </button>
              <span className="text-white text-sm">
                Page{" "}
                <strong>
                  {pageIndex + 1} of {table.getPageCount()}
                </strong>
              </span>
              <button
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={!table.getCanNextPage()}
                className={`px-3 py-1 rounded text-sm ${
                  table.getCanNextPage()
                    ? "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
            <div>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="px-3 py-1 bg-[#29282b] text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#00dac6] text-sm"
              >
                {[5, 10, 20].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {budgetError && (
        <div className="text-red-500 text-sm mt-4">
          Error: {budgetError.message || "Failed to load budgets."}
        </div>
      )}

      <div className="fixed bottom-12 right-4 sm:bottom-16 sm:right-8">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0]"
          style={{ width: "120px" }}
        >
          Submit
        </button>
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
        `}
      </style>
    </div>
  );
};

export default NewExpense;
