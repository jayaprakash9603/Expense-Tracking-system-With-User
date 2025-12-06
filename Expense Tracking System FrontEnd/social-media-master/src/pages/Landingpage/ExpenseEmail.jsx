import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  useTheme as useMuiTheme,
  useMediaQuery,
  Stack,
  Grid,
  Chip,
  Fade,
  InputAdornment,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CategoryIcon from "@mui/icons-material/Category";
import PaymentIcon from "@mui/icons-material/Payment";
import { api, API_BASE_URL } from "../../config/api";
import { expensesTypesEmail } from "../Input Fields/InputFields";
import ReusableAutocomplete from "../../components/ReusableAutocomplete";
import ReusableFilterField from "../../components/ReusableFilterField";
import { useTheme } from "../../hooks/useTheme";

const ExpenseEmail = () => {
  const [logTypes] = useState(expensesTypesEmail);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [specificYear, setSpecificYear] = useState("");
  const [specificMonth, setSpecificMonth] = useState("");
  const [specificDay, setSpecificDay] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [fromDay, setFromDay] = useState("");
  const [toDay, setToDay] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [category, setCategory] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const jwt = localStorage.getItem("jwt");
  const muiTheme = useMuiTheme();
  const { colors, mode } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const disabledTextColor =
    mode === "light" ? "rgba(26, 26, 26, 0.45)" : "rgba(255, 255, 255, 0.45)";
  const sectionBorder = colors.border_color;
  const cardShadow =
    mode === "dark"
      ? "0 18px 40px rgba(0, 0, 0, 0.6)"
      : "0 14px 32px rgba(15, 23, 42, 0.08)";
  const formSectionStyles = {
    border: `1px solid ${sectionBorder}`,
    borderRadius: 2,
    p: isMobile ? 2 : 2.5,
    bgcolor: colors.primary_bg,
    minHeight: 108,
  };

  const handleSendEmail = async () => {
    if (!email) {
      setError("Please enter an email.");
      return;
    }
    setError("");
    setLoading(true);
    const { url, params } = getEmailParams();
    if (!url) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.status === 204) {
        alert("No Expenses were found.");
        handleClearAll();
      } else {
        alert("Email sent successfully!");
        handleClearAll();
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message);
        handleClearAll();
      } else {
        console.error("Error sending email:", error);
        alert("Failed to send email.");
        handleClearAll();
      }
    } finally {
      setLoading(false);
    }
  };

  const getEmailParams = () => {
    let url = "";
    let params = { email };
    const baseUrl = `${API_BASE_URL}`;
    switch (searchTerm) {
      case "Today":
        url = `${baseUrl}/api/expenses/email/today`;
        break;
      case "Yesterday":
        url = `${baseUrl}/api/expenses/email/yesterday`;
        break;
      case "Last Week":
        url = `${baseUrl}/api/expenses/email/current-week`;
        break;
      case "Current Week":
        url = `${baseUrl}/api/expenses/email/last-week`;
        break;
      case "Current Month":
        url = `${baseUrl}/api/expenses/email/current-month`;
        break;
      case "Last Month":
        url = `${baseUrl}/api/expenses/email/last-month`;
        break;
      case "All Expenses":
        url = `${baseUrl}/api/expenses/email/all`;
        break;
      case "Within Range Expenses":
        url = `${baseUrl}/api/expenses/email/range`;
        params.startDate = fromDay;
        params.endDate = toDay;
        break;
      case "Expenses By Name":
        url = `${baseUrl}/api/expenses/email/name`;
        params.expenseName = expenseName;
        break;
      case "Expenses By Payment Method":
        url = `${baseUrl}/api/expenses/email/payment-method/${paymentMethod}`;
        break;
      case "Expenses By Type and Payment Method":
        url = `${baseUrl}/api/expenses/email/type-payment-method/${category}/${paymentMethod}`;
        break;
      case "Expenses By Type":
        url = `${baseUrl}/api/expenses/email/type/${category}`;
        break;
      case "Expenses Within Amount Range":
        url = `${baseUrl}/api/expenses/email/amount-range`;
        params.minAmount = minAmount;
        params.maxAmount = maxAmount;
        break;
      case "Particular Month Expenses":
        url = `${baseUrl}/api/expenses/email/by-month`;
        params.month = startMonth;
        params.year = startYear;
        break;
      case "Particular Date Expenses":
        url = `${baseUrl}/api/expenses/email/by-date`;
        params.date = fromDay;
        break;
      default:
        setError("Please select a valid option.");
        return { url: "", params: {} };
    }
    return { url, params };
  };

  const handleClearAll = () => {
    setSearchTerm("");
    setInputValue("");
    setSpecificYear("");
    setSpecificMonth("");
    setSpecificDay("");
    setStartYear("");
    setEndYear("");
    setStartMonth("");
    setEndMonth("");
    setFromDay("");
    setToDay("");
    setExpenseName("");
    setPaymentMethod("");
    setCategory("");
    setMinAmount("");
    setMaxAmount("");
    setError("");
    setEmail("");
  };

  const highlightText = (option, inputValue) => {
    if (!inputValue) return <div>{option}</div>;
    const regex = new RegExp(
      `(${inputValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = option.split(regex);
    const normalizedInput = inputValue.toLowerCase();
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === normalizedInput ? (
            <Typography
              key={`${part}-${index}`}
              component="span"
              sx={{
                color: "#00dac6",
                fontWeight: 600,
              }}
            >
              {part}
            </Typography>
          ) : (
            <Typography
              key={`${part}-${index}`}
              component="span"
              sx={{ color: colors.primary_text }}
            >
              {part}
            </Typography>
          )
        )}
      </span>
    );
  };

  const renderDynamicFields = () => {
    switch (searchTerm) {
      case "Particular Date Expenses":
        return (
          <ReusableFilterField
            type="date"
            label="Select Date"
            value={fromDay}
            onChange={(e) => setFromDay(e.target.value)}
          />
        );
      case "Particular Month Expenses":
        return (
          <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12 }}>
            <ReusableFilterField
              type="number"
              label="Year"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="e.g., 2025"
              gridProps={{ xs: 12, sm: 6 }}
            />
            <ReusableFilterField
              type="number"
              label="Month (1-12)"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              placeholder="e.g., 3 for March"
              inputProps={{ min: 1, max: 12 }}
              gridProps={{ xs: 12, sm: 6 }}
            />
          </Grid>
        );
      case "Expenses By Name":
        return (
          <ReusableFilterField
            type="text"
            label="Expense Name"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            placeholder="Enter expense name..."
            startAdornment={<CategoryIcon sx={{ color: "#00dac6", fontSize: 20 }} />}
          />
        );
      case "Expenses By Payment Method":
        return (
          <ReusableFilterField
            type="select"
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: "", label: "Select Method" },
              { value: "cash", label: "Cash" },
              { value: "creditNeedToPaid", label: "Credit Due" },
              { value: "creditPaid", label: "Credit Paid" },
            ]}
            startAdornment={<PaymentIcon sx={{ color: "#00dac6", fontSize: 20 }} />}
          />
        );
      case "Within Range Expenses":
        return (
          <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12 }}>
            <ReusableFilterField
              type="date"
              label="From Date"
              value={fromDay}
              onChange={(e) => setFromDay(e.target.value)}
              gridProps={{ xs: 12, sm: 6 }}
            />
            <ReusableFilterField
              type="date"
              label="To Date"
              value={toDay}
              onChange={(e) => setToDay(e.target.value)}
              gridProps={{ xs: 12, sm: 6 }}
            />
          </Grid>
        );
      case "Expenses By Type and Payment Method":
        return (
          <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12 }}>
            <ReusableFilterField
              type="select"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "", label: "Select Category" },
                { value: "loss", label: "Loss" },
                { value: "gain", label: "Gain" },
              ]}
              gridProps={{ xs: 12, sm: 6 }}
            />
            <ReusableFilterField
              type="select"
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: "", label: "Select Method" },
                { value: "cash", label: "Cash" },
                { value: "creditNeedToPaid", label: "Credit Due" },
                { value: "creditPaid", label: "Credit Paid" },
              ]}
              gridProps={{ xs: 12, sm: 6 }}
            />
          </Grid>
        );
      case "Expenses By Type":
        return (
          <ReusableFilterField
            type="select"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "", label: "Select Category" },
              { value: "loss", label: "Loss" },
              { value: "gain", label: "Gain" },
            ]}
            startAdornment={<CategoryIcon sx={{ color: "#00dac6", fontSize: 20 }} />}
          />
        );
      case "Expenses Within Amount Range":
        return (
          <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12 }}>
            <ReusableFilterField
              type="number"
              label="Minimum Amount"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="e.g., 100.00"
              inputProps={{ step: "0.01" }}
              startAdornment={<AttachMoneyIcon sx={{ color: "#00dac6", fontSize: 20 }} />}
              gridProps={{ xs: 12, sm: 6 }}
            />
            <ReusableFilterField
              type="number"
              label="Maximum Amount"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="e.g., 1000.00"
              inputProps={{ step: "0.01" }}
              startAdornment={<AttachMoneyIcon sx={{ color: "#00dac6", fontSize: 20 }} />}
              gridProps={{ xs: 12, sm: 6 }}
            />
          </Grid>
        );
      default:
        return null;
    }
  };

  const dynamicFieldsContent = renderDynamicFields();
  const showDynamicFields = Boolean(dynamicFieldsContent);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
          gap: 2,
        }}
      >
        <CircularProgress size={48} sx={{ color: "#00dac6" }} />
        <Typography variant="body1" sx={{ color: "#888" }}>
          Sending your report...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        mx: "auto",
        border: `1px solid ${sectionBorder}`,
        borderRadius: 3,
        p: isMobile ? 2 : 3,
        bgcolor: colors.secondary_bg,
        boxShadow: cardShadow,
        minHeight: 420,
      }}
    >
      {error && (
        <Fade in>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                color: "#ff5252",
              },
            }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        </Fade>
      )}

      <Stack spacing={3} sx={{ width: "100%" }}>
        <Box sx={formSectionStyles}>
          <Grid container spacing={2} alignItems="flex-start">
            {/* Report Period Row */}
            <Grid item xs={12} md={showDynamicFields ? 6 : 12}>
              <Typography
                variant="caption"
                sx={{
                  color: colors.secondary_text,
                  mb: 1,
                  display: "block",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Report Period
              </Typography>
              <ReusableAutocomplete
                options={logTypes}
                value={searchTerm}
                onChange={(event, newValue) => setSearchTerm(newValue || "")}
                onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                loading={loadingSuggestions}
                loadingText="Loading options..."
                noOptionsText="No matching period found"
                placeholder="Select report period"
                autoHighlight
                getOptionLabel={(option) => option || ""}
                isOptionEqualToValue={(option, value) => option === value}
                backgroundColor={colors.primary_bg}
                textColor={colors.primary_text}
                borderColor={colors.border_color}
                focusBorderColor="#00dac6"
                placeholderColor={colors.placeholder_text}
                startAdornment={
                  <InputAdornment position="start">
                    <CalendarTodayIcon sx={{ color: "#00dac6", fontSize: 20 }} />
                  </InputAdornment>
                }
                renderOption={(props, option, { inputValue }) => {
                  const { key, ...optionProps } = props;
                  return (
                    <li key={key} {...optionProps} style={{ padding: "12px 16px" }}>
                      {highlightText(option, inputValue)}
                    </li>
                  );
                }}
                sx={{ width: "100%" }}
              />
            </Grid>

            {/* Right Column: Additional Filters */}
            {showDynamicFields && (
              <Fade in timeout={400} mountOnEnter unmountOnExit>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.secondary_text,
                      mb: 1,
                      display: "block",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Additional Filters
                  </Typography>
                  <Box>{dynamicFieldsContent}</Box>
                </Grid>
              </Fade>
            )}

            {/* Recipient Email - Full Width Row */}
            <Grid item xs={12}>
              <Typography
                variant="caption"
                sx={{
                  color: colors.secondary_text,
                  mb: 1,
                  display: "block",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Recipient Email
              </Typography>
              <ReusableFilterField
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startAdornment={<EmailIcon sx={{ color: "#00dac6", fontSize: 20 }} />}
              />
            </Grid>
          </Grid>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Button
            variant="outlined"
            onClick={handleClearAll}
            startIcon={<ClearIcon />}
            sx={{
              flex: 1,
              textTransform: "none",
              borderColor: "#ef4444",
              color: "#ef4444",
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              "&:hover": {
                borderColor: "#dc2626",
                bgcolor: "rgba(239, 68, 68, 0.08)",
                color: "#dc2626",
              },
              transition: "all 0.3s ease",
            }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={handleSendEmail}
            startIcon={<SendIcon />}
            disabled={!email || searchTerm === "select" || searchTerm === ""}
            sx={{
              flex: 2,
              textTransform: "none",
              bgcolor: colors.button_bg,
              color: colors.button_text,
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
              "&:hover": {
                bgcolor: colors.button_hover,
                color: colors.button_text,
                transform: "translateY(-2px)",
                boxShadow: `0 12px 24px ${colors.primary_accent}33`,
              },
              "&:disabled": {
                bgcolor: colors.button_inactive,
                color: disabledTextColor,
                boxShadow: "none",
              },
              transition: "all 0.3s ease",
            }}
          >
            Send Report
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ExpenseEmail;
