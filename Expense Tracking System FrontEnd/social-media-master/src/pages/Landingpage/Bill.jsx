import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  Container,
  Pagination,
  IconButton,
  Popover,
  MenuItem,
  MenuList,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  ExpandMore as ExpandMoreIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  List as ListIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { fetchBills, deleteBill } from "../../Redux/Bill/bill.action";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
import EditBill from "./EditBill";
import Modal from "../Landingpage/Modal";


const Bill = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [monthOffset, setMonthOffset] = useState(0);
  const itemsPerPage = 4;
  const dispatch = useDispatch();
  const [billsData, setbillsData] = useState([]);
  const navigate = useNavigate();
  const { friendId } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // New states for edit and delete functionality
  const [billActionAnchorEl, setBillActionAnchorEl] = useState(null);
  const [selectedBillForAction, setSelectedBillForAction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [billToDelete, setBillToDelete] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // State to manage expanded accordion
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  // Function to fetch bills for specific month and year
  const fetchBillsData = async (month, year) => {
    try {
      console.log(`Fetching bills for month: ${month}, year: ${year}`);

      // Pass month and year parameters to the fetchBills action
      const responseData = await dispatch(fetchBills(month, year, friendId));
      setbillsData(responseData || []);
      console.log("Bills fetched for", `${month}/${year}:`, responseData);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setbillsData([]);
    }
  };

  useEffect(() => {
    const month = selectedDate.month() + 1; // dayjs months are 0-indexed, so add 1
    const year = selectedDate.year();
    fetchBillsData(month, year, friendId);
  }, [dispatch, selectedDate]); // Changed dependency from monthOffset to selectedDate

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => {
    handleMenuClose();
    switch (action) {
      case "new":
        friendId
          ? navigate(`/bill/create/${friendId}`)
          : navigate("/bill/create");
        break;
      case "upload":
        friendId
          ? navigate(`/bill/upload/${friendId}`)
          : navigate("/bill/upload");
        break;
      case "report":
        friendId
          ? navigate(`/bill/report/${friendId}`)
          : navigate("/bill/report");
        break;
      case "calendar":
        friendId
          ? navigate(`/bill/calendar/${friendId}`)
          : navigate("/bill/calendar");
        break;
      default:
        break;
    }
  };

  // Bill action handlers
  const handleBillActionClick = (event, bill) => {
    event.stopPropagation(); // Prevent accordion from expanding
    setBillActionAnchorEl(event.currentTarget);
    setSelectedBillForAction(bill);
  };

  const handleBillActionClose = () => {
    setBillActionAnchorEl(null);
    setSelectedBillForAction(null);
  };

  const handleEditBill = (bill) => {
    handleBillActionClose();
    friendId
      ? navigate(`/bill/edit/${bill.id}/friend/${friendId}`)
      : navigate(`/bill/edit/${bill.id}`);
  };

  const handleDeleteBill = (bill) => {
    setBillToDelete(bill);
    setDeleteDialogOpen(true);
    handleBillActionClose();
  };

  const confirmDeleteBill = async () => {
    if (!billToDelete) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteBill(billToDelete.id, friendId || ""));

      // Refresh bills data
      const month = selectedDate.month() + 1;
      const year = selectedDate.year();
      await fetchBillsData(month, year);

      setSnackbar({
        open: true,
        message: "Bill deleted successfully!",
        severity: "success",
      });

      setDeleteDialogOpen(false);
      setBillToDelete(null);
    } catch (error) {
      console.error("Error deleting bill:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete bill",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    const newDate = selectedDate.subtract(1, "month");
    setSelectedDate(newDate);
    setMonthOffset((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    const currentMonth = dayjs();
    const nextMonth = selectedDate.add(1, "month");

    // Disable if next month is in the future
    if (nextMonth.isAfter(currentMonth, "month")) {
      return;
    }

    setSelectedDate(nextMonth);
    setMonthOffset((prev) => prev + 1);
  };

  const handleDatePicker = (newValue) => {
    if (!newValue) return;
    const today = dayjs();

    // Don't allow future months
    if (newValue.isAfter(today, "month")) {
      return;
    }

    const diff = newValue
      .startOf("month")
      .diff(today.startOf("month"), "month");
    setSelectedDate(newValue);
    setMonthOffset(diff);
  };

  // Check if next month button should be disabled
  const isNextMonthDisabled = () => {
    const currentMonth = dayjs();
    const nextMonth = selectedDate.add(1, "month");
    return nextMonth.isAfter(currentMonth, "month");
  };

  // Filter bills based on active tab
  const getFilteredBills = () => {
    const bills = Array.isArray(billsData) ? billsData : [];

    switch (activeTab) {
      case 0: // All
        return bills;
      case 1: // Income
        return bills.filter((bill) => bill.type === "gain");
      case 2: // Expense
        return bills.filter((bill) => bill.type === "loss");
      default:
        return bills;
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method.toLowerCase()) {
      case "cash":
        return "#14b8a6";
      case "debit":
        return "#2196F3";
      case "credit":
        return "#FF9800";
      default:
        return "#757575";
    }
  };

  const getTypeIcon = (type) => {
    return type === "gain" ? (
      <TrendingUpIcon sx={{ color: "#14b8a6" }} />
    ) : (
      <TrendingDownIcon sx={{ color: "#f44336" }} />
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
  };

  const BillAccordion = ({ bill }) => (
    <Accordion
      key={bill.id}
      expanded={expandedAccordion === bill.id}
      onChange={handleAccordionChange(bill.id)}
      sx={{
        mb: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        borderRadius: "12px !important",
        "&:before": { display: "none" },
        overflow: "hidden",
        backgroundColor: "#1b1b1b",
        border: "none",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "#14b8a6" }} />}
        sx={{
          backgroundColor: "#0b0b0b",
          borderRadius: "12px",
          color: "#fff",
          minHeight: "64px",
          height: "64px",
          "&.Mui-expanded": {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            minHeight: "64px",
          },
          "&:hover": {
            backgroundColor: "#1b1b1b",
          },
          "& .MuiAccordionSummary-content": {
            margin: "16px 0",
            "&.Mui-expanded": {
              margin: "16px 0",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Avatar
            sx={{
              bgcolor: getPaymentMethodColor(bill.paymentMethod),
              mr: 2,
              width: 40,
              height: 40,
            }}
          >
            <ReceiptIcon sx={{ fontSize: 22 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#fff", fontSize: "1.1rem" }}
            >
              {bill.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#b0b0b0", fontSize: "0.85rem" }}
            >
              {bill.description}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {getTypeIcon(bill.type)}
            <Typography
              variant="subtitle1"
              sx={{
                color: bill.type === "gain" ? "#14b8a6" : "#f44336",
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              {formatCurrency(bill.amount)}
            </Typography>
            <Chip
              label={bill.paymentMethod.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getPaymentMethodColor(bill.paymentMethod),
                color: "white",
                fontWeight: 600,
                height: "28px",
                fontSize: "0.8rem",
              }}
            />
            {/* Bill Action Menu Button */}
            <Box sx={{ position: "relative" }}>
              <IconButton
                onClick={(event) => handleBillActionClick(event, bill)}
                sx={{
                  color: "#14b8a6",
                  "&:hover": {
                    backgroundColor: "#14b8a620",
                  },
                  ml: 1,
                }}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
              {Boolean(billActionAnchorEl) &&
                selectedBillForAction?.id === bill.id && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999,
                      }}
                      onClick={handleBillActionClose}
                    />
                    {/* Menu */}
                    <div
                      style={{
                        position: "fixed",
                        top:
                          billActionAnchorEl?.getBoundingClientRect().bottom +
                            5 || 0,
                        left:
                          billActionAnchorEl?.getBoundingClientRect().left -
                            100 || 0,
                        backgroundColor: "#1b1b1b",
                        border: "1px solid #14b8a6",
                        borderRadius: "8px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        zIndex: 1000,
                        minWidth: "150px",
                      }}
                    >
                      <div style={{ padding: "8px 0" }}>
                        <div
                          onClick={() => handleEditBill(selectedBillForAction)}
                          style={{
                            color: "#fff",
                            padding: "12px 24px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#28282a")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <EditIcon
                            sx={{ mr: 2, color: "#14b8a6", fontSize: "20px" }}
                          />
                          <span style={{ fontSize: "14px" }}>Edit Bill</span>
                        </div>

                        <div
                          onClick={() =>
                            handleDeleteBill(selectedBillForAction)
                          }
                          style={{
                            color: "#fff",
                            padding: "12px 24px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#28282a")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <DeleteIcon
                            sx={{ mr: 2, color: "#f44336", fontSize: "20px" }}
                          />
                          <span style={{ fontSize: "14px" }}>Delete Bill</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
            </Box>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3, backgroundColor: "#1b1b1b" }}>
        <Grid container spacing={3}>
          {/* Bill Summary */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#0b0b0b",
                border: "none",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  color: "#fff",
                }}
              >
                <MoneyIcon sx={{ mr: 1, color: "#14b8a6" }} />
                Bill Summary
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
                  Total Amount:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "#fff" }}
                >
                  {formatCurrency(bill.amount)}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
                  Net Amount:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "#fff" }}
                >
                  {formatCurrency(bill.netAmount)}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
                  Credit Due:
                </Typography>
                <Typography variant="body2" fontWeight={600} color="error">
                  {formatCurrency(bill.creditDue)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1, backgroundColor: "#14b8a6" }} />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
                  Date:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "#fff" }}
                >
                  {new Date(bill.date).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
                  Type:
                </Typography>
                <Chip
                  label={bill.type.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor:
                      bill.type === "gain" ? "#14b8a6" : "#f44336",
                    color: "white",
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Detailed Expenses */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#0b0b0b",
                border: "none",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  color: "#fff",
                }}
              >
                <ListIcon sx={{ mr: 1, color: "#14b8a6" }} />
                Detailed Expenses
              </Typography>
              <List dense>
                {bill.expenses && bill.expenses.length > 0 ? (
                  bill.expenses.map((expense, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        backgroundColor: "#1b1b1b",
                        borderRadius: 1,
                        mb: 1,
                        border: "none",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ color: "#fff" }}
                            >
                              {expense.itemName}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ color: "#14b8a6" }}
                            >
                              {formatCurrency(expense.totalPrice)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ color: "#b0b0b0" }}
                          >
                            Qty: {expense.quantity} ×{" "}
                            {formatCurrency(expense.unitPrice)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "#b0b0b0", textAlign: "center", py: 2 }}
                  >
                    No detailed expenses available
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const filteredBills = getFilteredBills();
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBills = filteredBills.slice(startIndex, endIndex);

  return (
    <Box
      sx={{
        height: "calc(100vh - 100px)",
        top: "50px",
        width: "calc(100vw - 370px)",
        backgroundColor: "#0b0b0b",
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        mr: "20px",
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
          <IconButton
            sx={{
              color: "#00DAC6",
              backgroundColor: "#1b1b1b",
              "&:hover": {
                backgroundColor: "#28282a",
              },
              zIndex: 10,
            }}
            onClick={() =>
              friendId && friendId !== "undefined"
                ? navigate(`/friends/expenses/${friendId}`)
                : navigate("/expenses")
            }
            aria-label="Back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="#00DAC6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
        </Box>

        <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
          <IconButton
            sx={{
              color: "#00DAC6",
              backgroundColor: "#1b1b1b",
              "&:hover": {
                backgroundColor: "#28282a",
              },
              zIndex: 10,
            }}
            onClick={handleMenuClick}
            aria-label="Menu"
          >
            <MoreVertIcon />
          </IconButton>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                backgroundColor: "#1b1b1b",
                border: "1px solid #14b8a6",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                mt: 1,
              },
            }}
          >
            <MenuList sx={{ py: 1 }}>
              <MenuItem
                onClick={() => handleMenuItemClick("new")}
                sx={{
                  color: "#fff",
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#28282a",
                  },
                }}
              >
                <AddIcon sx={{ mr: 2, color: "#14b8a6" }} />
                <Typography variant="body2">New Bill</Typography>
              </MenuItem>

              <MenuItem
                onClick={() => handleMenuItemClick("upload")}
                sx={{
                  color: "#fff",
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#28282a",
                  },
                }}
              >
                <UploadIcon sx={{ mr: 2, color: "#14b8a6" }} />
                <Typography variant="body2">Upload Bill</Typography>
              </MenuItem>

              <MenuItem
                onClick={() => handleMenuItemClick("report")}
                sx={{
                  color: "#fff",
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#28282a",
                  },
                }}
              >
                <AssessmentIcon sx={{ mr: 2, color: "#14b8a6" }} />
                <Typography variant="body2">Bill Report</Typography>
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuItemClick("calendar")}
                sx={{
                  color: "#fff",
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#28282a",
                  },
                }}
              >
                <CalendarIcon sx={{ mr: 2, color: "#14b8a6" }} />
                <Typography variant="body2">Bill Calendar</Typography>
              </MenuItem>
            </MenuList>
          </Popover>
        </Box>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Confirm Delete"
          confirmationText={`Are you sure you want to delete the bill "${billToDelete?.name}"? This action cannot be undone.`}
          onApprove={confirmDeleteBill}
          onDecline={() => setDeleteDialogOpen(false)}
          approveText={isDeleting ? "Deleting..." : "Delete"}
          declineText="Cancel"
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              backgroundColor:
                snackbar.severity === "success" ? "#14b8a6" : "#f44336",
              color: "#fff",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Month Selection Header */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isSmallScreen ? 1 : 2,
            flexDirection: isSmallScreen ? "column" : "row",
            mt: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <IconButton
              onClick={handlePrevMonth}
              sx={{
                color: "#00dac6",
                backgroundColor: "#1b1b1b",
                "&:hover": {
                  backgroundColor: "#28282a",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                views={["year", "month"]}
                value={selectedDate}
                onChange={handleDatePicker}
                maxDate={dayjs()} // Prevent future months
                sx={{
                  background: "#1b1b1b",
                  borderRadius: 2,
                  color: "#fff",
                  ".MuiInputBase-input": {
                    color: "#fff",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  },
                  ".MuiSvgIcon-root": { color: "#00dac6" },
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "#14b8a6",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00dac6",
                  },
                  width: isSmallScreen ? "200px" : "180px",
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    variant: "outlined",
                    sx: { color: "#fff" },
                  },
                }}
              />
            </LocalizationProvider>

            <IconButton
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled()}
              sx={{
                color: isNextMonthDisabled() ? "#666" : "#00dac6",
                backgroundColor: "#1b1b1b",
                "&:hover": {
                  backgroundColor: isNextMonthDisabled()
                    ? "#1b1b1b"
                    : "#28282a",
                },
                "&.Mui-disabled": {
                  color: "#666",
                  backgroundColor: "#1b1b1b",
                },
              }}
            >
              <ArrowBackIcon style={{ transform: "scaleX(-1)" }} />
            </IconButton>
          </Box>
        </Box>

        {/* Instagram-style Tabs */}
        <Paper
          sx={{
            mb: 2,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            backgroundColor: "#1b1b1b",
            border: "none",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                py: 2,
                minHeight: 60,
                color: "#b0b0b0",
                "&.Mui-selected": {
                  color: "#14b8a6",
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                backgroundColor: "#14b8a6",
              },
            }}
          >
            <Tab
              icon={<ListIcon />}
              iconPosition="start"
              label={`All Bills (${
                Array.isArray(billsData) ? billsData.length : 0
              })`}
            />
            <Tab
              icon={<TrendingUpIcon />}
              iconPosition="start"
              label={`Income (${
                Array.isArray(billsData)
                  ? billsData.filter((b) => b.type === "gain").length
                  : 0
              })`}
            />
            <Tab
              icon={<TrendingDownIcon />}
              iconPosition="start"
              label={`Expense (${
                Array.isArray(billsData)
                  ? billsData.filter((b) => b.type === "loss").length
                  : 0
              })`}
            />
          </Tabs>
        </Paper>

        {/* Bills List with Flex Growth */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 1,
            mb: 1,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#1b1b1b",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#14b8a6",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "#0d9488",
              },
            },
          }}
        >
          {currentBills.length > 0 ? (
            currentBills.map((bill) => (
              <BillAccordion key={bill.id} bill={bill} />
            ))
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                backgroundColor: "#1b1b1b",
                border: "none",
              }}
            >
              <ReceiptIcon sx={{ fontSize: 64, color: "#14b8a6", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "#b0b0b0" }}>
                No bills found for {selectedDate.format("MMMM YYYY")}
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#b0b0b0",
                  "&.Mui-selected": {
                    backgroundColor: "#14b8a6",
                    color: "white",
                  },
                  "&:hover": {
                    backgroundColor: "#14b8a6",
                    opacity: 0.7,
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Compact Summary Card */}
        {filteredBills.length > 0 && (
          <Box
            sx={{
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              backgroundColor: "#0b0b0b",
              border: "1px solid #1b1b1b",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#14b8a6",
                  }}
                >
                  Financial Summary
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#14b8a6",
                    fontWeight: 400,
                  }}
                >
                  - {selectedDate.format("MMMM YYYY")} Overview
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      background: "#1b1b1b",
                      border: "1px solid #14b8a6",
                      borderRadius: "8px",
                      textAlign: "center",
                      p: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(20, 184, 166, 0.2)",
                        backgroundColor: "#0b0b0b",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#14b8a6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                      }}
                    >
                      <ReceiptIcon sx={{ color: "#0b0b0b", fontSize: 20 }} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#b0b0b0",
                        fontWeight: 600,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Total Bills
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#14b8a6",
                        fontWeight: 700,
                      }}
                    >
                      {filteredBills.length}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      background: "#1b1b1b",
                      border: "1px solid #14b8a6",
                      borderRadius: "8px",
                      textAlign: "center",
                      p: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(20, 184, 166, 0.2)",
                        backgroundColor: "#0b0b0b",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#14b8a6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                      }}
                    >
                      <TrendingUpIcon sx={{ color: "#0b0b0b", fontSize: 20 }} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#b0b0b0",
                        fontWeight: 600,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Total Income
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#14b8a6",
                        fontWeight: 700,
                      }}
                    >
                      {formatCurrency(
                        filteredBills
                          .filter((bill) => bill.type === "gain")
                          .reduce((sum, bill) => sum + bill.amount, 0)
                      )}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      background: "#1b1b1b",
                      border: "1px solid #f44336",
                      borderRadius: "8px",
                      textAlign: "center",
                      p: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(244, 67, 54, 0.2)",
                        backgroundColor: "#0b0b0b",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#f44336",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                      }}
                    >
                      <TrendingDownIcon
                        sx={{ color: "#0b0b0b", fontSize: 20 }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#b0b0b0",
                        fontWeight: 600,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Total Expenses
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#f44336",
                        fontWeight: 700,
                      }}
                    >
                      {formatCurrency(
                        filteredBills
                          .filter((bill) => bill.type === "loss")
                          .reduce((sum, bill) => sum + bill.amount, 0)
                      )}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      background: "#1b1b1b",
                      border: "1px solid #FF9800",
                      borderRadius: "8px",
                      textAlign: "center",
                      p: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(255, 152, 0, 0.2)",
                        backgroundColor: "#0b0b0b",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#FF9800",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                      }}
                    >
                      <MoneyIcon sx={{ color: "#0b0b0b", fontSize: 20 }} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#b0b0b0",
                        fontWeight: 600,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Net Balance
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: (() => {
                          const income = filteredBills
                            .filter((bill) => bill.type === "gain")
                            .reduce((sum, bill) => sum + bill.amount, 0);
                          const expenses = filteredBills
                            .filter((bill) => bill.type === "loss")
                            .reduce((sum, bill) => sum + bill.amount, 0);
                          const netBalance = income - expenses;
                          return netBalance >= 0 ? "#14b8a6" : "#f44336";
                        })(),
                        fontWeight: 700,
                      }}
                    >
                      {(() => {
                        const income = filteredBills
                          .filter((bill) => bill.type === "gain")
                          .reduce((sum, bill) => sum + bill.amount, 0);
                        const expenses = filteredBills
                          .filter((bill) => bill.type === "loss")
                          .reduce((sum, bill) => sum + bill.amount, 0);
                        return formatCurrency(income - expenses);
                      })()}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Bill;
