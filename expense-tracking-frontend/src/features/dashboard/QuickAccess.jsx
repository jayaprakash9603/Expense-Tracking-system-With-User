import React from "react";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"; // Expense
import RequestQuoteIcon from "@mui/icons-material/RequestQuote"; // Bill
import CloudUploadIcon from "@mui/icons-material/CloudUpload"; // Upload
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"; // Budget
import CategoryIcon from "@mui/icons-material/Category"; // Category
import PaymentIcon from "@mui/icons-material/Payment"; // Payment Method
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useTheme as useMuiTheme, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import {
  getExpensesAction,
  getExpensesSuggestions,
  getHomeExpensesAction,
} from "../../Redux/Expenses/expense.action";
import "./QuickAccess.css";

const QuickAccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const muiTheme = useMuiTheme();
  const { colors } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

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
    <div
      className={`quick-access ${isMobile ? "mobile" : "desktop"}`}
      style={{
        backgroundColor: colors.secondary_bg,
        border: `1px solid ${colors.border_color}`,
      }}
    >
      <div className="qa-header">
        <p className="qa-title" style={{ color: colors.primary_text }}>
          Quick Access
        </p>
        <hr
          className="qa-divider"
          style={{ borderColor: colors.border_color }}
        />
      </div>

      <div className="qa-grid">
        <button
          className="qa-box"
          onClick={() => handleClick("/expenses/create")}
          style={{
            backgroundColor: colors.tertiary_bg,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <div
            className="qa-icon qa-icon-expense"
            style={{ backgroundColor: colors.primary_accent }}
          >
            <ReceiptLongIcon
              className="qa-svg"
              style={{ color: colors.button_text }}
            />
          </div>
          <div className="qa-text" style={{ color: colors.primary_text }}>
            + New Expense
          </div>
        </button>

        <button
          className="qa-box"
          onClick={() => handleClick("/bill/create")}
          style={{
            backgroundColor: colors.tertiary_bg,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <div
            className="qa-icon qa-icon-bill"
            style={{ backgroundColor: colors.primary_accent }}
          >
            <RequestQuoteIcon
              className="qa-svg"
              style={{ color: colors.button_text }}
            />
          </div>
          <div className="qa-text" style={{ color: colors.primary_text }}>
            + New Bill
          </div>
        </button>

        <button
          className="qa-box"
          onClick={() => {
            handleClick("/upload/expenses");
            handleUploadFileClick();
          }}
          style={{
            backgroundColor: colors.tertiary_bg,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <div
            className="qa-icon qa-icon-upload"
            style={{ backgroundColor: colors.primary_accent }}
          >
            <CloudUploadIcon
              className="qa-svg"
              style={{ color: colors.button_text }}
            />
          </div>
          <div className="qa-text" style={{ color: colors.primary_text }}>
            + Upload File
          </div>
        </button>

        <button
          className="qa-box"
          onClick={() => handleClick("/budget/create")}
          style={{
            backgroundColor: colors.tertiary_bg,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <div
            className="qa-icon qa-icon-budget"
            style={{ backgroundColor: colors.primary_accent }}
          >
            <AccountBalanceWalletIcon
              className="qa-svg"
              style={{ color: colors.button_text }}
            />
          </div>
          <div className="qa-text" style={{ color: colors.primary_text }}>
            + New Budget
          </div>
        </button>

        <button
          className="qa-box"
          onClick={() => handleClick("/category-flow/create")}
          style={{
            backgroundColor: colors.tertiary_bg,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <div
            className="qa-icon qa-icon-category"
            style={{ backgroundColor: colors.primary_accent }}
          >
            <CategoryIcon
              className="qa-svg"
              style={{ color: colors.button_text }}
            />
          </div>
          <div className="qa-text" style={{ color: colors.primary_text }}>
            + New Category
          </div>
        </button>

        <button
          className="qa-box"
          onClick={() => handleClick("/payment-method/create")}
          style={{
            backgroundColor: colors.tertiary_bg,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <div
            className="qa-icon qa-icon-payment"
            style={{ backgroundColor: colors.primary_accent }}
          >
            <PaymentIcon
              className="qa-svg"
              style={{ color: colors.button_text }}
            />
          </div>
          <div className="qa-text" style={{ color: colors.primary_text }}>
            + New Payment
          </div>
        </button>
      </div>
    </div>
  );
};

export default QuickAccess;
