import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  QrCode2 as QrCodeIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import {
  createShare,
  clearShareError,
} from "../../Redux/Shares/shares.actions";

/**
 * Modal for creating a new share with QR code.
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
  const { colors } = useTheme();

  // Redux state
  const { createShareLoading, createShareError, currentShare } = useSelector(
    (state) => state.shares,
  );
  const { expenses } = useSelector((state) => state.expenses);
  const { categories } = useSelector((state) => state.categories);
  const { budgets } = useSelector((state) => state.budgets);

  // Local state
  const [resourceType, setResourceType] = useState("EXPENSE");
  const [selectedItems, setSelectedItems] = useState([]);
  const [permission, setPermission] = useState("VIEW");
  const [expiryOption, setExpiryOption] = useState("7");
  const [customExpiry, setCustomExpiry] = useState("");
  const [shareName, setShareName] = useState("");

  // Handle pre-selected items when modal opens
  useEffect(() => {
    if (open && preSelectedType) {
      setResourceType(preSelectedType);
    }
    if (open && preSelectedItems && preSelectedItems.length > 0) {
      // Convert pre-selected items to the expected format
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
  }, [open, preSelectedType, preSelectedItems]);

  // Get available items based on resource type
  const availableItems = useMemo(() => {
    switch (resourceType) {
      case "EXPENSE":
        return (expenses || []).map((exp) => ({
          id: exp.id,
          externalRef: exp.externalRef || `EXP_${exp.id}_${exp.date}`,
          displayName: exp.expense?.name || `Expense #${exp.id}`,
          subtitle: `${exp.date} - ${exp.categoryName || "No category"}`,
          icon: <ReceiptIcon />,
        }));
      case "CATEGORY":
        return (categories || []).map((cat) => ({
          id: cat.id,
          externalRef: cat.externalRef || `CAT_${cat.id}_${cat.name}`,
          displayName: cat.name,
          subtitle: `${cat.expenseCount || 0} expenses`,
          icon: <CategoryIcon />,
        }));
      case "BUDGET":
        return (budgets || []).map((budget) => ({
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

  // Handle item selection toggle
  const handleToggleItem = useCallback((item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.externalRef === item.externalRef);
      if (exists) {
        return prev.filter((i) => i.externalRef !== item.externalRef);
      }
      return [...prev, item];
    });
  }, []);

  // Handle select all toggle
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === availableItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(availableItems);
    }
  }, [selectedItems, availableItems]);

  // Calculate expiry date
  const calculateExpiryDate = useCallback(() => {
    if (expiryOption === "custom" && customExpiry) {
      return new Date(customExpiry).toISOString();
    }
    const days = parseInt(expiryOption, 10);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }, [expiryOption, customExpiry]);

  // Handle share creation
  const handleCreateShare = async () => {
    if (selectedItems.length === 0) {
      return;
    }

    const shareData = {
      resourceType,
      resourceRefs: selectedItems.map((item) => ({
        type: resourceType,
        internalId: item.id, // Include the internal database ID for lookup
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

  // Handle close and reset
  const handleClose = () => {
    setSelectedItems([]);
    setShareName("");
    setExpiryOption("7");
    setCustomExpiry("");
    dispatch(clearShareError());
    onClose();
  };

  // Reset selection when resource type changes
  const handleResourceTypeChange = (e) => {
    setResourceType(e.target.value);
    setSelectedItems([]);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.modal_bg,
          color: colors.primary_text,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QrCodeIcon sx={{ color: colors.accent }} />
          <Typography variant="h6">Share Data via QR Code</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon sx={{ color: colors.secondary_text }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {createShareError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => dispatch(clearShareError())}
          >
            {createShareError}
          </Alert>
        )}

        {/* If share was created, show success with QR option */}
        {currentShare && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Share created successfully! Click "View QR Code" to see the QR code
            and share link.
          </Alert>
        )}

        {/* Share Name */}
        <TextField
          fullWidth
          label="Share Name (Optional)"
          value={shareName}
          onChange={(e) => setShareName(e.target.value)}
          placeholder="e.g., January 2026 Expenses"
          sx={{ mb: 3 }}
          InputProps={{
            sx: { color: colors.primary_text },
          }}
          InputLabelProps={{
            sx: { color: colors.secondary_text },
          }}
        />

        {/* Resource Type Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: colors.secondary_text }}>
            Data Type
          </InputLabel>
          <Select
            value={resourceType}
            onChange={handleResourceTypeChange}
            label="Data Type"
            sx={{ color: colors.primary_text }}
          >
            <MenuItem value="EXPENSE">Expenses</MenuItem>
            <MenuItem value="CATEGORY">Categories</MenuItem>
            <MenuItem value="BUDGET">Budgets</MenuItem>
          </Select>
        </FormControl>

        {/* Item Selection */}
        <Accordion
          defaultExpanded
          sx={{
            backgroundColor: colors.card_bg,
            mb: 3,
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: colors.primary_text }} />}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <Typography>
                Select Items ({selectedItems.length} of {availableItems.length})
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      selectedItems.length === availableItems.length &&
                      availableItems.length > 0
                    }
                    indeterminate={
                      selectedItems.length > 0 &&
                      selectedItems.length < availableItems.length
                    }
                    onChange={handleSelectAll}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                  />
                }
                label="Select All"
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {availableItems.length === 0 ? (
              <Typography
                color="textSecondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                No {resourceType.toLowerCase()}s available to share
              </Typography>
            ) : (
              <List dense sx={{ maxHeight: 250, overflow: "auto" }}>
                {availableItems.map((item) => (
                  <ListItem
                    key={item.externalRef}
                    onClick={() => handleToggleItem(item)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 1,
                      mb: 0.5,
                      backgroundColor: selectedItems.find(
                        (i) => i.externalRef === item.externalRef,
                      )
                        ? `${colors.accent}20`
                        : "transparent",
                      "&:hover": {
                        backgroundColor: `${colors.accent}10`,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        checked={
                          !!selectedItems.find(
                            (i) => i.externalRef === item.externalRef,
                          )
                        }
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemIcon sx={{ minWidth: 40, color: colors.accent }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.displayName}
                      secondary={item.subtitle}
                      primaryTypographyProps={{ color: colors.primary_text }}
                      secondaryTypographyProps={{
                        color: colors.secondary_text,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2, borderColor: colors.border }} />

        {/* Permission & Expiry Row */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {/* Permission */}
          <FormControl sx={{ flex: 1 }}>
            <InputLabel sx={{ color: colors.secondary_text }}>
              Permission
            </InputLabel>
            <Select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              label="Permission"
              sx={{ color: colors.primary_text }}
            >
              <MenuItem value="VIEW">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LockIcon fontSize="small" />
                  View Only (Read-only)
                </Box>
              </MenuItem>
              <MenuItem value="EDIT">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LockOpenIcon fontSize="small" />
                  Edit (Add/Update, no delete)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Expiry */}
          <FormControl sx={{ flex: 1 }}>
            <InputLabel sx={{ color: colors.secondary_text }}>
              Expires In
            </InputLabel>
            <Select
              value={expiryOption}
              onChange={(e) => setExpiryOption(e.target.value)}
              label="Expires In"
              sx={{ color: colors.primary_text }}
            >
              <MenuItem value="1">1 Day</MenuItem>
              <MenuItem value="7">7 Days</MenuItem>
              <MenuItem value="30">30 Days</MenuItem>
              <MenuItem value="90">90 Days</MenuItem>
              <MenuItem value="custom">Custom Date</MenuItem>
            </Select>
          </FormControl>
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
            sx={{ mb: 2 }}
          />
        )}

        {/* Permission Info */}
        <Alert severity="info" sx={{ mt: 2 }}>
          {permission === "VIEW" ? (
            <>
              <strong>View Only:</strong> Recipients can only see the shared
              data. They cannot make any changes.
            </>
          ) : (
            <>
              <strong>Edit Access:</strong> Recipients can add new items and
              update existing ones. They <strong>cannot delete</strong> any
              data.
            </>
          )}
        </Alert>

        {/* Selected Items Preview */}
        {selectedItems.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, color: colors.secondary_text }}
            >
              Selected Items:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedItems.slice(0, 5).map((item) => (
                <Chip
                  key={item.externalRef}
                  label={item.displayName}
                  size="small"
                  onDelete={() => handleToggleItem(item)}
                  sx={{
                    backgroundColor: colors.accent,
                    color: "#fff",
                  }}
                />
              ))}
              {selectedItems.length > 5 && (
                <Chip
                  label={`+${selectedItems.length - 5} more`}
                  size="small"
                  sx={{
                    backgroundColor: colors.card_bg,
                    color: colors.primary_text,
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 3, borderTop: `1px solid ${colors.border}` }}
      >
        <Button onClick={handleClose} sx={{ color: colors.secondary_text }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateShare}
          disabled={selectedItems.length === 0 || createShareLoading}
          startIcon={
            createShareLoading ? <CircularProgress size={20} /> : <QrCodeIcon />
          }
          sx={{
            backgroundColor: colors.accent,
            "&:hover": { backgroundColor: colors.accent_hover },
          }}
        >
          {createShareLoading ? "Creating..." : "Generate QR Code"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareModal;
