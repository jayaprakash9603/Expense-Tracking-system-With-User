/**
 * ActivityCard Component
 * Displays a single friend activity item with details and actions.
 */

import React, { useMemo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Collapse,
  Grid,
  Divider,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  Description as BillIcon,
  AccountBalanceWallet as BudgetIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  CheckCircle as ReadIcon,
  Add as CreateIcon,
  Edit as UpdateIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarMonth as DateFieldIcon,
  AttachMoney as AmountIcon,
  Info as InfoIcon,
  Label as LabelIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountIcon,
  LocalOffer as TagIcon,
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
  formatAmount,
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
 * Detail field configuration by entity type
 * Based on actual API response structure
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
  // Fallback for PAYMENT (alias)
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

const ActivityCard = ({
  activity,
  onMarkAsRead,
  onViewDetails,
  compact = false,
  showAvatar = true,
}) => {
  const { colors } = useTheme();
  const settings = useUserSettings();
  const [expanded, setExpanded] = useState(false);

  // Toggle expand/collapse
  const handleToggleExpand = useCallback((e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);
  const currencySymbol = settings.getCurrency().symbol;

  const {
    id,
    actorUser,
    actorUserName,
    sourceService,
    entityType,
    action,
    description,
    actionText,
    amount,
    timestamp,
    isRead,
    entityPayload,
    metadata: rawMetadata,
  } = activity;

  // Parse metadata
  const metadata = useMemo(() => parseMetadata(rawMetadata), [rawMetadata]);

  // Check if entity has details to show
  const hasEntityDetails = useMemo(() => {
    return entityPayload && Object.keys(entityPayload).length > 0;
  }, [entityPayload]);

  // Get colors
  const entityColor = useMemo(() => getEntityColor(entityType), [entityType]);
  const actionColor = useMemo(() => getActionColor(action), [action]);

  // Get icons
  const EntityIconComponent = getEntityIcon(entityType);
  const ActionIconComponent = getActionIcon(action);

  // Format display values
  const displayAmount = useMemo(() => {
    if (amount == null) return null;
    return formatAmount(amount, currencySymbol);
  }, [amount, currencySymbol]);

  const relativeTime = useMemo(
    () => formatRelativeTime(timestamp),
    [timestamp],
  );
  const fullDate = useMemo(() => formatSmartDate(timestamp), [timestamp]);

  // Get entity name from payload
  const entityName = useMemo(() => {
    return entityPayload?.name || metadata?.name || null;
  }, [entityPayload, metadata]);

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

  // Get avatar image URL
  const avatarImage = useMemo(() => {
    return actorUser?.image || actorUser?.profileImage || null;
  }, [actorUser]);

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    (e) => {
      e.stopPropagation();
      if (onMarkAsRead && !isRead) {
        onMarkAsRead(id);
      }
    },
    [onMarkAsRead, id, isRead],
  );

  // Handle view details click
  const handleViewDetails = useCallback(
    (e) => {
      e.stopPropagation();
      if (onViewDetails) {
        onViewDetails(activity);
      }
      if (!isRead && onMarkAsRead) {
        onMarkAsRead(id);
      }
    },
    [onViewDetails, activity, isRead, onMarkAsRead, id],
  );

  // Handle click on card
  const handleClick = useCallback(() => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id);
    }
  }, [isRead, onMarkAsRead, id]);

  return (
    <Box>
      {/* Main Card Row */}
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          backgroundColor: isRead ? colors.secondary_bg : colors.primary_bg,
          borderRadius: expanded ? "8px 8px 0 0" : "8px",
          border: `1px solid ${isRead ? colors.border_color : entityColor}40`,
          borderBottom: expanded
            ? "none"
            : `1px solid ${isRead ? colors.border_color : entityColor}40`,
          cursor: "default",
          transition: "all 0.2s ease",
          position: "relative",
          minHeight: 56,
          "&:hover": {
            backgroundColor: colors.tertiary_bg,
          },
          ...(!isRead && {
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "3px",
              backgroundColor: entityColor,
              borderRadius: expanded ? "8px 0 0 0" : "8px 0 0 8px",
            },
          }),
        }}
      >
        {/* Avatar / Icon */}
        {showAvatar ? (
          <Avatar
            src={avatarImage}
            alt={actorUserName || "User"}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: `${entityColor}20`,
              color: entityColor,
              fontSize: "0.8rem",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {avatarInitials}
          </Avatar>
        ) : (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: `${entityColor}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <EntityIconComponent
              sx={{
                fontSize: 18,
                color: entityColor,
              }}
            />
          </Box>
        )}

        {/* Content - Two Lines Layout */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Line 1: Name + Action + Entity Type */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.25,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: colors.primary_text,
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
              }}
            >
              {actorUserName || "Someone"}
            </Typography>

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

            <Chip
              size="small"
              label={entityType}
              sx={{
                height: 18,
                fontSize: "0.65rem",
                backgroundColor: `${entityColor}20`,
                color: entityColor,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Box>

          {/* Line 2: Description + Time */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: colors.secondary_text,
                fontSize: "0.75rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {actionText || description}
            </Typography>

            <Tooltip title={fullDate}>
              <Typography
                variant="caption"
                sx={{
                  color: colors.tertiary_text,
                  fontSize: "0.7rem",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {relativeTime}
              </Typography>
            </Tooltip>
          </Box>
        </Box>

        {/* Amount */}
        {displayAmount && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: amount < 0 ? "#ef4444" : "#22c55e",
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {displayAmount}
          </Typography>
        )}

        {/* Actions: Mark Read + View Details */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          {!isRead && onMarkAsRead && (
            <Tooltip title="Mark as read">
              <IconButton
                size="small"
                onClick={handleMarkAsRead}
                sx={{
                  color: colors.tertiary_text,
                  p: 0.5,
                  "&:hover": {
                    color: "#22c55e",
                    backgroundColor: "#22c55e20",
                  },
                }}
              >
                <MarkReadIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          {isRead && (
            <Tooltip title="Read">
              <ReadIcon
                sx={{
                  fontSize: 16,
                  color: "#22c55e",
                  opacity: 0.6,
                }}
              />
            </Tooltip>
          )}

          {/* View Details Button - Always show if onViewDetails handler exists */}
          {hasEntityDetails && (
            <Tooltip title={expanded ? "Hide Details" : "View Details"}>
              <IconButton
                size="small"
                onClick={handleToggleExpand}
                sx={{
                  color: entityColor,
                  p: 0.5,
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    backgroundColor: `${entityColor}20`,
                  },
                }}
              >
                {expanded ? (
                  <ExpandLessIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Expandable Details Section */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          sx={{
            p: 1.5,
            backgroundColor: colors.tertiary_bg,
            borderRadius: "0 0 8px 8px",
            border: `1px solid ${isRead ? colors.border_color : entityColor}40`,
            borderTop: "none",
            ...(!isRead && {
              borderLeft: `3px solid ${entityColor}`,
            }),
          }}
        >
          {/* Header with Entity Type */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: colors.primary_text,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                fontSize: "0.8rem",
              }}
            >
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "6px",
                  backgroundColor: `${entityColor}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EntityIconComponent
                  sx={{ fontSize: 12, color: entityColor }}
                />
              </Box>
              {entityType.replace("_", " ")} Details
            </Typography>
            {/* Type Badge if exists */}
            {entityPayload?.type && (
              <Chip
                size="small"
                icon={
                  entityPayload.type === "gain" ? (
                    <IncomeIcon sx={{ fontSize: "12px !important" }} />
                  ) : (
                    <ExpenseTypeIcon sx={{ fontSize: "12px !important" }} />
                  )
                }
                label={entityPayload.type === "gain" ? "Income" : "Expense"}
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  backgroundColor:
                    entityPayload.type === "gain" ? "#22c55e20" : "#ef444420",
                  color: entityPayload.type === "gain" ? "#22c55e" : "#ef4444",
                  "& .MuiChip-icon": {
                    color:
                      entityPayload.type === "gain" ? "#22c55e" : "#ef4444",
                  },
                }}
              />
            )}
          </Box>

          <Divider sx={{ mb: 1.5, borderColor: colors.border_color }} />

          {/* Details Grid */}
          <Grid container spacing={1.5}>
            {(
              ENTITY_FIELD_CONFIG[entityType] ||
              ENTITY_FIELD_CONFIG.PAYMENT ||
              []
            ).map((field) => {
              // Skip type field as we show it in header
              if (field.key === "type") return null;

              const value = entityPayload?.[field.key];

              // Handle showIfPositive - only show if value > 0
              if (field.showIfPositive && (!value || value <= 0)) return null;

              // Skip empty/null values
              if (value === undefined || value === null || value === "")
                return null;

              // Format display value based on field type
              let displayValue = value;
              let valueColor = colors.primary_text;

              if (field.isAmount) {
                displayValue = formatAmount(Math.abs(value), currencySymbol);
                if (value < 0) {
                  valueColor = "#ef4444";
                  displayValue = `-${displayValue}`;
                } else if (field.isRemaining) {
                  valueColor = value > 0 ? "#22c55e" : "#ef4444";
                } else if (field.highlight) {
                  valueColor = entityColor;
                }
              } else if (field.isDate) {
                displayValue = formatSmartDate(value);
              } else if (field.formatPayment) {
                displayValue = formatPaymentMethod(value);
              } else if (field.isBoolean) {
                displayValue = value ? "Yes" : "No";
                valueColor = value ? "#22c55e" : colors.tertiary_text;
              } else if (field.isColor) {
                // Render color as a badge
                displayValue = (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "3px",
                        backgroundColor: value.toLowerCase(),
                        border: `1px solid ${colors.border_color}`,
                      }}
                    />
                    <span style={{ textTransform: "capitalize" }}>{value}</span>
                  </Box>
                );
              } else if (field.formatValue) {
                displayValue = field.formatValue(value);
              } else if (typeof value === "object") {
                displayValue = value.name || JSON.stringify(value);
              }

              const FieldIcon = field.icon;
              const gridSize = field.fullWidth
                ? { xs: 12 }
                : { xs: 6, sm: 4, md: 3 };

              return (
                <Grid item {...gridSize} key={field.key}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 0.75,
                      p: 0.75,
                      borderRadius: "6px",
                      backgroundColor: field.primary
                        ? `${entityColor}10`
                        : field.highlight
                          ? `${entityColor}08`
                          : "transparent",
                      border: field.primary
                        ? `1px solid ${entityColor}30`
                        : "none",
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "4px",
                        backgroundColor: field.primary
                          ? `${entityColor}20`
                          : colors.secondary_bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FieldIcon
                        sx={{
                          fontSize: 11,
                          color: field.primary
                            ? entityColor
                            : colors.tertiary_text,
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.tertiary_text,
                          fontSize: "0.6rem",
                          display: "block",
                          lineHeight: 1.2,
                          textTransform: "uppercase",
                          letterSpacing: "0.3px",
                          mb: 0.25,
                        }}
                      >
                        {field.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          color: valueColor,
                          fontSize: field.primary ? "0.85rem" : "0.75rem",
                          fontWeight:
                            field.isAmount || field.primary ? 600 : 400,
                          lineHeight: 1.3,
                          wordBreak: "break-word",
                        }}
                      >
                        {displayValue}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Date Range for Budget */}
          {entityType === "BUDGET" &&
            entityPayload?.startDate &&
            entityPayload?.endDate && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1,
                  borderRadius: "6px",
                  backgroundColor: `${entityColor}10`,
                  border: `1px dashed ${entityColor}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <DateRangeIcon sx={{ fontSize: 14, color: entityColor }} />
                <Typography
                  variant="caption"
                  sx={{ color: colors.primary_text, fontSize: "0.7rem" }}
                >
                  <strong>{formatSmartDate(entityPayload.startDate)}</strong>
                  {" → "}
                  <strong>{formatSmartDate(entityPayload.endDate)}</strong>
                </Typography>
              </Box>
            )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default React.memo(ActivityCard);
