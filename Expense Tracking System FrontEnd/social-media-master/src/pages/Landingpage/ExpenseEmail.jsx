import React, { useState } from "react";
import axios from "axios";
import {
  Autocomplete,
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { api, API_BASE_URL } from "../../config/api";
import { expensesTypesEmail } from "../Input Fields/InputFields";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 3,
        borderRadius: "8px",
        maxWidth: isMobile ? "100%" : 400, // Outer width remains the same
        width: "100%",
        background: "#1b1b1b",
        mx: isMobile ? 0 : "0", // Align to the left side
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: isMobile ? 1 : 0 }}>
          Filters
        </Typography>
        <Button
          variant="text"
          onClick={handleClearAll}
          sx={{
            textTransform: "none",
            color: "#00dac6",
            backgroundColor: "rgba(0, 218, 198, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(0, 218, 198, 0.1)",
            },
          }}
        >
          Clear All
        </Button>
      </Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Send Expenses by Email
      </Typography>
      <div className="mb-3">
        <Autocomplete
          autoHighlight
          options={logTypes}
          value={searchTerm}
          onChange={(event, newValue) => setSearchTerm(newValue || "")}
          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
          loading={loadingSuggestions}
          loadingText="Loading"
          noOptionsText="No Data Found"
          openOnFocus
          sx={{ width: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search expense period"
              variant="outlined"
              fullWidth
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
                {highlightText(option, inputValue)}
              </li>
            );
          }}
        />
      </div>
      {searchTerm === "Particular Date Expenses" && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Enter Date"
            type="date"
            value={fromDay}
            onChange={(e) => setFromDay(e.target.value)}
            fullWidth
            sx={{ width: "100%" }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      )}
      {searchTerm === "Particular Month Expenses" && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Enter Start Year"
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            fullWidth
            sx={{ width: "100%" }}
          />
          <TextField
            label="Enter Start Month"
            type="number"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            fullWidth
            sx={{ width: "100%" }}
          />
        </Box>
      )}
      {searchTerm === "Expenses By Name" && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Enter Expense Name"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            fullWidth
            sx={{ width: "100%" }}
          />
        </Box>
      )}
      {searchTerm === "Expenses By Payment Method" && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="">-- Select Payment Method --</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="creditNeedToPaid">Credit Due</MenuItem>
              <MenuItem value="creditPaid">Credit Paid</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
      {searchTerm === "Within Range Expenses" && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="From Date"
            type="date"
            value={fromDay}
            onChange={(e) => setFromDay(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="To Date"
            type="date"
            value={toDay}
            onChange={(e) => setToDay(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      )}
      {searchTerm === "Expenses By Type and Payment Method" && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">-- Select Category --</MenuItem>
              <MenuItem value="loss">Loss</MenuItem>
              <MenuItem value="gain">Gain</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Select Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="">-- Select Payment Method --</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="creditNeedToPaid">Credit Due</MenuItem>
              <MenuItem value="creditPaid">Credit Paid</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
      {searchTerm === "Expenses By Type" && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">-- Select Category --</MenuItem>
              <MenuItem value="loss">Loss</MenuItem>
              <MenuItem value="gain">Gain</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
      {searchTerm === "Expenses Within Amount Range" && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Enter Minimum Amount"
            type="number"
            step="0.01"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Enter Maximum Amount"
            type="number"
            step="0.01"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            fullWidth
          />
        </Box>
      )}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Enter Your Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          sx={{ width: "100%" }}
        />
      </Box>
      <Button
        variant="contained"
        onClick={handleSendEmail}
        sx={{
          textTransform: "none",
          width: "100%",
          py: 1.5,
        }}
      >
        Send Email
      </Button>
    </Box>
  );
};

export default ExpenseEmail;
