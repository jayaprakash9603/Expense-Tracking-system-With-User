import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  Receipt as ReceiptIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
  CheckCircle as ValidIcon,
  Payment as PaymentIcon,
  CalendarToday as DateIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTheme } from "../hooks/useTheme";
import { accessShare, clearShareError } from "../Redux/Shares/shares.actions";
import { createExpenseAction } from "../Redux/Expenses/expense.action";

// LocalStorage key for tracking added items per share token
const getAddedItemsKey = (token) => `shared_added_items_${token}`;

/**
 * Page to display shared data when accessing a share link.
 * Validates the token and displays data based on permission level.
 */
const SharedViewPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  const {
    sharedData: accessedShare,
    sharedDataLoading: accessLoading,
    sharedDataError: accessError,
  } = useSelector((state) => state.shares);
  const currentUser = useSelector((state) => state.auth?.user);
  const isLoggedIn = Boolean(currentUser && localStorage.getItem("jwt"));

  const [hasAttemptedAccess, setHasAttemptedAccess] = useState(false);
  const [addedExpenses, setAddedExpenses] = useState(new Set());
  const [addingExpense, setAddingExpense] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Load previously added items from localStorage on mount
  useEffect(() => {
    if (token) {
      try {
        const savedItems = localStorage.getItem(getAddedItemsKey(token));
        if (savedItems) {
          const parsed = JSON.parse(savedItems);
          setAddedExpenses(new Set(parsed));
        }
      } catch (e) {
        console.error("Error loading saved added items:", e);
      }
    }
  }, [token]);

  // Save added items to localStorage whenever they change
  useEffect(() => {
    if (token && addedExpenses.size > 0) {
      try {
        localStorage.setItem(
          getAddedItemsKey(token),
          JSON.stringify([...addedExpenses]),
        );
      } catch (e) {
        console.error("Error saving added items:", e);
      }
    }
  }, [token, addedExpenses]);

  // Access the share on mount
  useEffect(() => {
    if (token && !hasAttemptedAccess) {
      setHasAttemptedAccess(true);
      dispatch(accessShare(token));
    }

    return () => {
      dispatch(clearShareError());
    };
  }, [token, dispatch, hasAttemptedAccess]);

  // Handle adding expense to user's account
  const handleAddToMyAccount = async (expenseData) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }

    const expense = expenseData.expense || {};
    const expenseId = expenseData.id;

    if (addedExpenses.has(expenseId)) {
      toast.info("This expense has already been added to your account");
      return;
    }

    setAddingExpense(expenseId);

    try {
      // Create a new expense based on the shared data
      const newExpense = {
        date: expenseData.date || new Date().toISOString().split("T")[0],
        categoryId: null, // User will need to assign their own category
        categoryName: expenseData.categoryName || "Uncategorized",
        includeInBudget: false,
        expense: {
          expenseName: expense.expenseName || "Shared Expense",
          amount: expense.amount || 0,
          type: expense.type || "DEBIT",
          paymentMethod: expense.paymentMethod || "CASH",
          netAmount: expense.netAmount || expense.amount || 0,
          comments: `Copied from shared data. Original notes: ${expense.comments || "None"}`,
          creditDue: expense.creditDue || 0,
        },
      };

      await dispatch(createExpenseAction(newExpense));
      setAddedExpenses((prev) => new Set([...prev, expenseId]));
      toast.success(
        `"${expense.expenseName || "Expense"}" added to your account!`,
      );
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense. Please try again.");
    } finally {
      setAddingExpense(null);
    }
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Save current URL to redirect back after login
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    setShowLoginDialog(false);
    navigate("/login");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Loading state
  if (accessLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: colors.accent, mb: 2 }} />
          <Typography sx={{ color: colors.secondary_text }}>
            Loading shared content...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (accessError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 500,
            textAlign: "center",
            backgroundColor: colors.card_bg,
            p: 4,
          }}
        >
          <WarningIcon sx={{ fontSize: 64, color: colors.error, mb: 2 }} />
          <Typography variant="h5" sx={{ color: colors.primary_text, mb: 2 }}>
            Share Not Available
          </Typography>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: colors.error + "15",
              color: colors.error,
              "& .MuiAlert-icon": { color: colors.error },
            }}
          >
            {accessError}
          </Alert>
          <Typography
            variant="body2"
            sx={{ color: colors.secondary_text, mb: 3 }}
          >
            The share link you're trying to access may have expired, been
            revoked, or does not exist.
          </Typography>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate("/")}
            sx={{
              backgroundColor: colors.accent,
              "&:hover": { backgroundColor: colors.accent_hover },
            }}
          >
            Go to Home
          </Button>
        </Card>
      </Box>
    );
  }

  // No data state
  if (!accessedShare) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Typography sx={{ color: colors.secondary_text }}>
          No shared content found.
        </Typography>
      </Box>
    );
  }

  // Map response to expected format - backend returns flat structure
  const shareInfo = {
    shareName: accessedShare.shareName,
    permission: accessedShare.permission,
    resourceType: accessedShare.resourceType,
    expiresAt: accessedShare.expiresAt,
    owner: accessedShare.owner,
    originalCount: accessedShare.originalCount,
    returnedCount: accessedShare.returnedCount,
  };
  // Extract actual data from SharedItem wrapper - items have { type, externalRef, data, found }
  const rawItems = accessedShare.items || [];
  const data = rawItems
    .filter((item) => item.found && item.data) // Only show items that were found
    .map((item) => item.data); // Extract the actual data
  const warnings = accessedShare.warnings || [];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          sx={{
            backgroundColor: colors.card_bg,
            p: 3,
            mb: 3,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ color: colors.primary_text, mb: 1 }}
              >
                {shareInfo?.shareName || "Shared Content"}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  icon={<ValidIcon />}
                  label="Valid Share"
                  size="small"
                  sx={{
                    backgroundColor: colors.success + "20",
                    color: colors.success,
                  }}
                />
                <Chip
                  icon={
                    shareInfo?.permission === "VIEW" ? (
                      <ViewIcon />
                    ) : (
                      <EditIcon />
                    )
                  }
                  label={
                    shareInfo?.permission === "VIEW"
                      ? "View Only"
                      : "Edit Access"
                  }
                  size="small"
                  sx={{
                    backgroundColor:
                      shareInfo?.permission === "VIEW"
                        ? colors.info + "20"
                        : colors.warning + "20",
                    color:
                      shareInfo?.permission === "VIEW"
                        ? colors.info
                        : colors.warning,
                  }}
                />
                <Chip
                  icon={<CategoryIcon />}
                  label={shareInfo?.resourceType}
                  size="small"
                  sx={{
                    backgroundColor: colors.accent + "20",
                    color: colors.accent,
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: colors.secondary_text,
                }}
              >
                <PersonIcon fontSize="small" />
                <Typography variant="body2">
                  Shared by User #{shareInfo?.ownerUserId}
                </Typography>
              </Box>
              {shareInfo?.expiresAt && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: colors.secondary_text,
                    mt: 1,
                  }}
                >
                  <TimeIcon fontSize="small" />
                  <Typography variant="body2">
                    Expires: {formatDate(shareInfo.expiresAt)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Shared Data Display */}
        <Paper
          sx={{
            backgroundColor: colors.card_bg,
            p: 3,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: colors.primary_text }}>
              Shared Items ({data?.length || 0})
            </Typography>
            {data?.length > 0 && (
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                Click "Add to My Account" to copy any expense to your records
              </Typography>
            )}
          </Box>

          <Divider sx={{ mb: 3, borderColor: colors.border }} />

          {/* Expenses */}
          {shareInfo?.resourceType === "EXPENSE" && (
            <Grid container spacing={3}>
              {data?.map((expenseData, index) => {
                // ExpenseDTO structure: { id, date, categoryName, expense: { expenseName, amount, ... } }
                const expense = expenseData.expense || {};
                return (
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    key={expenseData.id || index}
                  >
                    <Card
                      sx={{
                        backgroundColor: colors.modal_bg,
                        border: `1px solid ${colors.border}`,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        {/* Header with amount and category */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h5"
                              sx={{
                                color: colors.primary_text,
                                fontWeight: 600,
                              }}
                            >
                              {formatCurrency(
                                expense.amount || expense.netAmount || 0,
                              )}
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{ color: colors.accent }}
                            >
                              {expense.expenseName || "Unnamed Expense"}
                            </Typography>
                          </Box>
                          <Chip
                            label={expenseData.categoryName || "Uncategorized"}
                            size="small"
                            sx={{
                              backgroundColor: colors.accent + "20",
                              color: colors.accent,
                            }}
                          />
                        </Box>

                        {/* Details Grid */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                          }}
                        >
                          {/* Date */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <DateIcon
                              sx={{
                                fontSize: 18,
                                color: colors.secondary_text,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: colors.secondary_text }}
                            >
                              Date:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: colors.primary_text }}
                            >
                              {expenseData.date || "N/A"}
                            </Typography>
                          </Box>

                          {/* Payment Method */}
                          {expense.paymentMethod && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <PaymentIcon
                                sx={{
                                  fontSize: 18,
                                  color: colors.secondary_text,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: colors.secondary_text }}
                              >
                                Payment:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: colors.primary_text }}
                              >
                                {expense.paymentMethod}
                              </Typography>
                            </Box>
                          )}

                          {/* Type */}
                          {expense.type && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <ReceiptIcon
                                sx={{
                                  fontSize: 18,
                                  color: colors.secondary_text,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: colors.secondary_text }}
                              >
                                Type:
                              </Typography>
                              <Chip
                                label={expense.type}
                                size="small"
                                sx={{
                                  height: 22,
                                  backgroundColor:
                                    expense.type === "CREDIT"
                                      ? colors.warning + "20"
                                      : colors.success + "20",
                                  color:
                                    expense.type === "CREDIT"
                                      ? colors.warning
                                      : colors.success,
                                }}
                              />
                            </Box>
                          )}

                          {/* Net Amount (if different from amount) */}
                          {expense.netAmount &&
                            expense.netAmount !== expense.amount && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ color: colors.secondary_text }}
                                >
                                  Net Amount:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: colors.primary_text,
                                    fontWeight: 500,
                                  }}
                                >
                                  {formatCurrency(expense.netAmount)}
                                </Typography>
                              </Box>
                            )}

                          {/* Credit Due */}
                          {expense.creditDue > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ color: colors.warning }}
                              >
                                Credit Due:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: colors.warning, fontWeight: 500 }}
                              >
                                {formatCurrency(expense.creditDue)}
                              </Typography>
                            </Box>
                          )}

                          {/* Comments */}
                          {expense.comments && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 1.5,
                                backgroundColor: colors.background,
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: colors.secondary_text }}
                              >
                                Notes:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: colors.primary_text, mt: 0.5 }}
                              >
                                {expense.comments}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>

                      {/* Action Button */}
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        {addedExpenses.has(expenseData.id) ? (
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<ValidIcon />}
                            disabled
                            sx={{
                              backgroundColor: colors.success,
                              color: colors.button_text || "#fff",
                              "&.Mui-disabled": {
                                backgroundColor: colors.success,
                                color: colors.button_text || "#fff",
                                opacity: 0.9,
                              },
                            }}
                          >
                            Added to Your Account
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={
                              addingExpense === expenseData.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <AddIcon />
                              )
                            }
                            onClick={() => handleAddToMyAccount(expenseData)}
                            disabled={addingExpense === expenseData.id}
                            sx={{
                              borderColor: colors.accent,
                              color: colors.accent,
                              "&:hover": {
                                borderColor: colors.accent_hover,
                                backgroundColor: colors.accent + "10",
                              },
                            }}
                          >
                            {addingExpense === expenseData.id
                              ? "Adding..."
                              : "Add to My Account"}
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Categories */}
          {shareInfo?.resourceType === "CATEGORY" && (
            <List>
              {data?.map((category, index) => (
                <ListItem
                  key={category.id || index}
                  sx={{
                    backgroundColor: colors.modal_bg,
                    mb: 1,
                    borderRadius: 1,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        backgroundColor: category.color || colors.accent,
                      }}
                    >
                      <CategoryIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={category.name}
                    secondary={category.description || "No description"}
                    primaryTypographyProps={{
                      sx: { color: colors.primary_text },
                    }}
                    secondaryTypographyProps={{
                      sx: { color: colors.secondary_text },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {/* Budgets */}
          {shareInfo?.resourceType === "BUDGET" && (
            <Grid container spacing={2}>
              {data?.map((budget, index) => (
                <Grid item xs={12} md={6} key={budget.id || index}>
                  <Card
                    sx={{
                      backgroundColor: colors.modal_bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{ color: colors.primary_text, mb: 1 }}
                      >
                        {budget.name || "Budget"}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: colors.secondary_text }}
                          >
                            Spent
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: colors.primary_text }}
                          >
                            {formatCurrency(budget.spentAmount)} /{" "}
                            {formatCurrency(budget.amount)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            height: 8,
                            backgroundColor: colors.border,
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${Math.min(
                                ((budget.spentAmount || 0) /
                                  (budget.amount || 1)) *
                                  100,
                                100,
                              )}%`,
                              backgroundColor:
                                budget.spentAmount > budget.amount
                                  ? colors.error
                                  : colors.accent,
                              transition: "width 0.3s ease",
                            }}
                          />
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: colors.secondary_text,
                        }}
                      >
                        <Typography variant="caption">
                          {budget.period || "Monthly"}
                        </Typography>
                        <Typography variant="caption">
                          {formatDate(budget.startDate)} -{" "}
                          {formatDate(budget.endDate)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Empty state */}
          {(!data || data.length === 0) && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <LockIcon
                sx={{ fontSize: 48, color: colors.secondary_text, mb: 2 }}
              />
              <Typography sx={{ color: colors.secondary_text, mb: 2 }}>
                No data available in this share.
              </Typography>
              {warnings && warnings.length > 0 && (
                <Alert
                  severity="warning"
                  sx={{
                    textAlign: "left",
                    mt: 2,
                    backgroundColor: colors.warning + "15",
                    color: colors.warning,
                    "& .MuiAlert-icon": { color: colors.warning },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: colors.warning }}
                  >
                    Some items are no longer available:
                  </Typography>
                  {warnings.map((warning, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{ color: colors.warning }}
                    >
                      • {warning}
                    </Typography>
                  ))}
                </Alert>
              )}
            </Box>
          )}

          {/* Warnings for partial data */}
          {data && data.length > 0 && warnings && warnings.length > 0 && (
            <Alert
              severity="info"
              sx={{
                mt: 3,
                backgroundColor: colors.info + "15",
                color: colors.info,
                "& .MuiAlert-icon": { color: colors.info },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: colors.info }}
              >
                Note: Some shared items are no longer available:
              </Typography>
              {warnings.map((warning, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ color: colors.info }}
                >
                  • {warning}
                </Typography>
              ))}
            </Alert>
          )}
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            This content was shared using the Expense Tracking System secure
            sharing feature.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate("/")}
            sx={{
              mt: 2,
              borderColor: colors.accent,
              color: colors.accent,
              "&:hover": {
                borderColor: colors.accent_hover,
                backgroundColor: colors.accent + "10",
              },
            }}
          >
            Go to Home
          </Button>
        </Box>
      </Container>

      {/* Login Required Dialog */}
      <Dialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
          },
        }}
        PaperProps={{
          sx: {
            backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
            borderRadius: 3,
            minWidth: 400,
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: isDark
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: isDark ? "#fff" : "#1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: `1px solid ${isDark ? "#333" : "#e5e5e5"}`,
            pb: 2,
          }}
        >
          <LoginIcon sx={{ color: colors.accent }} />
          Login Required
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: isDark ? "#ccc" : "#444", mb: 2 }}>
            To add this expense to your account, you need to be logged in.
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "#888" : "#666" }}>
            Don't have an account? You can create one during the login process.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            pt: 0,
            borderTop: `1px solid ${isDark ? "#333" : "#e5e5e5"}`,
            mt: 2,
          }}
        >
          <Button
            onClick={() => setShowLoginDialog(false)}
            sx={{
              color: isDark ? "#888" : "#666",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={handleLoginRedirect}
            sx={{
              backgroundColor: colors.accent,
              color: "#fff",
              "&:hover": { backgroundColor: colors.accent_hover },
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SharedViewPage;
