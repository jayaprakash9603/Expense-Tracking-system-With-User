import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  useTheme as useMuiTheme,
  useMediaQuery,
  Stack,
  Chip,
  InputAdornment,
  Fade,
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
  const { colors } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  // Helper function for consistent TextField styling
  const getTextFieldStyles = () => ({
    "& .MuiOutlinedInput-root": {
      bgcolor: colors.primary_bg,
      borderRadius: 2,
      "& fieldset": {
        borderColor: colors.border_color,
        borderWidth: "1px",
        borderStyle: "solid",
      },
      "&:hover fieldset": {
        borderColor: "#00dac6",
        borderWidth: "1px",
        borderStyle: "solid",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00dac6",
        borderWidth: "2px",
        borderStyle: "solid",
      },
    },
    "& .MuiInputBase-input": {
      color: colors.primary_text,
    },
    "& .MuiInputLabel-root": {
      color: colors.secondary_text,
    },
  });

  // Helper function for consistent Select styling
  const getSelectStyles = () => ({
    bgcolor: colors.primary_bg,
    borderRadius: 2,
    color: colors.primary_text,
    "& fieldset": {
      borderColor: colors.border_color,
      borderWidth: "1px",
      borderStyle: "solid",
    },
    "&:hover fieldset": {
      borderColor: "#00dac6",
      borderWidth: "1px",
      borderStyle: "solid",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00dac6",
      borderWidth: "2px",
      borderStyle: "solid",
    },
    "& .MuiSelect-icon": {
      color: colors.secondary_text,
    },
  });

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
      `(${inputValue.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = option.split(regex);
    return (
      <div>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} style={{ fontWeight: "bold", color: "#00dac6" }}>
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </div>
    );
  };

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
        p: isMobile ? 2 : 0,
        borderRadius: 2,
        width: "100%",
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

      <Stack spacing={3}>
        {/* Report Period Selection */}
        <Box>
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
            sx={{ 
              width: "100%",
              maxWidth: "100%",
            }}
          />
        </Box>

        {/* Dynamic Filter Fields */}
        <Fade in={searchTerm !== "select" && searchTerm !== ""} timeout={400}>
          <Box>
            {searchTerm === "Particular Date Expenses" && (
              <TextField
                label="Select Date"
                type="date"
                value={fromDay}
                onChange={(e) => setFromDay(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.primary_bg,
                    borderRadius: 2,
                    "& fieldset": { borderColor: colors.border_color },
                    "&:hover fieldset": { borderColor: "#00dac6" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#00dac6",
                      boxShadow: "0 0 0 3px rgba(0, 218, 198, 0.1)",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: colors.primary_text,
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.secondary_text,
                  },
                }}
              />
            )}
            
            {searchTerm === "Particular Month Expenses" && (
              <Stack spacing={2}>
                <TextField
                  label="Year"
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  placeholder="e.g., 2025"
                  fullWidth
                  sx={getTextFieldStyles()}
                />
                <TextField
                  label="Month (1-12)"
                  type="number"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  placeholder="e.g., 3 for March"
                  fullWidth
                  inputProps={{ min: 1, max: 12 }}
                  sx={getTextFieldStyles()}
                />
              </Stack>
            )}
            
            {searchTerm === "Expenses By Name" && (
              <TextField
                label="Expense Name"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="Enter expense name..."
                fullWidth
                sx={getTextFieldStyles()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ color: "#00dac6", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            
            {searchTerm === "Expenses By Payment Method" && (
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.secondary_text }}>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label="Payment Method"
                  sx={getSelectStyles()}
                  startAdornment={
                    <InputAdornment position="start">
                      <PaymentIcon sx={{ color: "#00dac6", fontSize: 20 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Select Method</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="creditNeedToPaid">Credit Due</MenuItem>
                  <MenuItem value="creditPaid">Credit Paid</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {searchTerm === "Within Range Expenses" && (
              <Stack spacing={2}>
                <TextField
                  label="From Date"
                  type="date"
                  value={fromDay}
                  onChange={(e) => setFromDay(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={getTextFieldStyles()}
                />
                <TextField
                  label="To Date"
                  type="date"
                  value={toDay}
                  onChange={(e) => setToDay(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={getTextFieldStyles()}
                />
              </Stack>
            )}
            
            {searchTerm === "Expenses By Type and Payment Method" && (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: colors.secondary_text }}>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category"
                    sx={getSelectStyles()}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    <MenuItem value="loss">Loss</MenuItem>
                    <MenuItem value="gain">Gain</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: colors.secondary_text }}>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label="Payment Method"
                    sx={getSelectStyles()}
                  >
                    <MenuItem value="">Select Method</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="creditNeedToPaid">Credit Due</MenuItem>
                    <MenuItem value="creditPaid">Credit Paid</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}
            
            {searchTerm === "Expenses By Type" && (
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.secondary_text }}>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                  sx={getSelectStyles()}
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ color: "#00dac6", fontSize: 20 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Select Category</MenuItem>
                  <MenuItem value="loss">Loss</MenuItem>
                  <MenuItem value="gain">Gain</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {searchTerm === "Expenses Within Amount Range" && (
              <Stack spacing={2}>
                <TextField
                  label="Minimum Amount"
                  type="number"
                  step="0.01"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="e.g., 100.00"
                  fullWidth
                  sx={getTextFieldStyles()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon sx={{ color: "#00dac6", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Maximum Amount"
                  type="number"
                  step="0.01"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="e.g., 1000.00"
                  fullWidth
                  sx={getTextFieldStyles()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon sx={{ color: "#00dac6", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            )}
          </Box>
        </Fade>

        {/* Email Input */}
        <Box>
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
          <TextField
            placeholder="your.email@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={getTextFieldStyles()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#00dac6", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={handleClearAll}
            startIcon={<ClearIcon />}
            sx={{
              flex: 1,
              textTransform: "none",
              borderColor: colors.border_color,
              color: colors.secondary_text,
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              "&:hover": {
                borderColor: "#00dac6",
                bgcolor: "rgba(0, 218, 198, 0.05)",
                color: "#00dac6",
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
              bgcolor: "#00dac6",
              color: "#000",
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#00dac6",
                opacity: 0.9,
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0, 218, 198, 0.4)",
              },
              "&:disabled": {
                bgcolor: "#2a2a2a",
                color: "#555",
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
