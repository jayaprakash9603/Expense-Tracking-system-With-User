import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCategory } from "../../Redux/Category/categoryActions";
import { getExpensesAction } from "../../Redux/Expenses/expense.action";
import { useTheme } from "../../hooks/useTheme";
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
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import PageHeader from "../../components/PageHeader";
import Autocomplete from "@mui/material/Autocomplete";
import { DataGrid } from "@mui/x-data-grid";
import { ExpenseListTable } from "../../components/common/ExpenseListTable/ExpenseListTable";
import { useStandardExpenseColumns } from "../../hooks/useStandardExpenseColumns";
import {
  DEFAULT_CATEGORY_COLOR,
  CATEGORY_COLORS,
} from "../../components/constants/categoryColors";
import {
  CATEGORY_EMOJIS,
  DEFAULT_CATEGORY_EMOJI,
  CATEGORY_TYPES,
} from "../../components/constants/CategoryEmojis";

// Use emoji categories from constants
const ICON_CATEGORIES = CATEGORY_EMOJIS;

const CreateCategory = ({ onClose, onCategoryCreated }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { friendId } = useParams();
  const location = useLocation();
  const { hasWriteAccess } = useFriendAccess(friendId);
  // Determine if we are in category-flow (starts with /category-flow)
  const isCategoryFlow = location.pathname.startsWith("/category-flow");
  // Redirect rules:
  // If in category-flow and read-only: /category-flow/:friendId else /category-flow
  // Else fallback to expenses listing pattern used elsewhere
  useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) =>
      isCategoryFlow ? `/category-flow/${fid}` : `/friends/expenses/${fid}`,
    selfPath: isCategoryFlow ? "/category-flow" : "/friends/expenses",
    defaultPath: isCategoryFlow ? "/category-flow" : "/friends/expenses",
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
  const { expenses } = useSelector((state) => state.expenses || {});
  const userId = useSelector((state) => state.auth?.user?.id);
  const [currentIconTab, setCurrentIconTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Fetch all expenses when component mounts
    dispatch(getExpensesAction("desc", friendId || ""));
  }, [dispatch, friendId]);

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
      newErrors.name = "Category name is required";
    }

    if (categoryData.name.length > 50) {
      newErrors.name = "Category name must be less than 50 characters";
    }

    if (categoryData.description && categoryData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!hasWriteAccess) return; // safety block

    if (!validateForm()) {
      return;
    }

    // If no icon is selected, default to folder emoji
    const iconToUse = categoryData.selectedIconKey || DEFAULT_CATEGORY_EMOJI;

    const formattedData = {
      id: null, // Assuming ID is generated server-side
      name: categoryData.name,
      description: categoryData.description,
      type: categoryData.type || null,
      icon: iconToUse, // Use selected icon or default to "other"
      color: categoryData.color || "",
      expenseIds: {
        [friendId ? friendId : userId]: categoryData.selectedExpenses,
      },
      userIds: [],
      editUserIds: [],
      global: categoryData.isGlobal,
    };

    setIsSubmitting(true);

    // Dispatch the action and handle the response
    dispatch(createCategory(formattedData, friendId || ""))
      .then(() => {
        setShowSuccessMessage(true);

        // Navigate back after a short delay
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      })
      .catch((error) => {
        // Display the actual error message from the server
        const errorMessage =
          error.message || "Failed to create category. Please try again.";
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

  const standardColumns = useStandardExpenseColumns(null, navigate, {
    includeActions: false,
  });

  const columns = React.useMemo(() => {
    const baseColumns = standardColumns;

    const typeCol = {
      key: "type",
      label: "Type",
      width: "100px",
      value: (row) => row.expense?.type || row.type || "-",
      render: (v) => v,
    };

    const paymentCol = {
      key: "paymentMethod",
      label: "Payment Method",
      width: "140px",
      value: (row) => row.expense?.paymentMethod || row.paymentMethod || "-",
      render: (v) => v,
    };

    const newColumns = [...baseColumns];
    // Try to insert before comments
    const commentsIdx = newColumns.findIndex((c) => c.key === "comments");
    if (commentsIdx >= 0) {
      newColumns.splice(commentsIdx, 0, typeCol, paymentCol);
    } else {
      newColumns.push(typeCol, paymentCol);
    }
    return newColumns;
  }, [standardColumns]);

  // Get the icon category names for tabs
  const iconCategoryNames = Object.keys(ICON_CATEGORIES);
  // Get the icons for the current tab
  const currentTabIcons =
    ICON_CATEGORIES[iconCategoryNames[currentIconTab]] || [];

  return (
    <div style={{ backgroundColor: colors.primary_bg }}>
      {/* <div className="w-full sm:w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}
      <div
        className="flex lg:w-[calc(100vw-370px)] flex-col justify-between sm:w-full"
        style={{
          height: "auto",
          minHeight: "calc(100vh - 100px)",
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: `1px solid ${colors.border_color}`,
          opacity: 1,
          marginRight: "20px",
          padding: "16px",
          "--pm-text-primary": colors.primary_text,
          "--pm-text-secondary": colors.secondary_text,
          "--pm-text-tertiary": colors.secondary_text,
          "--pm-bg-primary": colors.active_bg,
          "--pm-bg-secondary": colors.secondary_bg,
          "--pm-border-color": colors.border_color,
          "--pm-accent-color": categoryData.color || colors.primary_accent,
          "--pm-hover-bg": colors.hover_bg,
          "--pm-scrollbar-thumb": categoryData.color || colors.primary_accent,
          "--pm-scrollbar-track": colors.secondary_bg,
        }}
      >
        <div>
          <PageHeader
            title="Create New Category"
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
                placeholder="Enter category name"
                value={categoryData.name}
                onChange={handleCategoryChange}
                error={!!errors.name}
                helperText={errors.name}
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
                        Make this a global category (available to all users)
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={handleShowExpenses}
                      startIcon={showExpenses ? <CloseIcon /> : <AddIcon />}
                      sx={{
                        color: categoryData.color,
                        borderColor: categoryData.color,
                        "&:hover": {
                          borderColor: categoryData.color,
                          backgroundColor: `${categoryData.color}33`,
                        },
                      }}
                    >
                      {showExpenses ? "Hide Expenses" : "Link Expenses"}
                    </Button>
                  </Box>
                </FormControl>
              </Grid>

              {showExpenses && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ width: "100%", overflow: "hidden" }}>
                    <ExpenseListTable
                      rows={expenses || []}
                      columns={columns}
                      enableSelection={true}
                      selectedRows={categoryData.selectedExpenses || []}
                      onSelectionChange={(newIds) => {
                        setCategoryData((prev) => ({
                          ...prev,
                          selectedExpenses: newIds,
                        }));
                      }}
                      showPagination={true}
                    />
                  </Box>
                </Grid>
              )}
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
                  {isSubmitting ? "Creating..." : "Create Category"}
                </Button>
              )}
            </Box>
          </Box>
        </div>

        {/* Success message snackbar */}
        <Snackbar
          open={showSuccessMessage}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={() => setShowSuccessMessage(false)}
        >
          <Alert
            severity="success"
            sx={{
              width: "100%",
              backgroundColor: categoryData.color,
              color: "black",
              "& .MuiAlert-icon": {
                color: "black",
              },
            }}
          >
            Category created successfully!
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default CreateCategory;
