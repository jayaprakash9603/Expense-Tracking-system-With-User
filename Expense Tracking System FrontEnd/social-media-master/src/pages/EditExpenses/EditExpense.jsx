import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  editExpenseAction,
  fetchPreviousExpenses,
  getExpenseAction,
  getExpensesAction,
} from "../../Redux/Expenses/expense.action";
import { getSuggestions } from "../../components/Suggestions/fetchSuggestions";
import {
  convertToNewFormat,
  convertToOldFormat,
} from "../../components/conversions/formatUtils";
import ToastNotification from "../Landingpage/ToastNotification";

function EditExpense() {
  const dispatch = useDispatch();
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isInputClicked, setIsInputClicked] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const suggestionsContainerRef = useRef(null);
  const [newFormatData, setNewFormatData] = useState({});
  const token = localStorage.getItem("jwt");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const fetchSuggestions = () => {
    getSuggestions(token, setSuggestions);
  };

  const [expenses, setExpenses] = useState({
    expenseName: "",
    amount: "",
    date: "",
    type: "gain",
    paymentMethod: "cash",
    comments: "",
    creditDue: 0,
  });

  useEffect(() => {
    if (id) {
      const fetchedData = dispatch(getExpenseAction(id));
      //  console.log("get expense data",fetchedData)
    }
  }, [dispatch, id]);
  const { expense } = useSelector((state) => state.expenses);

  useEffect(() => {
    if (expense) {
      // Convert to new format
      const fetchedData = [expense]; // Wrapping data in an array

      const convertedData = convertToNewFormat(fetchedData);

      setNewFormatData(convertedData);

      // Set state with the fetched expense
      setExpenses({
        expenseName: expense.expense.expenseName || "",
        amount: expense.expense.amount || "",
        date: expense.date || "",
        type: expense.expense.type || "gain",
        paymentMethod: expense.expense.paymentMethod || "cash",
        comments: expense.expense.comments || "",
        creditDue: expense.creditDue || 0,
      });
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine netAmount based on type
    const netAmount =
      expenses.type === "loss" ? -expenses.amount : expenses.amount;

    let creditDue = 0;
    if (expenses.paymentMethod === "creditNeedToPaid") {
      creditDue = parseFloat(expenses.amount);
    } else if (expenses.paymentMethod === "creditPaid") {
      creditDue = -parseFloat(expenses.amount);
    }

    // Convert the updated state to old format
    const updatedData = [
      {
        id: id,
        date: expenses.date,
        expense: {
          expenseName: expenses.expenseName,
          amount: expenses.amount,
          type: expenses.type,
          paymentMethod: expenses.paymentMethod,
          netAmount: netAmount,
          comments: expenses.comments,
          creditDue: creditDue,
        },
      },
    ];

    console.log(
      "convert",
      convertToOldFormat(convertToNewFormat(updatedData))[0],
    );
    const result = await dispatch(
      editExpenseAction(
        id,
        convertToOldFormat(convertToNewFormat(updatedData))[0],
      ),
    );

    if (result?.success) {
      setToast({
        open: true,
        message: "Expense updated successfully!",
        severity: "success",
      });
      dispatch(fetchPreviousExpenses(expenses.expenseName, expenses.date));
      setTimeout(() => navigate("/"), 1500);
    } else {
      setToast({
        open: true,
        message: result?.message || "Failed to update expense",
        severity: "error",
      });
    }
  };

  // Update state and filter suggestions on change
  const handleChange = (e) => {
    const value = e.target.value;
    setExpenses((prevExpenses) => ({
      ...prevExpenses,
      expenseName: value,
    }));

    if (value.length > 0) {
      const filtered = suggestions.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }

    setSelectedIndex(-1); // Reset the selection index
  };

  const handleClick = () => {
    setIsInputClicked(true);
    if (expenses.expenseName.length > 0) {
      const nearestMatch = suggestions.find((item) =>
        item.toLowerCase().includes(expenses.expenseName.toLowerCase()),
      );
      setFilteredSuggestions(nearestMatch ? [nearestMatch] : []);
    }
  };

  const handleBlur = () => {
    setIsInputClicked(false);
    setFilteredSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission on Enter
      const selectedSuggestion =
        selectedIndex >= 0
          ? filteredSuggestions[selectedIndex]
          : filteredSuggestions[0]; // Default to the first item if none is selected

      if (selectedSuggestion) {
        setExpenses((prevExpenses) => ({
          ...prevExpenses,
          expenseName: selectedSuggestion, // Update the input with the selected suggestion
        }));
        setFilteredSuggestions([]); // Clear suggestions after selecting
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) =>
        Math.min(filteredSuggestions.length - 1, prevIndex + 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => Math.max(0, prevIndex - 1));
    }
  };

  useEffect(() => {
    if (suggestionsContainerRef.current) {
      const selectedItem =
        suggestionsContainerRef.current.children[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedIndex, filteredSuggestions]);

  useEffect(() => {
    fetchSuggestions();
  }, []);
  const handleKeyDown1 = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission on Enter
    }
  };
  return (
    <div className="d-flex w-100 vh-100 justify-content-center align-items-center bg-light">
      <div className="w-50 border bg-white shadow px-5 pt-3 pb-5 rounded">
        <h1>Edit an Expense</h1>
        <form onKeyDown={handleKeyDown1} onSubmit={handleSubmit}>
          <div className="mb-2">
            <label htmlFor="expenseName">Expense Name:</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                id="expenseName"
                className="form-control"
                value={expenses.expenseName}
                onChange={handleChange}
                onClick={handleClick}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                placeholder="Search expense name..."
                style={{
                  width: "100%",
                  marginTop: "5px",
                  fontFamily: "Arial, sans-serif",
                  zIndex: 1,
                }}
              />
              {isInputClicked && filteredSuggestions.length > 0 && (
                <div
                  ref={suggestionsContainerRef}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    border: "1px solid white",
                    borderTop: "none",
                    backgroundColor: "white",
                    zIndex: 10,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    maxHeight: "200px",
                    overflowY: "auto",
                    borderRadius: "0 0 5px 5px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#A7C4C2 transparent",
                  }}
                >
                  {filteredSuggestions.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#333",
                        backgroundColor:
                          selectedIndex === index ? "#79E0EE" : "transparent",
                        transition: "background-color 0.3s ease",
                      }}
                      onMouseDown={() => setExpenses(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mb-2">
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              id="amount"
              className="form-control"
              placeholder="Enter Amount"
              value={expenses.amount}
              onChange={(e) =>
                setExpenses({ ...expenses, amount: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              className="form-control"
              value={expenses.date}
              onChange={(e) =>
                setExpenses({ ...expenses, date: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="type">Transaction Type:</label>
            <select
              id="type"
              className="form-select"
              value={expenses.type}
              onChange={(e) =>
                setExpenses({ ...expenses, type: e.target.value })
              }
            >
              <option value="gain">Gain</option>
              <option value="loss">Loss</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="paymentMethod">Payment Method:</label>
            <select
              id="paymentMethod"
              className="form-select"
              value={expenses.paymentMethod}
              onChange={(e) =>
                setExpenses({ ...expenses, paymentMethod: e.target.value })
              }
            >
              <option value="cash">Cash</option>
              <option value="creditNeedToPaid">Credit Card Due</option>
              <option value="creditPaid">Credit Card Paid</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="comments">Comments:</label>
            <textarea
              id="comments"
              className="form-control"
              placeholder="Enter any comments"
              value={expenses.comments}
              onChange={(e) =>
                setExpenses({ ...expenses, comments: e.target.value })
              }
            ></textarea>
          </div>
          <div className="d-flex justify-content-between mb-3">
            <button className="btn btn-success" type="submit">
              Update
            </button>
            <Link to="/" className="btn btn-primary ms-3">
              Back
            </Link>
          </div>
        </form>
      </div>
      <ToastNotification
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}

export default EditExpense;
