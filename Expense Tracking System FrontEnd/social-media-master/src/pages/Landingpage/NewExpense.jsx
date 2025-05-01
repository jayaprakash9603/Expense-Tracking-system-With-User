import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createExpenseAction,
  fetchPreviousExpenses,
  getExpensesSuggestions,
} from "../../Redux/Expenses/expense.action";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import axios from "axios";

const fieldStyles =
  "px-6 py-3 rounded bg-[#29282b] text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] w-[400px]";
const labelStyle = "text-white text-lg font-semibold mr-6";
const formRow = "mt-6 w-full flex flex-col items-start";
const inputWrapper = { width: "180px" };

const NewExpense = ({ onClose, onSuccess }) => {
  const today = new Date().toISOString().split("T")[0];
  const { topExpenses, loading } = useSelector((state) => state.expenses || {});
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

  // useEffect(() => {
  //   dispatch(getExpensesSuggestions());
  // }, []);
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

    dispatch(
      createExpenseAction({
        date: expenseData.date,
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

  const renderInput = (id, type = "text", isTextarea = false) => (
    <div className={formRow}>
      <div className="flex items-center w-full">
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
            rows="5"
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
        <span className="text-red-500 text-sm ml-[210px]">{errors[id]}</span>
      )}
    </div>
  );

  const renderSelect = (id, options) => (
    <div className="mt-6 w-full flex items-center">
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
  );

  const renderCustomDateInput = () => (
    <div className={formRow}>
      <div className="flex items-center w-full">
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
        <span className="text-red-500 text-sm ml-[210px]">{errors.date}</span>
      )}
    </div>
  );

  const renderExpenseNameWithSuggestions = () => (
    <div className={formRow}>
      <div className="flex items-center w-full">
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
          loading={loadingSuggestions}
          value={expenseData.expenseName}
          onInputChange={(event, newValue) => {
            setExpenseData((prev) => ({ ...prev, expenseName: newValue }));
            fetchSuggestions(newValue);
          }}
          onFocus={() => {
            if (expenseData.expenseName) {
              fetchSuggestions(expenseData.expenseName);
            }
          }}
          onChange={(event, newValue) => {
            setExpenseData((prev) => ({ ...prev, expenseName: newValue }));
          }}
          openOnFocus
          sx={{
            width: "400px",
            // Styling the input box
            "& .MuiInputBase-root": {
              backgroundColor: "#29282b",
              color: "white",
            },
            // Outline styling for the input field
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#444",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00dac6",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00dac6",
            },
            // Styling the dropdown listbox
            "& .MuiAutocomplete-listbox": {
              backgroundColor: "#29282b",
              color: "white",
            },
            // Styling individual options in the dropdown
            "& .MuiAutocomplete-option": {
              backgroundColor: "transparent", // Default background for options
              color: "white", // Ensuring the text is white
              "&[aria-selected='true']": {
                backgroundColor: "#00dac6", // Highlight selected option
              },
              "&:hover": {
                backgroundColor: "#444", // Hover effect for options
              },
            },
            // Clear and popup indicators
            "& .MuiAutocomplete-clearIndicator": {
              color: "white", // Clear icon color
            },
            "& .MuiAutocomplete-popupIndicator": {
              color: "white", // Popup indicator color
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
        <span className="text-red-500 text-sm ml-[210px]">
          {errors.expenseName}
        </span>
      )}
    </div>
  );

  return (
    <div
      className="flex flex-col items-center"
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

      {renderExpenseNameWithSuggestions()}
      {renderInput("amount", "number")}
      {renderCustomDateInput()}
      {renderSelect("transactionType", ["gain", "loss"])}
      {renderSelect("paymentMethod", [
        "cash",
        "creditNeedToPaid",
        "creditPaid",
      ])}
      {renderInput("comments", "text", true)}

      <div className="w-full flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0]"
          style={{ width: "150px" }}
        >
          Submit
        </button>
      </div>

      <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: url('https://cdn-icons-png.flaticon.com/128/8350/8350450.png') no-repeat;
            background-size: 20px;
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
        `}
      </style>
    </div>
  );
};

export default NewExpense;
