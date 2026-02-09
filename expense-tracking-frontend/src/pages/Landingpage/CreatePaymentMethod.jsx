import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUncategorizedExpenses,
  createCategory,
} from "../../Redux/Category/categoryActions";
import { getProfileAction } from "../../Redux/Auth/auth.action";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  Checkbox,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import PageHeader from "../../components/PageHeader";
import { useTheme } from "../../hooks/useTheme";
import Autocomplete from "@mui/material/Autocomplete";
import { DataGrid } from "@mui/x-data-grid";
import {
  DEFAULT_CATEGORY_COLOR,
  CATEGORY_COLORS,
} from "../../components/constants/categoryColors";
import {
  CATEGORY_EMOJIS,
  DEFAULT_CATEGORY_EMOJI,
  CATEGORY_TYPES,
} from "../../components/constants/CategoryEmojis";
import { createPaymentMethod } from "../../Redux/Payment Method/paymentMethod.action";
import ToastNotification from "./ToastNotification";

// Use emoji categories from constants
const ICON_CATEGORIES = CATEGORY_EMOJIS;

const CreatePaymentMethod = ({ onClose, onCategoryCreated }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { friendId } = useParams();
  const location = useLocation();
  const { hasWriteAccess } = useFriendAccess(friendId);
  // Determine if we are in payment-method flow (starts with /payment-method)
  const isPaymentMethodFlow = location.pathname.startsWith("/payment-method");
  // Redirect if read-only (no write access)
  useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) =>
      isPaymentMethodFlow
        ? `/payment-method/${fid}`
        : `/friends/expenses/${fid}`,
    selfPath: isPaymentMethodFlow ? "/payment-method" : "/friends/expenses",
    defaultPath: isPaymentMethodFlow ? "/payment-method" : "/friends/expenses",
  });
  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
    type: "Expense", // Default type
    color: DEFAULT_CATEGORY_COLOR, // Default color
    isGlobal: false,
    selectedExpenses: [],
    selectedIconKey: null, // Add this to track selected icon
  });
  const [errors, setErrors] = useState({});
  const [showExpenses, setShowExpenses] = useState(false);
  const { uncategorizedExpenses } = useSelector(
    (state) => state.categories || {},
  );
  const userId = useSelector((state) => state.auth?.user?.id);
  const [currentIconTab, setCurrentIconTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Fetch uncategorized expenses when component mounts
    dispatch(fetchUncategorizedExpenses(friendId || ""));
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      dispatch(getProfileAction(token));
    }
  }, [dispatch]);

  const handleCategoryChange = (e) => {
    const { name, value, checked, type } = e.target;
    setCategoryData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Update the handleColorChange function to apply the selected color only to the icon and button
  const handleColorChange = (color) => {
    setCategoryData((prev) => ({
      ...prev,
      color: color,
    }));
  };

  // Add a function to handle icon selection
  const handleIconSelect = (iconKey) => {
    setCategoryData((prev) => ({
      ...prev,
      selectedIconKey: iconKey,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!categoryData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (categoryData.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!categoryData.amount || isNaN(categoryData.amount)) {
      newErrors.amount = "Amount is required and must be a number";
    }

    if (categoryData.description && categoryData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // If no icon is selected, default to "other" icon
    const iconToUse = categoryData.selectedIconKey || "other";

    const formattedData = {
      id: null, // Assuming ID is generated server-side
      name: categoryData.name,
      description: categoryData.description,
      type: categoryData.type || null,
      icon: iconToUse, // Use selected icon or default to "other"
      color: categoryData.color || "",
      userIds: [],
      editUserIds: [],
      global: categoryData.isGlobal,
    };

    setIsSubmitting(true);

    // Dispatch the action and handle the response
    dispatch(createPaymentMethod(formattedData, friendId || ""))
      .then(() => {
        setShowSuccessMessage(true);

        // Navigate back after a short delay
        setTimeout(() => {
          navigate(-1);
        }, 200);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.status === 409
            ? "Payment method already exists. You cannot create another."
            : "Failed to create Payment method. Please try again.";
        setErrors({
          ...errors,
          submit: errorMessage,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleShowExpenses = () => {
    setShowExpenses(!showExpenses);
  };

  const handleCloseCategory = () => {
    console.log("Close Category clicked");
    navigate(-1);
  };

  const handleIconTabChange = (event, newValue) => {
    setCurrentIconTab(newValue);
  };

  const columns = [
    { field: "date", headerName: "Date", flex: 1, minWidth: 80 },
    {
      field: "expenseName",
      headerName: "Expense Name",
      flex: 1,
      minWidth: 120,
    },
    { field: "amount", headerName: "Amount", flex: 1, minWidth: 80 },
    { field: "type", headerName: "Type", flex: 1, minWidth: 80 },
    {
      field: "paymentMethod",
      headerName: "Payment Method",
      flex: 1,
      minWidth: 120,
    },
    { field: "comments", headerName: "Comments", flex: 1, minWidth: 120 },
  ];

  const rows = uncategorizedExpenses?.map((expense, index) => ({
    id: index,
    date: expense.date,
    expenseName: expense.expense.expenseName,
    amount: expense.expense.amount,
    type: expense.expense.type,
    paymentMethod: expense.expense.paymentMethod,
    comments: expense.expense.comments,
  }));

  // Get the icon category names for tabs
  const iconCategoryNames = Object.keys(ICON_CATEGORIES);
  // Get the icons for the current tab
  const currentTabIcons =
    ICON_CATEGORIES[iconCategoryNames[currentIconTab]] || [];

  return (
    <div style={{ backgroundColor: colors.secondary_bg }}>
      {/* <div className="w-full sm:w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}
      <div
        className="flex lg:w-[calc(100vw-370px)] flex-col justify-between sm:w-full"
        style={{
          height: "auto",
          minHeight: "calc(100vh - 100px)",
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          marginRight: "20px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: `1px solid ${colors.border_color}`,
          opacity: 1,
          padding: "16px",
        }}
      >
        <div>
          <PageHeader
            title="Create Payment Method"
            onClose={handleCloseCategory}
            titleClassName="font-extrabold text-2xl sm:text-3xl"
          />

          <Box component="form" onSubmit={handleCategorySubmit} noValidate>
            {/* Modified layout for the top three fields with equal width */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                required
                id="name"
                name="name"
                placeholder="Enter payment method name"
                value={categoryData.name}
                onChange={handleCategoryChange}
                error={!!errors.name}
                InputProps={{
                  startAdornment: (
                    <span style={{ marginRight: 8, fontSize: "1.5rem" }}>
                      {categoryData.selectedIconKey || DEFAULT_CATEGORY_EMOJI}
                    </span>
                  ),
                  style: { color: colors.primary_text },
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: colors.secondary_bg,
                    "& fieldset": {
                      borderColor: errors.name ? "red" : colors.border_color,
                    },
                    "&:hover fieldset": {
                      borderColor: errors.name ? "red" : colors.border_color,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.name ? "red" : categoryData.color,
                    },
                    color: colors.primary_text,
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: colors.icon_muted,
                    opacity: 1,
                  },
                }}
              />

              <TextField
                multiline
                rows={1}
                id="description"
                name="description"
                placeholder="Enter description"
                value={categoryData.description}
                onChange={handleCategoryChange}
                error={!!errors.description}
                helperText={errors.description}
                InputProps={{
                  startAdornment: (
                    <DescriptionIcon
                      sx={{ mr: 1, color: categoryData.color }}
                    />
                  ),
                  style: { color: colors.primary_text },
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: colors.secondary_bg,
                    "& fieldset": {
                      borderColor: colors.border_color,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.border_color,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: categoryData.color,
                    },
                    color: colors.primary_text,
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: colors.icon_muted,
                    opacity: 1,
                  },
                  "& .MuiFormHelperText-root": {
                    color: categoryData.color,
                  },
                }}
              />

              <TextField
                required
                id="amount"
                name="amount"
                placeholder="Enter amount"
                value={categoryData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    handleCategoryChange(e);
                  }
                }}
                error={!!errors.amount}
                InputProps={{
                  startAdornment: (
                    <AttachMoneyIcon
                      sx={{ mr: 1, color: categoryData.color }}
                    />
                  ),
                  style: { color: colors.primary_text },
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: colors.secondary_bg,
                    "& fieldset": {
                      borderColor: errors.amount ? "red" : colors.border_color,
                    },
                    "&:hover fieldset": {
                      borderColor: errors.amount ? "red" : colors.border_color,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.amount ? "red" : categoryData.color,
                    },
                    color: colors.primary_text,
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: colors.icon_muted,
                    opacity: 1,
                  },
                  "& .MuiFormHelperText-root": {
                    color: categoryData.color,
                  },
                }}
              />

              <Autocomplete
                options={CATEGORY_TYPES}
                value={categoryData.type}
                onChange={(event, newValue) => {
                  setCategoryData((prev) => ({ ...prev, type: newValue }));
                }}
                componentsProps={{
                  paper: {
                    sx: {
                      backgroundColor: colors.secondary_bg,
                      color: colors.primary_text,
                      "& .MuiAutocomplete-option": {
                        "&:hover": {
                          backgroundColor: colors.hover_bg,
                        },
                        "&[aria-selected='true']": {
                          backgroundColor: colors.hover_bg,
                        },
                      },
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select type"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <AttachMoneyIcon
                          sx={{ mr: 1, color: categoryData.color }}
                        />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: colors.secondary_bg,
                        "& fieldset": {
                          borderColor: colors.border_color,
                        },
                        "&:hover fieldset": {
                          borderColor: colors.border_color,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: categoryData.color,
                        },
                        color: colors.primary_text,
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: colors.icon_muted,
                        opacity: 1,
                      },
                    }}
                  />
                )}
                sx={{
                  flex: 1,
                  "& .MuiAutocomplete-popupIndicator": {
                    color: colors.icon_muted,
                  },
                  "& .MuiAutocomplete-clearIndicator": {
                    color: colors.icon_muted,
                  },
                }}
              />
            </Box>

            {/* Category color and icons side by side with equal width */}
            <Grid container spacing={2} sx={{ mb: 2, mt: -1 }}>
              {/* Category color section */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      border: `1px solid ${colors.border_color}`,
                      borderRadius: 1,
                      p: 2,
                      height: "200px", // Reduced from 250px
                      overflowY: "auto",
                      backgroundColor: colors.secondary_bg,
                    }}
                  >
                    {CATEGORY_COLORS.map((color) => (
                      <Box
                        key={color}
                        onClick={() => handleColorChange(color)}
                        sx={{
                          width: 32, // Slightly smaller color circles
                          height: 32, // Slightly smaller color circles
                          bgcolor: color,
                          borderRadius: "50%",
                          cursor: "pointer",
                          border:
                            categoryData.color === color
                              ? `3px solid ${colors.primary_text}`
                              : `1px solid ${colors.border_color}`,
                          "&:hover": {
                            opacity: 0.8,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </FormControl>
              </Grid>

              {/* Category icons section with tabs */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Box
                    sx={{
                      border: `1px solid ${colors.border_color}`,
                      borderRadius: 1,
                      height: "200px", // Reduced from 250px
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: colors.secondary_bg,
                    }}
                  >
                    {/* Icon category tabs with custom scroll buttons */}
                    <Tabs
                      value={currentIconTab}
                      onChange={handleIconTabChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      ScrollButtonComponent={(props) => {
                        const { direction, ...other } = props;
                        return (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "rgba(0,0,0,0.3)",
                              borderRadius:
                                direction === "left"
                                  ? "0 4px 0 0"
                                  : "4px 0 0 0",
                              width: 28,
                              height: 40, // Reduced from 48px
                              "&:hover": {
                                backgroundColor: `${categoryData.color}33`,
                              },
                              transition: "background-color 0.3s",
                            }}
                            {...other}
                          >
                            {direction === "left" ? (
                              <Box
                                component="div"
                                sx={{
                                  width: 0,
                                  height: 0,
                                  borderTop: "6px solid transparent",
                                  borderBottom: "6px solid transparent",
                                  borderRight: `6px solid ${categoryData.color}`,
                                }}
                              />
                            ) : (
                              <Box
                                component="div"
                                sx={{
                                  width: 0,
                                  height: 0,
                                  borderTop: "6px solid transparent",
                                  borderBottom: "6px solid transparent",
                                  borderLeft: `6px solid ${categoryData.color}`,
                                }}
                              />
                            )}
                          </Box>
                        );
                      }}
                      sx={{
                        borderBottom: 1,
                        borderColor: colors.border_color,
                        "& .MuiTab-root": {
                          color: colors.icon_muted,
                          "&.Mui-selected": {
                            color: categoryData.color,
                          },
                          minHeight: "40px", // Reduced from 48px
                          padding: "8px 12px", // Reduced padding
                          fontSize: "0.85rem", // Smaller font size
                        },
                        "& .MuiTabs-indicator": {
                          backgroundColor: categoryData.color,
                        },
                        "& .MuiTabs-scrollButtons": {
                          color: categoryData.color,
                          "&.Mui-disabled": {
                            opacity: 0.3,
                          },
                        },
                      }}
                    >
                      {iconCategoryNames.map((category, index) => (
                        <Tab
                          key={index}
                          label={category}
                          sx={{
                            textTransform: "none",
                            fontWeight:
                              currentIconTab === index ? "bold" : "normal",
                            transition: "all 0.2s",
                          }}
                        />
                      ))}
                    </Tabs>

                    {/* Icons for the selected category */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        p: 1.5, // Reduced padding
                        overflowY: "auto",
                        flex: 1,
                        "&::-webkit-scrollbar": {
                          width: "6px", // Thinner scrollbar
                        },
                        "&::-webkit-scrollbar-track": {
                          background: colors.hover_bg,
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: `${categoryData.color}66`,
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          background: categoryData.color,
                        },
                      }}
                    >
                      {currentTabIcons.map((emoji, idx) => (
                        <Box
                          key={idx}
                          onClick={() => handleIconSelect(emoji)}
                          sx={{
                            width: "45px",
                            height: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",
                            border:
                              categoryData.selectedIconKey === emoji
                                ? `2px solid ${categoryData.color}`
                                : `1px solid ${colors.border_color}`,
                            cursor: "pointer",
                            "&:hover": {
                              opacity: 0.8,
                              backgroundColor: colors.hover_bg,
                            },
                            backgroundColor:
                              categoryData.selectedIconKey === emoji
                                ? `${categoryData.color}33`
                                : "transparent",
                            position: "relative",
                            transition: "all 0.2s ease",
                            "&::after":
                              categoryData.selectedIconKey === emoji
                                ? {
                                    content: '""',
                                    position: "absolute",
                                    bottom: "-3px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "5px",
                                    height: "5px",
                                    borderRadius: "50%",
                                    backgroundColor: categoryData.color,
                                  }
                                : {},
                          }}
                        >
                          <span style={{ fontSize: "24px" }}>{emoji}</span>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox
                        id="isGlobal"
                        name="isGlobal"
                        checked={categoryData.isGlobal}
                        onChange={handleCategoryChange}
                        sx={{
                          color: categoryData.color,
                          "&.Mui-checked": {
                            color: categoryData.color,
                          },
                        }}
                      />
                      <Typography sx={{ color: colors.primary_text }}>
                        Make this a global payment method (available to all
                        users)
                      </Typography>
                    </Box>
                  </Box>
                </FormControl>
              </Grid>
            </Grid>

            {errors.submit && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {errors.submit}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 3,
                gap: 2,
              }}
            >
              {hasWriteAccess && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    bgcolor: categoryData.color,
                    color: "black",
                    "&:hover": {
                      bgcolor: categoryData.color,
                      opacity: 0.9,
                    },
                  }}
                >
                  {isSubmitting ? "Creating..." : "Create Payment Method"}
                </Button>
              )}
            </Box>
          </Box>
        </div>

        {/* Success message snackbar */}
        <ToastNotification
          open={showSuccessMessage}
          message="Payment method created successfully!"
          onClose={() => setShowSuccessMessage(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
      </div>
    </div>
  );
};

export default CreatePaymentMethod;
