import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NewExpense from "./NewExpense";
import { Snackbar, Alert } from "@mui/material";
import ExpensesView from "./ExpensesView";

const ExpensesContent = () => {
  const location = useLocation();
  const [showExpenseForm, setShowExpenseForm] = useState(true);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSuccess = (message) => {
    setMessage(message); // Set the message to be shown
    setOpen(true); // Open the Snackbar
  };

  const handleCloseSnackbar = () => {
    setOpen(false); // Close the Snackbar
  };

  useEffect(() => {
    if (location.state?.fromMenu) {
      setShowExpenseForm(false);
    } else {
      setShowExpenseForm(true);
    }
  }, [location.state]);

  const handleClose = () => {
    setShowExpenseForm(false);
  };

  return (
    <div className="bg-[#1b1b1b]">
      {/* <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}

      <Snackbar
        open={open}
        autoHideDuration={3000} // Hide after 3 seconds
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
      <div className="w-full text-white">
        {showExpenseForm ? (
          <div>
            <NewExpense onClose={handleClose} onSuccess={handleSuccess} />
            {console.log("expense details", message)}
          </div>
        ) : (
          <ExpensesView onNewExpenseClick={() => setShowExpenseForm(true)} />
        )}
      </div>

      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
    </div>
  );
};

export default ExpensesContent;
