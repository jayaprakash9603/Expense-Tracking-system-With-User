import React, { useEffect, useState } from "react";
import {
  Box,
  Skeleton,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  Avatar,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  Computer as ComputerIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  getExpenseHistory,
  getExpensesAction,
} from "../../Redux/Expenses/expense.action";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import createAppTheme from "./theme";
import ToastNotification from "./ToastNotification";

const HistoryTable = ({ friendId }) => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((state) => state.expenses || {});

  // Get theme mode from Redux
  const themeMode = useSelector((state) => state.theme?.mode || "dark");
  const customTheme = React.useMemo(
    () => createAppTheme(themeMode),
    [themeMode]
  );

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPanels, setExpandedPanels] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;

  const muiTheme = useTheme();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));

  useEffect(() => {
    dispatch(getExpenseHistory(friendId));
    dispatch(getExpensesAction(friendId));
  }, [dispatch, friendId]);

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
  };

  const handleAccordionChange = (panelId) => (event, isExpanded) => {
    setExpandedPanels((prev) => ({
      ...prev,
      [panelId]: isExpanded,
    }));
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setExpandedPanels({});
  };

  const parseDetails = (detailsString) => {
    try {
      return JSON.parse(detailsString);
    } catch (error) {
      return null;
    }
  };

  const getActionTypeColor = (actionType) => {
    switch (actionType) {
      case "CREATE":
        return "#4caf50";
      case "UPDATE":
        return "#ff9800";
      case "DELETE":
        return "#f44336";
      default:
        return "#2196f3";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCESS":
        return "#4caf50";
      case "FAILED":
        return "#f44336";
      case "PENDING":
        return "#ff9800";
      default:
        return "#757575";
    }
  };

  const filteredHistory = Array.isArray(history)
    ? history.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.actionType?.toLowerCase().includes(searchLower) ||
          item.entityType?.toLowerCase().includes(searchLower) ||
          item.details?.toLowerCase().includes(searchLower) ||
          item.status?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredHistory.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedPanels({});
  }, [searchTerm]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <ThemeProvider theme={customTheme}>
        <Box
          sx={{
            width: "100%",
            height: "750px",
            backgroundColor: "#0b0b0b",
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {[...Array(6)].map((_, index) => (
            <Skeleton
              key={index}
              sx={{
                height: 80, // Increased back to 80
                width: "100%",
                mb: 2, // Increased back to 2
                borderRadius: "8px",
                backgroundColor: "#1b1b1b",
              }}
            />
          ))}
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={customTheme}>
      <ToastNotification
        open={toastOpen}
        message={toastMessage}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
      <Box
        sx={{
          width: "100%",
          height: "750px",
          backgroundColor: "#0b0b0b",
          p: 2,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 2,
            flexShrink: 0,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#1b1b1b",
              color: "#ffffff",
              borderRadius: "8px",
              height: "48px",
              "& fieldset": {
                borderColor: "#333333",
              },
              "&:hover fieldset": {
                borderColor: "#00dac6",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00dac6",
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#666666",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#666666" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Accordion List Container */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            mb: 1,
            minHeight: 0,
            paddingBottom: "100px",
          }}
        >
          {currentRecords.length === 0 ? (
            <Typography
              variant="h6"
              sx={{
                color: "#666666",
                textAlign: "center",
                mt: 4,
              }}
            >
              No history records found
            </Typography>
          ) : (
            <Box>
              {currentRecords.map((item, index) => {
                const details = parseDetails(item.details);
                const panelId = `panel-${item.userId}-${item.entityId}-${
                  startIndex + index
                }`;

                return (
                  <Accordion
                    key={panelId}
                    expanded={expandedPanels[panelId] || false}
                    onChange={handleAccordionChange(panelId)}
                    sx={{
                      backgroundColor: "#1b1b1b",
                      color: "#ffffff",
                      mb: 1, // Increased back to 2
                      borderRadius: "8px !important",
                      "&:before": {
                        display: "none",
                      },
                      "& .MuiAccordionSummary-root": {
                        borderRadius: "8px",
                        minHeight: "62px", // Increased from 59px to 68px
                        "&:hover": {
                          backgroundColor: "#2a2a2a",
                        },
                      },
                      "& .MuiAccordionDetails-root": {
                        padding: "16px 24px 20px", // Increased padding
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#00dac6" }} />}
                      sx={{
                        "& .MuiAccordionSummary-content": {
                          margin: "12px 0", // Increased from 12px to 16px
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 2, // Increased back to 2
                          flexWrap: isSmallScreen ? "wrap" : "nowrap",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flex: 1,
                            minWidth: "120px", // Increased back to 120px
                          }}
                        >
                          <PersonIcon
                            sx={{ color: "#00dac6", fontSize: "1rem" }} // Increased back to 1.2rem
                          />
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {" "}
                            {/* Changed back to body1 */}
                            User - {item.username}
                          </Typography>
                        </Box>

                        <Chip
                          label={item.actionType}
                          size="small"
                          sx={{
                            backgroundColor: getActionTypeColor(
                              item.actionType
                            ),
                            color: "#ffffff",
                            fontWeight: 600,
                            minWidth: "80px", // Increased back to 80px
                            fontSize: "0.8rem", // Slightly larger font
                          }}
                        />

                        <Chip
                          label={item.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(item.status),
                            color: "#ffffff",
                            fontWeight: 600,
                            minWidth: "80px", // Increased back to 80px
                            fontSize: "0.8rem", // Slightly larger font
                          }}
                        />

                        <Typography
                          variant="body2" // Changed back to body2
                          sx={{
                            color: "#cccccc",
                            minWidth: isSmallScreen ? "100%" : "150px", // Increased back to 150px
                            textAlign: isSmallScreen ? "left" : "right",
                            mt: isSmallScreen ? 1 : 0,
                          }}
                        >
                          {formatTimestamp(item.timestamp)}
                        </Typography>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Grid container spacing={2.5}>
                        {" "}
                        {/* Increased spacing */}
                        {/* Basic Information */}
                        <Grid item xs={12} md={6}>
                          <Card
                            sx={{ backgroundColor: "#2a2a2a", height: "100%" }}
                          >
                            <CardContent sx={{ padding: "16px !important" }}>
                              {" "}
                              {/* Increased padding */}
                              <Typography
                                variant="h6" // Changed back to h6
                                sx={{ color: "#00dac6", mb: 2 }} // Increased margin
                              >
                                <PersonIcon
                                  sx={{
                                    mr: 1,
                                    verticalAlign: "middle",
                                    fontSize: "1.2rem", // Increased back to 1.2rem
                                  }}
                                />
                                Basic Information
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1.2, // Increased gap
                                }}
                              >
                                <Typography
                                  variant="body2" // Changed back to body2
                                  sx={{ color: "#ffffff" }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    Entity ID:
                                  </strong>{" "}
                                  {item.entityId}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#ffffff" }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    Entity Type:
                                  </strong>{" "}
                                  {item.entityType}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#ffffff" }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    User Role:
                                  </strong>{" "}
                                  {item.userRole}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#ffffff" }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    Service:
                                  </strong>{" "}
                                  {item.serviceName} v{item.serviceVersion}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#ffffff" }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    Environment:
                                  </strong>{" "}
                                  {item.environment}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#ffffff" }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    Source:
                                  </strong>{" "}
                                  {item.source}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        {/* Technical Details */}
                        <Grid item xs={12} md={6}>
                          <Card
                            sx={{ backgroundColor: "#2a2a2a", height: "100%" }}
                          >
                            <CardContent sx={{ padding: "16px !important" }}>
                              <Typography
                                variant="h6"
                                sx={{ color: "#00dac6", mb: 2 }}
                              >
                                <ComputerIcon
                                  sx={{
                                    mr: 1,
                                    verticalAlign: "middle",
                                    fontSize: "1.2rem",
                                  }}
                                />
                                Technical Details
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1.2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#ffffff" }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    Method:
                                  </strong>{" "}
                                  {item.method}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#ffffff" }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    Endpoint:
                                  </strong>{" "}
                                  {item.endpoint}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#ffffff" }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    IP Address:
                                  </strong>{" "}
                                  {item.ipAddress}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#ffffff",
                                    wordBreak: "break-all",
                                  }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    Session ID:
                                  </strong>{" "}
                                  {item.sessionId}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#ffffff",
                                    wordBreak: "break-all",
                                  }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    Correlation ID:
                                  </strong>{" "}
                                  {item.correlationId}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#ffffff" }}
                                >
                                  <strong style={{ color: "#00dac6" }}>
                                    Created At:
                                  </strong>{" "}
                                  {formatTimestamp(item.createdAt)}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        {/* User Agent */}
                        <Grid item xs={12}>
                          <Card sx={{ backgroundColor: "#2a2a2a" }}>
                            <CardContent sx={{ padding: "16px !important" }}>
                              <Typography
                                variant="h6"
                                sx={{ color: "#00dac6", mb: 2 }}
                              >
                                <LanguageIcon
                                  sx={{
                                    mr: 1,
                                    verticalAlign: "middle",
                                    fontSize: "1.2rem",
                                  }}
                                />
                                User Agent
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  wordBreak: "break-all",
                                  color: "#ffffff",
                                  lineHeight: 1.5, // Increased line height
                                }}
                              >
                                {item.userAgent}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        {/* Expense Details */}
                        {details && (
                          <Grid item xs={12}>
                            <Card sx={{ backgroundColor: "#2a2a2a" }}>
                              <CardContent sx={{ padding: "16px !important" }}>
                                <Typography
                                  variant="h6"
                                  sx={{ color: "#00dac6", mb: 2 }}
                                >
                                  <PaymentIcon
                                    sx={{
                                      mr: 1,
                                      verticalAlign: "middle",
                                      fontSize: "1.2rem",
                                    }}
                                  />
                                  Expense Details
                                </Typography>
                                <Grid container spacing={2}>
                                  {" "}
                                  {/* Increased spacing */}
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#ffffff" }}
                                    >
                                      <strong style={{ color: "#00dac6" }}>
                                        Expense Name:
                                      </strong>{" "}
                                      {details.expense?.expenseName || "N/A"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#ffffff" }}
                                    >
                                      <strong style={{ color: "#00dac6" }}>
                                        Amount:
                                      </strong>{" "}
                                      ₹{details.expense?.amount || "0"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#ffffff" }}
                                    >
                                      <strong style={{ color: "#00dac6" }}>
                                        Payment Method:
                                      </strong>{" "}
                                      {details.expense?.paymentMethod || "N/A"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#ffffff" }}
                                    >
                                      <strong style={{ color: "#00dac6" }}>
                                        Category:
                                      </strong>{" "}
                                      {details.categoryName || "N/A"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#ffffff" }}
                                    >
                                      <strong style={{ color: "#00dac6" }}>
                                        Date:
                                      </strong>{" "}
                                      {details.date || "N/A"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#ffffff" }}
                                    >
                                      <strong style={{ color: "#00dac6" }}>
                                        Type:
                                      </strong>{" "}
                                      {details.expense?.type || "N/A"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#ffffff" }}
                                    >
                                      <strong style={{ color: "#00dac6" }}>
                                        Net Amount:
                                      </strong>{" "}
                                      ₹{details.expense?.netAmount || "0"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#ffffff" }}
                                    >
                                      <strong style={{ color: "#00dac6" }}>
                                        Credit Due:
                                      </strong>{" "}
                                      ₹{details.expense?.creditDue || "0"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#ffffff" }}
                                    >
                                      <strong style={{ color: "#00dac6" }}>
                                        Include in Budget:
                                      </strong>{" "}
                                      {details.includeInBudget ? "Yes" : "No"}
                                    </Typography>
                                  </Grid>
                                  {details.expense?.comments && (
                                    <Grid item xs={12}>
                                      <Typography
                                        variant="body2"
                                        sx={{ color: "#ffffff" }}
                                      >
                                        <strong style={{ color: "#00dac6" }}>
                                          Comments:
                                        </strong>{" "}
                                        {details.expense.comments}
                                      </Typography>
                                    </Grid>
                                  )}
                                  {details.budgetIds &&
                                    details.budgetIds.length > 0 && (
                                      <Grid item xs={12}>
                                        <Typography
                                          variant="body2"
                                          sx={{ color: "#ffffff" }}
                                        >
                                          <strong style={{ color: "#00dac6" }}>
                                            Budget IDs:
                                          </strong>{" "}
                                          {details.budgetIds.join(", ")}
                                        </Typography>
                                      </Grid>
                                    )}
                                </Grid>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Fixed Pagination at Bottom */}
        {totalPages > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: 16,
              right: 16,
              backgroundColor: "#0b0b0b",
              pt: 1.5,
              borderTop: "1px solid #333333",
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="small"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#ffffff",
                    borderColor: "#333333",
                    "&:hover": {
                      backgroundColor: "#2a2a2a",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#00dac6",
                      color: "#000000",
                      "&:hover": {
                        backgroundColor: "#00b8a6",
                      },
                    },
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: "#cccccc" }}>
                Total Records: {filteredHistory.length}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default HistoryTable;
