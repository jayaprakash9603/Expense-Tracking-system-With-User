import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Popover,
  MenuItem,
  MenuList,
  Paper,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  List as ListIcon,
} from "@mui/icons-material";

const BillAccordion = ({
  bill,
  expandedAccordion,
  onAccordionChange,
  onBillActionClick,
  billActionAnchorEl,
  selectedBillForAction,
  onBillActionClose,
  onEditBill,
  onDeleteBill,
}) => {
  // Constants
  const COLORS = {
    primary: "#14b8a6",
    error: "#f44336",
    background: "#0b0b0b",
    surface: "#1b1b1b",
    text: "#fff",
    textSecondary: "#b0b0b0",
    hover: "#28282a",
    primaryHover: "#14b8a620",
  };

  const PAYMENT_COLORS = {
    cash: "#14b8a6",
    debit: "#2196F3",
    credit: "#FF9800",
    default: "#757575",
  };

  const BILL_TYPES = {
    gain: { color: COLORS.primary, icon: TrendingUpIcon },
    loss: { color: COLORS.error, icon: TrendingDownIcon },
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPaymentMethodColor = (method) => {
    return PAYMENT_COLORS[method?.toLowerCase()] || PAYMENT_COLORS.default;
  };

  const getBillTypeConfig = (type) => {
    return BILL_TYPES[type] || BILL_TYPES.loss;
  };

  // Component factories
  const createSummaryRow = (label, value, valueColor = COLORS.text) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
        {label}:
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ color: valueColor }}
      >
        {value}
      </Typography>
    </Box>
  );

  const createMenuItem = (icon, text, onClick, iconColor = COLORS.primary) => (
    <MenuItem
      onClick={onClick}
      sx={{
        color: COLORS.text,
        px: 3,
        py: 1.5,
        "&:hover": { backgroundColor: COLORS.hover },
      }}
    >
      {React.createElement(icon, { sx: { mr: 2, color: iconColor } })}
      <Typography variant="body2">{text}</Typography>
    </MenuItem>
  );

  // Computed values
  const billTypeConfig = getBillTypeConfig(bill.type);
  const TypeIcon = billTypeConfig.icon;
  const typeColor = billTypeConfig.color;
  const paymentColor = getPaymentMethodColor(bill.paymentMethod);

  // Reusable components
  const BillSummarySection = () => (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: COLORS.background,
        border: "none",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          color: COLORS.text,
        }}
      >
        <MoneyIcon sx={{ mr: 1, color: COLORS.primary }} />
        Bill Summary
      </Typography>
      
      {createSummaryRow("Total Amount", formatCurrency(bill.amount))}
      {createSummaryRow("Net Amount", formatCurrency(bill.netAmount || bill.amount))}
      {createSummaryRow("Credit Due", formatCurrency(bill.creditDue || 0), COLORS.error)}
      
      <Divider sx={{ my: 1, backgroundColor: COLORS.primary }} />
      
      {createSummaryRow("Date", formatDate(bill.date))}
      
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
          Type:
        </Typography>
        <Chip
          label={bill.type.toUpperCase()}
          size="small"
          sx={{
            backgroundColor: typeColor,
            color: "white",
          }}
        />
      </Box>
    </Paper>
  );

  const ExpenseItem = ({ expense, index }) => (
    <ListItem
      key={index}
      sx={{
        backgroundColor: COLORS.surface,
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
              sx={{ color: COLORS.text }}
            >
              {expense.itemName || expense.name || `Item ${index + 1}`}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: COLORS.primary }}
            >
              {formatCurrency(expense.totalPrice || expense.amount || 0)}
            </Typography>
          </Box>
        }
        secondary={
          <Typography
            variant="caption"
            sx={{ color: COLORS.textSecondary }}
          >
            Qty: {expense.quantity || 1} ×{" "}
            {formatCurrency(expense.unitPrice || expense.amount || 0)}
          </Typography>
        }
      />
    </ListItem>
  );

  const DetailedExpensesSection = () => (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: COLORS.background,
        border: "none",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          color: COLORS.text,
        }}
      >
        <ListIcon sx={{ mr: 1, color: COLORS.primary }} />
        Detailed Expenses
      </Typography>
      
      <List dense>
        {bill.expenses && bill.expenses.length > 0 ? (
          bill.expenses.map((expense, index) => (
            <ExpenseItem key={index} expense={expense} index={index} />
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{ color: COLORS.textSecondary, textAlign: "center", py: 2 }}
          >
            No detailed expenses available
          </Typography>
        )}
      </List>
    </Paper>
  );

  const ActionMenu = () => (
    <Popover
      open={Boolean(billActionAnchorEl) && selectedBillForAction?.id === bill.id}
      anchorEl={billActionAnchorEl}
      onClose={onBillActionClose}
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
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.primary}`,
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          mt: 1,
        },
      }}
    >
      <MenuList sx={{ py: 1 }}>
        {createMenuItem(EditIcon, "Edit Bill", () => onEditBill(bill))}
        {createMenuItem(DeleteIcon, "Delete Bill", () => onDeleteBill(bill), COLORS.error)}
      </MenuList>
    </Popover>
  );

  return (
    <Accordion
      key={bill.id}
      expanded={expandedAccordion === bill.id}
      onChange={onAccordionChange(bill.id)}
      sx={{
        mb: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        borderRadius: "12px !important",
        "&:before": { display: "none" },
        overflow: "hidden",
        backgroundColor: COLORS.surface,
        border: "none",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: COLORS.primary }} />}
        sx={{
          backgroundColor: COLORS.background,
          borderRadius: "12px",
          color: COLORS.text,
          minHeight: "64px",
          height: "64px",
          "&.Mui-expanded": {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            minHeight: "64px",
          },
          "&:hover": {
            backgroundColor: COLORS.surface,
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
              bgcolor: paymentColor,
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
              sx={{ fontWeight: 600, color: COLORS.text, fontSize: "1.1rem" }}
            >
              {bill.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: COLORS.textSecondary, fontSize: "0.85rem" }}
            >
              {bill.description || "No description"}
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TypeIcon sx={{ color: typeColor }} />
            <Typography
              variant="subtitle1"
              sx={{
                color: typeColor,
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              {formatCurrency(bill.amount)}
            </Typography>
            <Chip
              label={bill.paymentMethod?.toUpperCase() || "CASH"}
              size="small"
              sx={{
                backgroundColor: paymentColor,
                color: "white",
                fontWeight: 600,
                height: "28px",
                fontSize: "0.8rem",
              }}
            />
            
            <Box sx={{ position: "relative" }}>
              <IconButton
                onClick={(event) => onBillActionClick(event, bill)}
                sx={{
                  color: COLORS.primary,
                  "&:hover": {
                    backgroundColor: COLORS.primaryHover,
                  },
                  ml: 1,
                }}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
              <ActionMenu />
            </Box>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3, backgroundColor: COLORS.surface }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <BillSummarySection />
          </Grid>
          <Grid item xs={12} md={6}>
            <DetailedExpensesSection />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default BillAccordion;