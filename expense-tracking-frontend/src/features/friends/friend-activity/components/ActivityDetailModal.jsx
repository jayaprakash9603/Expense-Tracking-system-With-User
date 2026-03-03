/**
 * ActivityDetailModal Component
 * Modal to display detailed information about a friend activity.
 */

import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Grid,
  Divider,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Description as BillIcon,
  AccountBalanceWallet as BudgetIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  Add as CreateIcon,
  Edit as UpdateIcon,
  Delete as DeleteIcon,
  CalendarMonth as DateFieldIcon,
  AttachMoney as AmountIcon,
  Info as InfoIcon,
  Label as LabelIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Palette as ColorIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseTypeIcon,
  DateRange as DateRangeIcon,
  MoneyOff as CreditDueIcon,
  CheckBox as IncludeBudgetIcon,
  Public as GlobalIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../../hooks/useTheme";
import useUserSettings from "../../../../hooks/useUserSettings";
import {
  formatRelativeTime,
  formatSmartDate,
  getEntityColor,
  getActionColor,
  parseMetadata,
} from "../utils";

/**
 * Get icon component based on entity type
 */
const getEntityIcon = (entityType) => {
  const icons = {
    EXPENSE: ReceiptIcon,
    BILL: BillIcon,
    BUDGET: BudgetIcon,
    CATEGORY: CategoryIcon,
    PAYMENT: PaymentIcon,
    PAYMENT_METHOD: PaymentIcon,
  };
  return icons[entityType] || ReceiptIcon;
};

/**
 * Get action icon component
 */
const getActionIcon = (action) => {
  const icons = {
    CREATE: CreateIcon,
    UPDATE: UpdateIcon,
    DELETE: DeleteIcon,
  };
  return icons[action] || UpdateIcon;
};

/**
 * Detail field configuration by entity type (matching ActivityCard)
 */
const ENTITY_FIELD_CONFIG = {
  EXPENSE: [
    {
      key: "expenseName",
      label: "Expense Name",
      icon: LabelIcon,
      primary: true,
    },
    {
      key: "amount",
      label: "Amount",
      icon: AmountIcon,
      isAmount: true,
      highlight: true,
    },
    {
      key: "netAmount",
      label: "Net Amount",
      icon: AccountIcon,
      isAmount: true,
    },
    { key: "date", label: "Date", icon: DateFieldIcon, isDate: true },
    { key: "categoryName", label: "Category", icon: CategoryIcon },
    {
      key: "type",
      label: "Type",
      icon: TagIcon,
      formatValue: (v) => (v === "gain" ? "Income" : "Expense"),
      isType: true,
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      icon: CreditCardIcon,
      formatPayment: true,
    },
    {
      key: "creditDue",
      label: "Credit Due",
      icon: CreditDueIcon,
      isAmount: true,
      showIfPositive: true,
    },
    { key: "comments", label: "Comments", icon: InfoIcon, fullWidth: true },
    {
      key: "includeInBudget",
      label: "In Budget",
      icon: IncludeBudgetIcon,
      isBoolean: true,
    },
  ],
  BILL: [
    { key: "name", label: "Bill Name", icon: BillIcon, primary: true },
    {
      key: "amount",
      label: "Amount",
      icon: AmountIcon,
      isAmount: true,
      highlight: true,
    },
    {
      key: "netAmount",
      label: "Net Amount",
      icon: AccountIcon,
      isAmount: true,
    },
    { key: "date", label: "Date", icon: DateFieldIcon, isDate: true },
    { key: "category", label: "Category", icon: CategoryIcon },
    {
      key: "type",
      label: "Type",
      icon: TagIcon,
      formatValue: (v) => (v === "gain" ? "Income" : "Expense"),
      isType: true,
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      icon: CreditCardIcon,
      formatPayment: true,
    },
    {
      key: "creditDue",
      label: "Credit Due",
      icon: CreditDueIcon,
      isAmount: true,
      showIfPositive: true,
    },
    {
      key: "description",
      label: "Description",
      icon: InfoIcon,
      fullWidth: true,
    },
    {
      key: "includeInBudget",
      label: "In Budget",
      icon: IncludeBudgetIcon,
      isBoolean: true,
    },
  ],
  BUDGET: [
    { key: "name", label: "Budget Name", icon: BudgetIcon, primary: true },
    {
      key: "amount",
      label: "Budget Amount",
      icon: AmountIcon,
      isAmount: true,
      highlight: true,
    },
    {
      key: "remainingAmount",
      label: "Remaining",
      icon: AmountIcon,
      isAmount: true,
      isRemaining: true,
    },
    {
      key: "startDate",
      label: "Start Date",
      icon: DateFieldIcon,
      isDate: true,
    },
    { key: "endDate", label: "End Date", icon: DateFieldIcon, isDate: true },
    {
      key: "description",
      label: "Description",
      icon: InfoIcon,
      fullWidth: true,
    },
    {
      key: "includeInBudget",
      label: "Active",
      icon: IncludeBudgetIcon,
      isBoolean: true,
    },
  ],
  CATEGORY: [
    { key: "name", label: "Category Name", icon: CategoryIcon, primary: true },
    {
      key: "type",
      label: "Type",
      icon: TagIcon,
      formatValue: (v) => (v === "gain" ? "Income" : "Expense"),
      isType: true,
    },
    { key: "color", label: "Color", icon: ColorIcon, isColor: true },
    { key: "icon", label: "Icon", icon: LabelIcon },
    {
      key: "description",
      label: "Description",
      icon: InfoIcon,
      fullWidth: true,
    },
    { key: "isGlobal", label: "Global", icon: GlobalIcon, isBoolean: true },
  ],
  PAYMENT_METHOD: [
    { key: "name", label: "Payment Method", icon: PaymentIcon, primary: true },
    {
      key: "amount",
      label: "Amount",
      icon: AmountIcon,
      isAmount: true,
      highlight: true,
    },
    {
      key: "type",
      label: "Type",
      icon: TagIcon,
      formatValue: (v) => (v === "gain" ? "Income" : "Expense"),
      isType: true,
    },
    { key: "color", label: "Color", icon: ColorIcon, isColor: true },
    { key: "icon", label: "Icon", icon: LabelIcon },
    { key: "isGlobal", label: "Global", icon: GlobalIcon, isBoolean: true },
  ],
  PAYMENT: [
    { key: "name", label: "Payment Method", icon: PaymentIcon, primary: true },
    {
      key: "amount",
      label: "Amount",
      icon: AmountIcon,
      isAmount: true,
      highlight: true,
    },
    {
      key: "type",
      label: "Type",
      icon: TagIcon,
      formatValue: (v) => (v === "gain" ? "Income" : "Expense"),
      isType: true,
    },
    { key: "color", label: "Color", icon: ColorIcon, isColor: true },
    { key: "icon", label: "Icon", icon: LabelIcon },
    { key: "isGlobal", label: "Global", icon: GlobalIcon, isBoolean: true },
  ],
};

/**
 * Format payment method display value
 */
const formatPaymentMethod = (value) => {
  const paymentMethodLabels = {
    creditNeedToPaid: "Credit (Pending)",
    creditPaid: "Credit (Paid)",
    cash: "Cash",
    debit: "Debit Card",
    credit: "Credit Card",
    upi: "UPI",
    netBanking: "Net Banking",
  };
  return paymentMethodLabels[value] || value;
};

const ActivityDetailModal = ({ open, onClose, activity }) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  // Extract activity data (with defaults for when activity is null)
  const {
    actorUser = null,
    actorUserName = "",
    entityType = "EXPENSE",
    action = "CREATE",
    description = "",
    actionText = "",
    amount = null,
    timestamp = null,
    entityPayload = {},
    metadata: rawMetadata = null,
  } = activity || {};

  const metadata = useMemo(() => parseMetadata(rawMetadata), [rawMetadata]);
  const entityColor = getEntityColor(entityType);
  const actionColor = getActionColor(action);
  const EntityIconComponent = getEntityIcon(entityType);
  const ActionIconComponent = getActionIcon(action);

  // Get field configuration for this entity type
  const fieldConfig = ENTITY_FIELD_CONFIG[entityType] || [];

  // Merge entityPayload with metadata for complete data
  const mergedData = useMemo(
    () => ({ ...metadata, ...entityPayload }),
    [metadata, entityPayload],
  );

  // Filter out fields that have values
  const fieldsToShow = useMemo(
    () =>
      fieldConfig.filter((field) => {
        const value = mergedData[field.key];
        return value !== undefined && value !== null && value !== "";
      }),
    [fieldConfig, mergedData],
  );

  // Format value based on field configuration
  const formatFieldValue = (field, value) => {
    if (field.isAmount) {
      return `${currencySymbol}${Math.abs(value).toFixed(2)}`;
    }
    if (field.isDate) {
      return formatSmartDate(value);
    }
    if (field.formatPayment) {
      return formatPaymentMethod(value);
    }
    if (field.isBoolean) {
      return value ? "Yes" : "No";
    }
    if (field.formatValue) {
      return field.formatValue(value);
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Get avatar initials
  const avatarInitials = useMemo(() => {
    if (actorUser?.firstName && actorUser?.lastName) {
      return `${actorUser.firstName[0]}${actorUser.lastName[0]}`.toUpperCase();
    }
    if (actorUserName) {
      const parts = actorUserName.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return actorUserName.substring(0, 2).toUpperCase();
    }
    return "??";
  }, [actorUser, actorUserName]);

  // Early return after all hooks
  if (!activity) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.primary_bg,
          borderRadius: "12px",
          border: `1px solid ${entityColor}40`,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          borderBottom: `1px solid ${colors.border_color}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: `${entityColor}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EntityIconComponent sx={{ fontSize: 22, color: entityColor }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: colors.primary_text }}
            >
              {entityType} Details
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Chip
                size="small"
                icon={
                  <ActionIconComponent sx={{ fontSize: "12px !important" }} />
                }
                label={action}
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  backgroundColor: `${actionColor}20`,
                  color: actionColor,
                  "& .MuiChip-icon": { color: actionColor, ml: 0.5 },
                  "& .MuiChip-label": { px: 0.5 },
                }}
              />
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ color: colors.secondary_text }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Actor Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
            p: 1.5,
            backgroundColor: colors.secondary_bg,
            borderRadius: "8px",
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: `${entityColor}20`,
              color: entityColor,
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            {avatarInitials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: colors.primary_text }}
            >
              {actorUserName || "Someone"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, fontSize: "0.75rem" }}
            >
              {actionText || description}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              sx={{ color: colors.tertiary_text, fontSize: "0.7rem" }}
            >
              {formatRelativeTime(timestamp)}
            </Typography>
            {amount != null && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: amount < 0 ? "#ef4444" : "#22c55e",
                  fontSize: "0.9rem",
                }}
              >
                {currencySymbol}
                {Math.abs(amount).toFixed(2)}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Entity Details Grid */}
        {fieldsToShow.length > 0 ? (
          <Grid container spacing={1.5}>
            {fieldsToShow.map((field) => {
              const IconComponent = field.icon;
              const value = mergedData[field.key];
              const formattedValue = formatFieldValue(field, value);
              const isTypeField = field.isType;
              const gridSize = field.fullWidth ? 12 : 6;

              // Determine value color
              let valueColor = colors.primary_text;
              if (isTypeField) {
                valueColor = value === "gain" ? "#22c55e" : "#ef4444";
              } else if (field.isAmount) {
                if (value < 0) {
                  valueColor = "#ef4444";
                } else if (field.isRemaining) {
                  valueColor = value > 0 ? "#22c55e" : "#ef4444";
                } else if (field.highlight) {
                  valueColor = entityColor;
                } else {
                  valueColor = "#22c55e";
                }
              } else if (field.isBoolean) {
                valueColor = value ? "#22c55e" : colors.tertiary_text;
              }

              // Handle color field rendering
              const renderValue = () => {
                if (field.isColor && value) {
                  return (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "4px",
                          backgroundColor: value.toLowerCase(),
                          border: `1px solid ${colors.border_color}`,
                        }}
                      />
                      <span style={{ textTransform: "capitalize" }}>
                        {value}
                      </span>
                    </Box>
                  );
                }
                return formattedValue;
              };

              return (
                <Grid item xs={gridSize} key={field.key}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1.25,
                      backgroundColor: field.primary
                        ? `${entityColor}15`
                        : colors.secondary_bg,
                      borderRadius: "8px",
                      minHeight: 52,
                      border: field.primary
                        ? `1px solid ${entityColor}30`
                        : "none",
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "6px",
                        backgroundColor: field.primary
                          ? `${entityColor}25`
                          : colors.tertiary_bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent
                        sx={{
                          fontSize: 14,
                          color: field.primary
                            ? entityColor
                            : colors.tertiary_text,
                        }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.tertiary_text,
                          fontSize: "0.65rem",
                          display: "block",
                          lineHeight: 1.2,
                          textTransform: "uppercase",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {field.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          color: valueColor,
                          fontWeight:
                            field.isAmount || field.primary ? 600 : 500,
                          fontSize: field.primary ? "0.9rem" : "0.8rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: field.fullWidth ? "normal" : "nowrap",
                        }}
                      >
                        {renderValue()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ) : /* Show all available data from mergedData when no configured fields match */
        Object.keys(mergedData).length > 0 ? (
          <Grid container spacing={1.5}>
            {Object.entries(mergedData)
              .filter(
                ([key, value]) =>
                  value !== undefined &&
                  value !== null &&
                  value !== "" &&
                  ![
                    "id",
                    "userId",
                    "expenseId",
                    "categoryId",
                    "budgetIds",
                  ].includes(key) &&
                  typeof value !== "object",
              )
              .map(([key, value]) => {
                const label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());
                const isAmount =
                  key.toLowerCase().includes("amount") ||
                  key.toLowerCase().includes("price");
                const isDate = key.toLowerCase().includes("date");

                let displayValue = value;
                if (isAmount && typeof value === "number") {
                  displayValue = `${currencySymbol}${Math.abs(value).toFixed(2)}`;
                } else if (isDate) {
                  displayValue = formatSmartDate(value);
                }

                return (
                  <Grid item xs={6} key={key}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        backgroundColor: colors.secondary_bg,
                        borderRadius: "8px",
                        minHeight: 48,
                      }}
                    >
                      <InfoIcon
                        sx={{
                          fontSize: 18,
                          color: colors.tertiary_text,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.tertiary_text,
                            fontSize: "0.7rem",
                            display: "block",
                            lineHeight: 1.2,
                          }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isAmount ? "#22c55e" : colors.primary_text,
                            fontWeight: isAmount ? 600 : 500,
                            fontSize: "0.8rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {String(displayValue)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
          </Grid>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: colors.tertiary_text, fontStyle: "italic" }}
            >
              No additional details available
            </Typography>
          </Box>
        )}

        {/* Show additional fields not in config */}
        {fieldsToShow.length > 0 &&
          Object.keys(mergedData).length > fieldsToShow.length && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="caption"
                sx={{ color: colors.tertiary_text, mb: 1, display: "block" }}
              >
                Additional Information
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(mergedData)
                  .filter(([key]) => !fieldConfig.some((f) => f.key === key))
                  .filter(
                    ([key, value]) =>
                      value !== undefined &&
                      value !== null &&
                      value !== "" &&
                      ![
                        "id",
                        "userId",
                        "expenseId",
                        "categoryId",
                        "budgetIds",
                      ].includes(key) &&
                      typeof value !== "object",
                  )
                  .map(([key, value]) => {
                    const label = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <Grid item xs={6} key={key}>
                        <Box
                          sx={{
                            p: 0.75,
                            backgroundColor: colors.tertiary_bg,
                            borderRadius: "6px",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: colors.tertiary_text,
                              fontSize: "0.65rem",
                            }}
                          >
                            {label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.primary_text,
                              fontSize: "0.75rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {String(value)}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
              </Grid>
            </>
          )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderColor: colors.border_color,
            color: colors.secondary_text,
            "&:hover": {
              borderColor: colors.primary_accent,
              backgroundColor: `${colors.primary_accent}10`,
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ActivityDetailModal);
