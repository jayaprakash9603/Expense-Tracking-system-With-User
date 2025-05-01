import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom"; // Import useNavigate hook
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import {
  createExpenseAction,
  editExpenseAction,
  fetchPreviousExpenses,
  getExpenseAction,
} from "../../Redux/Expenses/expense.action";

const fieldStyles =
  "px-6 py-3 rounded bg-[#29282b] text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] w-[400px]";
const labelStyle = "text-white text-lg font-semibold mr-6";
const formRow = "mt-6 w-full flex flex-col items-start";
const inputWrapper = { width: "180px" };

const EditExpense = ({}) => {
  const navigate = useNavigate(); // Initialize the navigate hook
  const today = new Date().toISOString().split("T")[0];
  const { id } = useParams();
  const { expense } = useSelector((state) => state.expenses);

  const [expenseData, setExpenseData] = useState({
    expenseName: "",
    amount: "",
    netAmount: "",
    paymentMethod: "cash",
    transactionType: "loss",
    comments: "",
    date: today, // Default date set to today's date
    creditDue: "",
  });

  useEffect(() => {
    if (expense) {
      setExpenseData({
        expenseName: expense.expense.expenseName || "",
        amount: expense.expense.amount || "",
        netAmount: expense.expense.netAmount || "",
        paymentMethod: expense.expense.paymentMethod || "cash",
        transactionType: expense.expense.type || "loss",
        comments: expense.comments || "",
        date: expense.date || today,
        creditDue: expense.expense.creditDue || "",
      });
    }
  }, [expense]);

  const [errors, setErrors] = useState({});
  const [openToast, setOpenToast] = useState(false); // Toast visibility
  const [toastMessage, setToastMessage] = useState(""); // Toast message
  const dispatch = useDispatch();

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
      editExpenseAction(id, {
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
    )
      .then(() => {
        // Show toast and navigate
        setToastMessage("Expense updated successfully!");
        setOpenToast(true);
        navigate("/", {
          state: { successMessage: "Expense updated successfully!" },
        });
      })
      .catch((err) => {
        setToastMessage("Something went wrong!"); // In case of error
        setOpenToast(true);
      });
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
      <div className="flex justify-between w-full">
        {errors.date && (
          <span className="text-red-500 text-sm">{errors.date}</span>
        )}
      </div>
    </div>
  );

  const handleOnClose = () => {
    navigate("/");
  };

  return (
    <>
      <div className="bg-[#1b1b1b]">
        <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
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
            <p className="text-white font-extrabold text-4xl">Edit Expense</p>
            <button
              onClick={handleOnClose} // Use the handleOnClose function
              className="flex items-center justify-center w-12 h-12 text-[32px] font-bold bg-[#29282b] rounded mt-[-10px]"
              style={{ color: "#00dac6" }}
            >
              ×
            </button>
          </div>
          <hr className="border-t border-gray-600 w-full mt-[-4px]" />

          {renderInput("expenseName")}
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
        </div>
        <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
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
      {/* Snackbar for success message */}
      <Snackbar
        open={openToast}
        autoHideDuration={3000}
        onClose={() => setOpenToast(false)}
      >
        <MuiAlert
          onClose={() => setOpenToast(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default EditExpense;
