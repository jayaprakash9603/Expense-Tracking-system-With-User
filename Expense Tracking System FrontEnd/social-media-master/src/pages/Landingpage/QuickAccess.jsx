import React from "react";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"; // Expense
import RequestQuoteIcon from "@mui/icons-material/RequestQuote"; // Bill
import CloudUploadIcon from "@mui/icons-material/CloudUpload"; // Upload
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"; // Budget
import CategoryIcon from "@mui/icons-material/Category"; // Category
import PaymentIcon from "@mui/icons-material/Payment"; // Payment Method
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  getExpensesAction,
  getExpensesSuggestions,
  getHomeExpensesAction,
} from "../../Redux/Expenses/expense.action";
import "./QuickAccess.css";

const QuickAccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClick = (route) => {
    if (route === "/expenses") {
      dispatch(getExpensesSuggestions());
    }
    if (route === "/budget/create") {
      navigate("/budget/create");
    }
    navigate(route);
  };

  const handleUploadFileClick = () => {
    dispatch(getHomeExpensesAction());
  };

  return (
    <div className={`quick-access ${isMobile ? "mobile" : "desktop"}`}>
      <div className="qa-header">
        <p className="qa-title">Quick Access</p>
        <hr className="qa-divider" />
      </div>

      <div className="qa-grid">
        <button
          className="qa-box"
          onClick={() => handleClick("/expenses/create")}
        >
          <div className="qa-icon qa-icon-expense">
            <ReceiptLongIcon className="qa-svg" />
          </div>
          <div className="qa-text">+ New Expense</div>
        </button>

        <button className="qa-box" onClick={() => handleClick("/bill/create")}>
          <div className="qa-icon qa-icon-bill">
            <RequestQuoteIcon className="qa-svg" />
          </div>
          <div className="qa-text">+ New Bill</div>
        </button>

        <button
          className="qa-box"
          onClick={() => {
            handleClick("/upload");
            handleUploadFileClick();
          }}
        >
          <div className="qa-icon qa-icon-upload">
            <CloudUploadIcon className="qa-svg" />
          </div>
          <div className="qa-text">+ Upload File</div>
        </button>

        <button
          className="qa-box"
          onClick={() => handleClick("/budget/create")}
        >
          <div className="qa-icon qa-icon-budget">
            <AccountBalanceWalletIcon className="qa-svg" />
          </div>
          <div className="qa-text">+ New Budget</div>
        </button>

        <button
          className="qa-box"
          onClick={() => handleClick("/category/create")}
        >
          <div className="qa-icon qa-icon-category">
            <CategoryIcon className="qa-svg" />
          </div>
          <div className="qa-text">+ New Category</div>
        </button>

        <button
          className="qa-box"
          onClick={() => handleClick("/payment-method/create")}
        >
          <div className="qa-icon qa-icon-payment">
            <PaymentIcon className="qa-svg" />
          </div>
          <div className="qa-text">+ New Payment</div>
        </button>
      </div>
    </div>
  );
};

export default QuickAccess;
