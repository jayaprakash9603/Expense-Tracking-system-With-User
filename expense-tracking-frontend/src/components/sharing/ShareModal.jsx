/**
 * =============================================================================
 * ShareModal - Step-wise Share Creation Modal with QR Code
 * =============================================================================
 *
 * Production-grade share creation flow following MFA setup patterns:
 * Step 1: Select data type and items to share
 * Step 2: Configure permissions and expiry
 * Step 3: Review and generate QR code
 *
 * @author Expense Tracking System
 * @version 2.0
 * =============================================================================
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  QrCode2 as QrCodeIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import {
  createShare,
  clearShareError,
} from "../../Redux/Shares/shares.actions";

// =============================================================================
// Constants
// =============================================================================

const STEPS = ["Select Data", "Configure Access", "Review & Generate"];

const DATA_TYPE_OPTIONS = [
  {
    value: "EXPENSE",
    label: "Expenses",
    icon: <ReceiptIcon />,
    description: "Share your expense records",
  },
  {
    value: "CATEGORY",
    label: "Categories",
    icon: <CategoryIcon />,
    description: "Share expense categories",
  },
  {
    value: "BUDGET",
    label: "Budgets",
    icon: <BudgetIcon />,
    description: "Share budget information",
  },
];

const EXPIRY_OPTIONS = [
  { value: "1", label: "1 Day", description: "Short-term sharing" },
  { value: "7", label: "7 Days", description: "Weekly access" },
  { value: "30", label: "30 Days", description: "Monthly access" },
  { value: "90", label: "90 Days", description: "Extended access" },
  { value: "custom", label: "Custom Date", description: "Pick specific date" },
];

// =============================================================================
// Main Component
// =============================================================================

/**
 * Step-wise Modal for creating a new share with QR code.
 * Allows selecting data (expenses, categories, budgets),
 * permission level (VIEW/EDIT), and expiry duration.
 *
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Callback when modal closes
 * @param {function} onShareCreated - Callback when share is created
 * @param {string} preSelectedType - Pre-select resource type (EXPENSE, CATEGORY, BUDGET)
 * @param {Array} preSelectedItems - Pre-selected items from parent component
 */
const ShareModal = ({
  open,
  onClose,
  onShareCreated,
  preSelectedType = null,
  preSelectedItems = [],
}) => {
  const dispatch = useDispatch();
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  // Redux state
  const { createShareLoading, createShareError, currentShare } = useSelector(
    (state) => state.shares,
  );
  const { expenses } = useSelector((state) => state.expenses);
  const { categories } = useSelector((state) => state.categories);
  const { budgets } = useSelector((state) => state.budgets);

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------

  const [activeStep, setActiveStep] = useState(0);
  const [resourceType, setResourceType] = useState("EXPENSE");
  const [selectedItems, setSelectedItems] = useState([]);
  const [permission, setPermission] = useState("VIEW");
  const [expiryOption, setExpiryOption] = useState("7");
  const [customExpiry, setCustomExpiry] = useState("");
  const [shareName, setShareName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Handle pre-selected items when modal opens
  useEffect(() => {
    if (open) {
      if (preSelectedType) {
        setResourceType(preSelectedType);
      }
      if (preSelectedItems && preSelectedItems.length > 0) {
        const formattedItems = preSelectedItems.map((item) => ({
          id: item.internalId || item.id,
          externalRef:
            item.externalRef ||
            `${preSelectedType || "EXPENSE"}_${item.internalId || item.id}`,
          displayName:
            item.displayName ||
            item.name ||
            `Item #${item.internalId || item.id}`,
          subtitle: item.subtitle || "",
        }));
        setSelectedItems(formattedItems);
      }
    }
  }, [open, preSelectedType, preSelectedItems]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setSelectedItems([]);
      setShareName("");
      setExpiryOption("7");
      setCustomExpiry("");
      setSearchTerm("");
      setError("");
      dispatch(clearShareError());
    }
  }, [open, dispatch]);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  // Get available items based on resource type
  const availableItems = useMemo(() => {
    const expenseList = Array.isArray(expenses)
      ? expenses
      : expenses?.content || [];
    const categoryList = Array.isArray(categories)
      ? categories
      : categories?.content || [];
    const budgetList = Array.isArray(budgets)
      ? budgets
      : budgets?.content || [];

    switch (resourceType) {
      case "EXPENSE":
        return expenseList.map((exp) => ({
          id: exp.id,
          externalRef: exp.externalRef || `EXP_${exp.id}_${exp.date}`,
          displayName:
            exp.expense?.name ||
            exp.expense?.expenseName ||
            `Expense #${exp.id}`,
          subtitle: `${exp.date} - ${exp.categoryName || "No category"}`,
          icon: <ReceiptIcon />,
        }));
      case "CATEGORY":
        return categoryList.map((cat) => ({
          id: cat.id,
          externalRef: cat.externalRef || `CAT_${cat.id}_${cat.name}`,
          displayName: cat.name,
          subtitle: `${cat.expenseCount || 0} expenses`,
          icon: <CategoryIcon />,
        }));
      case "BUDGET":
        return budgetList.map((budget) => ({
          id: budget.id,
          externalRef: budget.externalRef || `BUD_${budget.id}_${budget.name}`,
          displayName: budget.name,
          subtitle: `$${budget.amount} - ${budget.period || "Monthly"}`,
          icon: <BudgetIcon />,
        }));
      default:
        return [];
    }
  }, [resourceType, expenses, categories, budgets]);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!searchTerm) return availableItems;
    const search = searchTerm.toLowerCase();
    return availableItems.filter(
      (item) =>
        item.displayName?.toLowerCase().includes(search) ||
        item.subtitle?.toLowerCase().includes(search),
    );
  }, [availableItems, searchTerm]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleToggleItem = useCallback((item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.externalRef === item.externalRef);
      if (exists) {
        return prev.filter((i) => i.externalRef !== item.externalRef);
      }
      return [...prev, item];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems);
    }
  }, [selectedItems, filteredItems]);

  const handleResourceTypeChange = (type) => {
    setResourceType(type);
    setSelectedItems([]);
    setSearchTerm("");
  };

  const handleNext = () => {
    if (activeStep === 0 && selectedItems.length === 0) {
      setError("Please select at least one item to share");
      return;
    }
    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => prev - 1);
  };

  const handleCreateShare = async () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one item to share");
      return;
    }

    const shareData = {
      resourceType,
      resourceRefs: selectedItems.map((item) => ({
        type: resourceType,
        internalId: item.id,
        externalRef: item.externalRef,
        displayName: item.displayName,
      })),
      permission,
      expiryDays: expiryOption !== "custom" ? parseInt(expiryOption, 10) : null,
      customExpiry: expiryOption === "custom" ? customExpiry : null,
      shareName: shareName || null,
    };

    const result = await dispatch(createShare(shareData));

    if (result.success && onShareCreated) {
      onShareCreated(result.data);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // ---------------------------------------------------------------------------
  // Render Functions
  // ---------------------------------------------------------------------------

  /**
   * Step 1: Select Data Type & Items
   */
  const renderSelectDataStep = () => (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: colors.primary_text, mb: 0.5, fontSize: "1rem" }}
      >
        What would you like to share?
      </Typography>
      <Typography
        sx={{ mb: 1.5, color: colors.secondary_text, fontSize: "0.85rem" }}
      >
        Choose the type of data and select specific items to share.
      </Typography>

      {/* Data Type Selection Cards */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {DATA_TYPE_OPTIONS.map((option) => (
          <Grid item xs={4} key={option.value}>
            <Paper
              onClick={() => handleResourceTypeChange(option.value)}
              sx={{
                p: 1.5,
                cursor: "pointer",
                textAlign: "center",
                border: `2px solid ${resourceType === option.value ? colors.primary : isDark ? "#333333" : colors.border}`,
                backgroundColor:
                  resourceType === option.value
                    ? `${colors.primary}15`
                    : isDark
                      ? "#1b1b1b"
                      : colors.card_bg,
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: colors.primary,
                  backgroundColor: `${colors.primary}10`,
                },
              }}
            >
              <Box
                sx={{
                  color:
                    resourceType === option.value
                      ? colors.primary
                      : colors.secondary_text,
                  mb: 1,
                }}
              >
                {option.icon}
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: colors.primary_text,
                  fontWeight: resourceType === option.value ? 600 : 400,
                }}
              >
                {option.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: colors.secondary_text, fontSize: "0.7rem" }}
              >
                {option.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search and Select All */}
      <Box sx={{ display: "flex", gap: 2, mb: 1.5, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder={`Search ${resourceType.toLowerCase()}s...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ color: colors.secondary_text, fontSize: 20 }}
                />
              </InputAdornment>
            ),
            sx: { color: colors.primary_text },
          }}
          sx={{ flex: 1 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={
                selectedItems.length === filteredItems.length &&
                filteredItems.length > 0
              }
              indeterminate={
                selectedItems.length > 0 &&
                selectedItems.length < filteredItems.length
              }
              onChange={handleSelectAll}
              size="small"
              sx={{ color: colors.primary }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              Select All
            </Typography>
          }
        />
      </Box>

      {/* Items List */}
      <Paper
        variant="outlined"
        sx={{
          maxHeight: 200,
          overflow: "auto",
          backgroundColor: isDark ? "#1b1b1b" : colors.card_bg,
          borderColor: isDark ? "#333333" : colors.border,
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: isDark ? "#333333" : colors.border,
            borderRadius: "2px",
          },
        }}
      >
        {filteredItems.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ color: colors.secondary_text }}>
              {searchTerm
                ? `No ${resourceType.toLowerCase()}s match your search`
                : `No ${resourceType.toLowerCase()}s available to share`}
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {filteredItems.map((item) => {
              const isSelected = selectedItems.some(
                (i) => i.externalRef === item.externalRef,
              );
              return (
                <ListItem
                  key={item.externalRef}
                  onClick={() => handleToggleItem(item)}
                  sx={{
                    cursor: "pointer",
                    borderBottom: `1px solid ${isDark ? "#2a2a2a" : colors.border}`,
                    backgroundColor: isSelected
                      ? `${colors.primary}15`
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isSelected
                        ? `${colors.primary}20`
                        : `${colors.primary}08`,
                    },
                    "&:last-child": { borderBottom: "none" },
                    py: 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox checked={isSelected} size="small" />
                  </ListItemIcon>
                  <ListItemIcon sx={{ minWidth: 36, color: colors.primary }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.displayName}
                    secondary={item.subtitle}
                    primaryTypographyProps={{
                      sx: { color: colors.primary_text, fontSize: "0.95rem" },
                    }}
                    secondaryTypographyProps={{
                      sx: { color: colors.secondary_text, fontSize: "0.8rem" },
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Selection Count */}
      <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
        <CheckIcon
          sx={{
            color:
              selectedItems.length > 0 ? colors.primary : colors.secondary_text,
            fontSize: 20,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            color:
              selectedItems.length > 0
                ? colors.primary_text
                : colors.secondary_text,
          }}
        >
          {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}{" "}
          selected
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  /**
   * Step 2: Configure Permissions & Expiry
   */
  const renderConfigureAccessStep = () => (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: colors.primary_text, mb: 0.5, fontSize: "1rem" }}
      >
        Configure Share Settings
      </Typography>
      <Typography
        sx={{ mb: 2, color: colors.secondary_text, fontSize: "0.85rem" }}
      >
        Set the permission level and how long this share will be active.
      </Typography>

      {/* Share Name */}
      <TextField
        fullWidth
        label="Share Name (Optional)"
        value={shareName}
        onChange={(e) => setShareName(e.target.value)}
        placeholder="e.g., January 2026 Expenses"
        sx={{ mb: 2 }}
        InputProps={{
          sx: { color: colors.primary_text },
        }}
        InputLabelProps={{
          sx: { color: colors.secondary_text },
        }}
      />

      {/* Permission Selection */}
      <Typography
        variant="subtitle2"
        sx={{ color: colors.secondary_text, mb: 1, fontWeight: 600 }}
      >
        Permission Level
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Paper
            onClick={() => setPermission("VIEW")}
            sx={{
              p: 2,
              cursor: "pointer",
              border: `2px solid ${permission === "VIEW" ? colors.primary : isDark ? "#333333" : colors.border}`,
              backgroundColor:
                permission === "VIEW"
                  ? `${colors.primary}15`
                  : isDark
                    ? "#1b1b1b"
                    : colors.card_bg,
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: colors.primary,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <LockIcon
                sx={{
                  color:
                    permission === "VIEW"
                      ? colors.primary
                      : colors.secondary_text,
                  fontSize: 20,
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{ color: colors.primary_text, fontWeight: 500 }}
              >
                View Only
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: colors.secondary_text }}>
              Recipients can only see the data.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper
            onClick={() => setPermission("EDIT")}
            sx={{
              p: 2,
              cursor: "pointer",
              border: `2px solid ${permission === "EDIT" ? colors.primary : isDark ? "#333333" : colors.border}`,
              backgroundColor:
                permission === "EDIT"
                  ? `${colors.primary}15`
                  : isDark
                    ? "#1b1b1b"
                    : colors.card_bg,
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: colors.primary,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <LockOpenIcon
                sx={{
                  color:
                    permission === "EDIT"
                      ? colors.primary
                      : colors.secondary_text,
                  fontSize: 20,
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{ color: colors.primary_text, fontWeight: 500 }}
              >
                Edit Access
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: colors.secondary_text }}>
              Recipients can add/update items.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Expiry Selection */}
      <Typography
        variant="subtitle2"
        sx={{ color: colors.secondary_text, mb: 1, fontWeight: 600 }}
      >
        Share Expiry
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
        {EXPIRY_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            onClick={() => setExpiryOption(option.value)}
            icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
            size="small"
            sx={{
              backgroundColor:
                expiryOption === option.value
                  ? colors.primary
                  : isDark
                    ? "#1b1b1b"
                    : colors.card_bg,
              color:
                expiryOption === option.value ? "#fff" : colors.primary_text,
              border: `1px solid ${expiryOption === option.value ? colors.primary : isDark ? "#333333" : colors.border}`,
              "&:hover": {
                backgroundColor:
                  expiryOption === option.value
                    ? colors.primary
                    : `${colors.primary}20`,
              },
            }}
          />
        ))}
      </Box>

      {/* Custom Expiry Date */}
      {expiryOption === "custom" && (
        <TextField
          fullWidth
          type="datetime-local"
          label="Custom Expiry Date"
          value={customExpiry}
          onChange={(e) => setCustomExpiry(e.target.value)}
          InputLabelProps={{
            shrink: true,
            sx: { color: colors.secondary_text },
          }}
          InputProps={{ sx: { color: colors.primary_text } }}
          sx={{ mt: 1.5 }}
        />
      )}
    </Box>
  );

  /**
   * Step 3: Review & Generate
   */
  const renderReviewStep = () => (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: colors.primary_text, mb: 0.5, fontSize: "1rem" }}
      >
        Review Your Share
      </Typography>
      <Typography
        sx={{ mb: 2, color: colors.secondary_text, fontSize: "0.85rem" }}
      >
        Confirm the details below and generate your QR code.
      </Typography>

      {/* Summary Card */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          backgroundColor: isDark ? "#1b1b1b" : colors.card_bg,
          borderColor: isDark ? "#333333" : colors.border,
          borderRadius: 2,
          mb: 2,
        }}
      >
        {/* Share Name */}
        {shareName && (
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, textTransform: "uppercase", fontSize: "0.7rem" }}
            >
              Share Name
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.primary_text, fontWeight: 500 }}
            >
              {shareName}
            </Typography>
          </Box>
        )}

        {/* Data Type */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text, textTransform: "uppercase", fontSize: "0.7rem" }}
          >
            Data Type
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {DATA_TYPE_OPTIONS.find((o) => o.value === resourceType)?.icon}
            <Typography
              variant="body2"
              sx={{ color: colors.primary_text, fontWeight: 500 }}
            >
              {DATA_TYPE_OPTIONS.find((o) => o.value === resourceType)?.label}
            </Typography>
          </Box>
        </Box>

        {/* Items Count */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text, textTransform: "uppercase", fontSize: "0.7rem" }}
          >
            Selected Items
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.primary_text, fontWeight: 500 }}
          >
            {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: isDark ? "#333333" : colors.border }} />

        {/* Permission */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text, textTransform: "uppercase", fontSize: "0.7rem" }}
          >
            Permission
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {permission === "VIEW" ? <LockIcon sx={{ fontSize: 18 }} /> : <LockOpenIcon sx={{ fontSize: 18 }} />}
            <Typography
              variant="body2"
              sx={{ color: colors.primary_text, fontWeight: 500 }}
            >
              {permission === "VIEW" ? "View Only" : "Edit Access"}
            </Typography>
          </Box>
        </Box>

        {/* Expiry */}
        <Box>
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text, textTransform: "uppercase", fontSize: "0.7rem" }}
          >
            Expires In
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ScheduleIcon sx={{ fontSize: 18 }} />
            <Typography
              variant="body2"
              sx={{ color: colors.primary_text, fontWeight: 500 }}
            >
              {expiryOption === "custom"
                ? customExpiry
                  ? new Date(customExpiry).toLocaleDateString()
                  : "Custom date"
                : EXPIRY_OPTIONS.find((o) => o.value === expiryOption)?.label}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Selected Items Preview */}
      <Typography
        variant="subtitle2"
        sx={{ color: colors.secondary_text, mb: 1, fontWeight: 600, fontSize: "0.8rem" }}
      >
        Items to Share:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {selectedItems.slice(0, 6).map((item) => (
          <Chip
            key={item.externalRef}
            label={item.displayName}
            size="small"
            sx={{
              backgroundColor: colors.primary,
              color: "#fff",
              height: 24,
              fontSize: "0.75rem",
            }}
          />
        ))}
        {selectedItems.length > 6 && (
          <Chip
            label={`+${selectedItems.length - 6} more`}
            size="small"
            sx={{
              backgroundColor: isDark ? "#1b1b1b" : colors.card_bg,
              color: colors.primary_text,
              border: `1px solid ${isDark ? "#333333" : colors.border}`,
              height: 24,
              fontSize: "0.75rem",
            }}
          />
        )}
      </Box>

      {/* Error Display */}
      {(error || createShareError) && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error || createShareError}
        </Alert>
      )}
    </Box>
  );

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.85)"
              : "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          backgroundColor: isDark ? "#0b0b0b" : colors.modal_bg,
          color: colors.primary_text,
          borderRadius: 3,
          width: 680,
          maxWidth: "95vw",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${isDark ? "#333333" : colors.border}`,
          boxShadow: isDark
            ? "0 24px 48px rgba(0, 0, 0, 0.6)"
            : "0 24px 48px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${isDark ? "#333333" : colors.border}`,
          pb: 2,
          backgroundColor: isDark ? "#0b0b0b" : colors.modal_bg,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <QrCodeIcon sx={{ color: colors.primary, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Share Data via QR Code
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon sx={{ color: colors.secondary_text }} />
        </IconButton>
      </DialogTitle>

      {/* Stepper */}
      <Box
        sx={{
          px: 3,
          pt: 2,
          pb: 1.5,
          backgroundColor: isDark ? "#0b0b0b" : colors.modal_bg,
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    color: colors.secondary_text,
                    fontSize: "0.85rem",
                  },
                  "& .MuiStepLabel-label.Mui-active": {
                    color: colors.primary_text,
                    fontWeight: 600,
                  },
                  "& .MuiStepLabel-label.Mui-completed": {
                    color: colors.primary,
                  },
                  "& .MuiStepIcon-root": {
                    color: isDark ? "#333333" : colors.border,
                  },
                  "& .MuiStepIcon-root.Mui-active": {
                    color: colors.primary,
                  },
                  "& .MuiStepIcon-root.Mui-completed": {
                    color: colors.primary,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <DialogContent
        sx={{
          px: 3,
          py: 2,
          backgroundColor: isDark ? "#0b0b0b" : colors.modal_bg,
          overflow: "hidden",
        }}
      >
        {activeStep === 0 && renderSelectDataStep()}
        {activeStep === 1 && renderConfigureAccessStep()}
        {activeStep === 2 && renderReviewStep()}
      </DialogContent>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderTop: `1px solid ${isDark ? "#333333" : colors.border}`,
          backgroundColor: isDark ? "#0b0b0b" : colors.modal_bg,
        }}
      >
        <Button
          onClick={activeStep === 0 ? handleClose : handleBack}
          startIcon={activeStep > 0 ? <ArrowBackIcon /> : null}
          sx={{ color: colors.secondary_text }}
        >
          {activeStep === 0 ? "Cancel" : "Back"}
        </Button>

        {activeStep < 2 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
            disabled={activeStep === 0 && selectedItems.length === 0}
            sx={{
              backgroundColor: colors.primary,
              "&:hover": {
                backgroundColor: colors.primary,
                opacity: 0.9,
              },
            }}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleCreateShare}
            disabled={selectedItems.length === 0 || createShareLoading}
            startIcon={
              createShareLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <QrCodeIcon />
              )
            }
            sx={{
              backgroundColor: colors.primary,
              "&:hover": {
                backgroundColor: colors.primary,
                opacity: 0.9,
              },
            }}
          >
            {createShareLoading ? "Generating..." : "Generate QR Code"}
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default ShareModal;
