import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

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
  CircularProgress,
  Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
import PageHeader from "../../components/PageHeader";
import CategoryEditSkeleton from "../../components/Loaders/CategoryEditSkeleton";
import Autocomplete from "@mui/material/Autocomplete";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "../../hooks/useTheme";
import {
  DEFAULT_CATEGORY_COLOR,
  CATEGORY_COLORS,
} from "../../components/constants/categoryColors";
import {
  CATEGORY_EMOJIS,
  DEFAULT_CATEGORY_EMOJI,
  CATEGORY_TYPES,
} from "../../components/constants/CategoryEmojis";
import {
  fetchCategoryById,
  fetchCategoryExpenses,
  updateCategory,
} from "../../Redux/Category/categoryActions";

// Use emoji categories from constants
const ICON_CATEGORIES = CATEGORY_EMOJIS;

const EditCategory = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, friendId } = useParams(); // Get category ID from URL
  const location = useLocation();
  const { hasWriteAccess } = useFriendAccess(friendId);
  const isCategoryFlow = location.pathname.startsWith("/category-flow");
  useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) =>
      isCategoryFlow ? `/category-flow/${fid}` : `/friends/expenses/${fid}`,
    selfPath: isCategoryFlow ? "/category-flow" : "/friends/expenses",
    defaultPath: isCategoryFlow ? "/category-flow" : "/friends/expenses",
  });

  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
    type: "Expense",
    color: DEFAULT_CATEGORY_COLOR,
    isGlobal: false,
    selectedExpenses: [],
    selectedIconKey: null,
  });
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [errors, setErrors] = useState({});
  const [showExpenses, setShowExpenses] = useState(false);
  const [currentIconTab, setCurrentIconTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [localExpenses, setLocalExpenses] = useState([]);
  const { currentCategory, categoryExpenses } = useSelector(
    (state) => state.categories || {},
  );
  const userId = useSelector((state) => state.auth?.user?.id);

  // Fetch category data when component mounts
  // Fetch category data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        await dispatch(fetchCategoryById(id, friendId || ""));
        // Remove the fetchCategoryExpenses call from here
        await dispatch(fetchCategoryExpenses(id, 1, 1000, friendId || ""));
      } catch (error) {
        console.error("Error fetching category data:", error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          fetch: "Failed to load category data. Please try again.",
        }));
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update local state when category data is fetched
  useEffect(() => {
    if (currentCategory) {
      setCategoryData({
        name: currentCategory.name || "",
        description: currentCategory.description || "",
        type: currentCategory.type || "Expense",
        color: currentCategory.color || DEFAULT_CATEGORY_COLOR,
        isGlobal: currentCategory.global || false,
        selectedExpenses: currentCategory.expenseIds?.[userId] || [],
        selectedIconKey: currentCategory.icon || null,
      });
    }
  }, [currentCategory, userId]);
  useEffect(() => {
    if (categoryExpenses) {
      setLocalExpenses(categoryExpenses);
    }
  }, [categoryExpenses]);

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

  const handleColorChange = (color) => {
    setCategoryData((prev) => ({
      ...prev,
      color: color,
    }));
  };

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
    if (!hasWriteAccess) return; // safety

    if (!validateForm()) {
      return;
    }

    // If no icon is selected, default to "other" icon
    const iconToUse = categoryData.selectedIconKey || "other";

    // Collect all checked IDs for includeInBudget
    const checkedIds = localExpenses
      .filter((expense) => expense.includeInBudget)
      .map((expense) => expense.id);

    const formattedData = {
      id: parseInt(id), // Use the ID from URL
      name: categoryData.name,
      description: categoryData.description,
      type: categoryData.type || null,
      icon: iconToUse,
      color: categoryData.color || "",
      expenseIds: {
        [friendId ? friendId : userId]: checkedIds,
      },
      userIds: currentCategory.userIds || [],
      editUserIds: currentCategory.editUserIds || [],
      global: categoryData.isGlobal,
    };

    setIsSubmitting(true);

    // Dispatch the update action
    dispatch(updateCategory(id, formattedData, friendId || ""))
      .then(() => {
        setShowSuccessMessage(true);

        // Navigate back after a short delay
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      })
      .catch((error) => {
        setErrors({
          ...errors,
          submit: "Failed to update category. Please try again.",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleShowExpenses = () => {
    if (true == true) {
      setLoadingExpenses(true);
      dispatch(fetchCategoryExpenses(id, 1, 1000, friendId || "")).finally(
        () => {
          setLoadingExpenses(false);
        },
      );
    }
    setShowExpenses(!showExpenses);
  };
  const handleCloseCategory = () => {
    navigate(-1);
  };

  const handleIconTabChange = (event, newValue) => {
    setCurrentIconTab(newValue);
  };
  const handleIncludeInBudgetChange = (id, checked) => {
    setLocalExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.id === id ? { ...expense, includeInBudget: checked } : expense,
      ),
    );
  };
  // Prepare data for the DataGrid
  const columns = [
    {
      field: "includeInBudget",
      headerName: "Include in Budget",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.includeInBudget || false}
          onChange={(event) =>
            handleIncludeInBudgetChange(params.row.id, event.target.checked)
          }
        />
      ),
    },
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

  const rows =
    localExpenses?.map((expense, index) => ({
      id: expense.id || index,
      date: expense.date || "N/A",
      expenseName: expense.expense.expenseName || "N/A",
      amount: expense.expense.amount || 0,
      type: expense.expense.type || "N/A",
      paymentMethod: expense.expense.paymentMethod || "N/A",
      comments: expense.expense.comments || "N/A",
      includeInBudget: expense.includeInBudget || false,
    })) || [];

  // Get the icon category names for tabs
  const iconCategoryNames = Object.keys(ICON_CATEGORIES);
  // Get the icons for the current tab
  const currentTabIcons =
    ICON_CATEGORIES[iconCategoryNames[currentIconTab]] || [];

  if (initialLoading) return <CategoryEditSkeleton />;

  return (
    <div style={{ backgroundColor: colors.secondary_bg }}>
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
        }}
      >
        <div>
          <PageHeader
            title="Edit Category"
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
                      height: "200px",
                      overflowY: "auto",
                      backgroundColor: colors.secondary_bg,
                    }}
                  >
                    {CATEGORY_COLORS.map((color) => (
                      <Box
                        key={color}
                        onClick={() => handleColorChange(color)}
                        sx={{
                          width: 32,
                          height: 32,
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
                      height: "200px",
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
                              height: 40,
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
                          minHeight: "40px",
                          padding: "8px 12px",
                          fontSize: "0.85rem",
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
                        p: 1.5,
                        overflowY: "auto",
                        flex: 1,
                        "&::-webkit-scrollbar": {
                          width: "6px",
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
                      {showExpenses ? "Hide Expenses" : "View Expenses"}
                    </Button>
                  </Box>
                </FormControl>
              </Grid>

              {showExpenses && (
                <Grid item xs={12} sx={{ mt: 0 }}>
                  <Box
                    sx={{
                      height: 320,
                      width: "100%",
                      "& .MuiDataGrid-root": {
                        backgroundColor: colors.secondary_bg,
                        color: colors.primary_text,
                        border: `1px solid ${colors.border_color}`,
                      },
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.tertiary_bg,
                        color: colors.primary_text,
                      },
                      "& .MuiDataGrid-cell": {
                        borderColor: colors.border_color,
                      },
                      "& .MuiCheckbox-root": {
                        color: `${colors.primary_accent} !important`,
                      },
                      "& .MuiDataGrid-row": {
                        "&:hover": {
                          backgroundColor: colors.hover_bg,
                        },
                      },
                    }}
                  >
                    <DataGrid
                      rows={rows || []}
                      columns={columns}
                      initialState={{
                        pagination: {
                          paginationModel: { pageSize: 5, page: 0 },
                        },
                      }}
                      pageSizeOptions={[5, 10, 20]}
                      rowHeight={42}
                      disableSelectionOnClick
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
                  {isSubmitting ? "Updating..." : "Update Category"}
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
            Category updated successfully!
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default EditCategory;
