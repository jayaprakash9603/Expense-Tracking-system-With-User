import React from "react";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CategoryIcon from "@mui/icons-material/Category";
import PaymentIcon from "@mui/icons-material/Payment";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useTheme as useMuiTheme, useMediaQuery } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import { useFeature } from "../../hooks/useFeature";
import { SUB_FEATURE_KEYS } from "../../config/featureCatalog";
import {
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

  const expensesCreateEnabled = useFeature(SUB_FEATURE_KEYS.EXPENSES_CREATE);
  const billsCreateEnabled = useFeature(SUB_FEATURE_KEYS.BILLS_CREATE);
  const uploadExpensesEnabled = useFeature(SUB_FEATURE_KEYS.UPLOAD_EXPENSES);
  const budgetsCreateEnabled = useFeature(SUB_FEATURE_KEYS.BUDGETS_CREATE);
  const categoriesCreateEnabled = useFeature(SUB_FEATURE_KEYS.CATEGORIES_CREATE);
  const paymentMethodsCreateEnabled = useFeature(SUB_FEATURE_KEYS.PAYMENT_METHODS_CREATE);

  const handleClick = (route) => {
    if (route === "/expenses") {
      dispatch(getExpensesSuggestions());
    }
    if (route === "/budget/create") {
      navigate("/budget/create");
      return;
    }
    navigate(route);
  };

  const handleUploadFileClick = () => {
    dispatch(getHomeExpensesAction());
  };

  const quickActions = [
    {
      enabled: expensesCreateEnabled,
      route: "/expenses/create",
      icon: ReceiptLongIcon,
      iconClass: "qa-icon-expense",
      label: "+ New Expense",
    },
    {
      enabled: billsCreateEnabled,
      route: "/bill/create",
      icon: RequestQuoteIcon,
      iconClass: "qa-icon-bill",
      label: "+ New Bill",
    },
    {
      enabled: uploadExpensesEnabled,
      route: "/upload/expenses",
      icon: CloudUploadIcon,
      iconClass: "qa-icon-upload",
      label: "+ Upload File",
      onClick: () => {
        handleClick("/upload/expenses");
        handleUploadFileClick();
      },
    },
    {
      enabled: budgetsCreateEnabled,
      route: "/budget/create",
      icon: AccountBalanceWalletIcon,
      iconClass: "qa-icon-budget",
      label: "+ New Budget",
    },
    {
      enabled: categoriesCreateEnabled,
      route: "/category-flow/create",
      icon: CategoryIcon,
      iconClass: "qa-icon-category",
      label: "+ New Category",
    },
    {
      enabled: paymentMethodsCreateEnabled,
      route: "/payment-method/create",
      icon: PaymentIcon,
      iconClass: "qa-icon-payment",
      label: "+ New Payment",
    },
  ].filter((action) => action.enabled);

  if (quickActions.length === 0) {
    return null;
  }

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
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.route}
              className="qa-box"
              onClick={() =>
                action.onClick ? action.onClick() : handleClick(action.route)
              }
              style={{
                backgroundColor: colors.tertiary_bg,
                border: `1px solid ${colors.border_color}`,
              }}
            >
              <div
                className={`qa-icon ${action.iconClass}`}
                style={{ backgroundColor: colors.primary_accent }}
              >
                <Icon className="qa-svg" style={{ color: colors.button_text }} />
              </div>
              <div className="qa-text" style={{ color: colors.primary_text }}>
                {action.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickAccess;
