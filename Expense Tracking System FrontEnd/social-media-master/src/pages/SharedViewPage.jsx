import React, { useEffect, useState, useMemo } from "react";
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
} from "@mui/material";
import {
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Category as CategoryIcon,
  AccountBalance as BudgetIcon,
  Receipt,
  Lock as LockIcon,
  Warning as WarningIcon,
  CheckCircle as ValidIcon,
} from "@mui/icons-material";
import { useTheme } from "../hooks/useTheme";
import { accessShare, clearShareError } from "../Redux/Shares/shares.actions";

/**
 * Page to display shared data when accessing a share link.
 * Validates the token and displays data based on permission level.
 */
const SharedViewPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const { accessedShare, accessLoading, accessError } = useSelector(
    (state) => state.shares
  );

  const [hasAttemptedAccess, setHasAttemptedAccess] = useState(false);

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
          <WarningIcon
            sx={{ fontSize: 64, color: colors.error, mb: 2 }}
          />
          <Typography variant="h5" sx={{ color: colors.primary_text, mb: 2 }}>
            Share Not Available
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {accessError}
          </Alert>
          <Typography
            variant="body2"
            sx={{ color: colors.secondary_text, mb: 3 }}
          >
            The share link you're trying to access may have expired, been revoked,
            or does not exist.
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

  const { shareInfo, data } = accessedShare;

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
                sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
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
          <Typography variant="h6" sx={{ color: colors.primary_text, mb: 2 }}>
            Shared Items ({data?.length || 0})
          </Typography>

          <Divider sx={{ mb: 2, borderColor: colors.border }} />

          {/* Expenses */}
          {shareInfo?.resourceType === "EXPENSE" && (
            <Grid container spacing={2}>
              {data?.map((expense, index) => (
                <Grid item xs={12} md={6} key={expense.id || index}>
                  <Card
                    sx={{
                      backgroundColor: colors.modal_bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: colors.primary_text }}
                        >
                          {formatCurrency(expense.amount)}
                        </Typography>
                        <Chip
                          label={expense.categoryName || "Uncategorized"}
                          size="small"
                          sx={{
                            backgroundColor: colors.accent + "20",
                            color: colors.accent,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.secondary_text, mb: 1 }}
                      >
                        {expense.description || "No description"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.secondary_text }}
                      >
                        {formatDate(expense.expenseDate || expense.createdAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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
                                100
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
              <Typography sx={{ color: colors.secondary_text }}>
                No data available in this share.
              </Typography>
            </Box>
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
    </Box>
  );
};

export default SharedViewPage;
