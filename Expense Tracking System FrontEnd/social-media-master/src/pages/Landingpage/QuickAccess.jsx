import React from "react";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"; // Expense
import RequestQuoteIcon from "@mui/icons-material/RequestQuote"; // Bill
import CloudUploadIcon from "@mui/icons-material/CloudUpload"; // Upload
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"; // Budget
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  getExpensesAction,
  getExpensesSuggestions,
  getHomeExpensesAction,
} from "../../Redux/Expenses/expense.action";

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

  const containerStyle = {
    marginTop: "30px",
    width: isMobile ? "90vw" : "1460px",
    height: isMobile ? "auto" : "170px",
    borderRadius: "8px",
    backgroundColor: "rgb(27, 27, 27)",
    boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
    border: "1px solid rgb(56, 56, 56)",
    opacity: 1,
    padding: "16px",
    boxSizing: "border-box",
  };

  const quickAccessBoxContainer = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "center",
    justifyContent: isMobile ? "center" : "space-around",
    gap: isMobile ? "16px" : "0px",
  };

  const boxStyle = {
    backgroundColor: "#29282b",
    width: isMobile ? "100%" : "220px",
    height: "80px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    cursor: "pointer",
    paddingLeft: 18,
    paddingRight: 18,
    gap: 0,
  };

  const iconContainerStyle = (bgColor) => ({
    width: 48,
    height: 48,
    backgroundColor: bgColor,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: 14,
  });

  const textStyle = { color: "white", fontWeight: "bold" };

  return (
    <div style={containerStyle}>
      <div style={{ width: "100%" }}>
        <p
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "18px",
            marginBottom: "2px",
          }}
        >
          Quick Access
        </p>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgb(80, 80, 80)",
            width: "100%",
          }}
        />
      </div>
      <div style={quickAccessBoxContainer}>
        <div style={boxStyle} onClick={() => handleClick("/expenses/create")}>
          <div style={iconContainerStyle("#f11f99")}>
            <ReceiptLongIcon style={{ color: "#fff", width: 24, height: 24 }} />
          </div>
          <div style={textStyle}>+ New Expense</div>
        </div>
        <div style={boxStyle} onClick={() => handleClick("/bill/create")}>
          <div style={iconContainerStyle("#222255")}>
            <RequestQuoteIcon
              style={{ color: "#fff", width: 24, height: 24 }}
            />
          </div>
          <div style={textStyle}>+ New Bill</div>
        </div>
        <div
          style={boxStyle}
          onClick={() => {
            handleClick("/upload");
            handleUploadFileClick();
          }}
        >
          <div style={iconContainerStyle("#124241")}>
            <CloudUploadIcon style={{ color: "#fff", width: 24, height: 24 }} />
          </div>
          <div style={textStyle}>+ Upload File</div>
        </div>
        <div style={boxStyle} onClick={() => handleClick("/budget/create")}>
          <div style={iconContainerStyle("#682b3b")}>
            <AccountBalanceWalletIcon
              style={{ color: "#fff", width: 24, height: 24 }}
            />
          </div>
          <div style={textStyle}>+ New Budget</div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccess;
