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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate, useParams } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import { DataGrid } from "@mui/x-data-grid";
import {
  DEFAULT_CATEGORY_COLOR,
  CATEGORY_COLORS,
} from "../../components/constants/categoryColors";
import {
  CATEGORY_ICONS,
  CATEGORY_TYPES,
} from "../../components/constants/categoryIcons";
import {
  fetchCategoryById,
  fetchCategoryExpenses,
  updateCategory,
} from "../../Redux/Category/categoryActions";

// Import the same icon categories from CreateCategory
const ICON_CATEGORIES = {
  "Financial & Money": [
    "cash",
    "creditCard",
    "income",
    "expense",
    "wallet",
    "savings",
    "exchange",
    "invoice",
    "bills",
    "investment",
    "payment",
    "salary",
    "bitcoin",
    "ruble",
    "yen",
    "pound",
    "lira",
    "franc",
    "euro",
    "calculator",
    "barChart",
    "analytics",
    "bubbleChart",
    "atm",
  ],
  "Food & Dining": [
    "food",
    "restaurant",
    "grocery",
    "drinks",
    "coffee",
    "dessert",
    "icecream",
    "asianFood",
    "bakery",
    "dinner",
    "groceryItem",
    "foodBank",
    "brunch",
    "bento",
  ],
  "Transportation & Travel": [
    "transport",
    "travel",
    "boat",
    "bus",
    "train",
    "taxi",
    "motorcycle",
    "airplane",
    "electricCar",
    "shipping",
    "shuttle",
    "scooter",
    "busAlert",
    "parking",
  ],
  "Home & Utilities": [
    "home",
    "water",
    "electricity",
    "gas",
    "furniture",
    "chair",
    "kitchen",
    "apartment",
    "bathroom",
    "bedroom",
    "blender",
    "cables",
    "balcony",
    "doorway",
    "fireplace",
    "garage",
    "microwave",
    "nursery",
    "bedtime",
    "bungalow",
    "cabin",
    "deck",
    "lightbulb",
  ],
  "Entertainment & Leisure": [
    "entertainment",
    "television",
    "movies",
    "gaming",
    "sports",
    "music",
    "books",
    "party",
    "birthday",
    "tickets",
    "nightlife",
    "piano",
    "swimming",
    "gambling",
    "activities",
    "golf",
    "album",
    "audio",
    "stories",
    "bookmark",
    "bookOnline",
  ],
  "Shopping & Gifts": [
    "shopping",
    "clothing",
    "jewelry",
    "watch",
    "gift",
    "offers",
    "addToCart",
    "backpack",
    "luggage",
  ],
  "Health & Wellness": [
    "health",
    "medicalServices",
    "medication",
    "spa",
    "beauty",
    "haircut",
    "wellness",
    "fitness",
    "gym",
    "hiking",
    "bloodtype",
    "walker",
  ],
  "Technology & Electronics": [
    "phone",
    "internet",
    "devices",
    "computer",
    "smartphone",
    "headphones",
    "camera",
    "laptop",
    "earbuds",
    "bluetooth",
    "charging",
    "onlineEducation",
  ],
  "Education & Career": [
    "education",
    "recipe",
    "library",
    "badge",
    "business",
    "corporate",
    "briefcase",
    "architecture",
    "api",
    "biotech",
    "factory",
  ],
  "Home Maintenance & Services": [
    "gardening",
    "cleaning",
    "repairs",
    "construction",
    "tools",
    "hardware",
    "lawn",
    "carpentry",
    "laundry",
    "printing",
    "buildCircle",
    "forest",
    "farming",
  ],
  "People & Family": [
    "children",
    "pets",
    "friends",
    "family",
    "group",
    "personal",
    "elderly",
    "babyStation",
    "donation",
  ],
  "Travel & Places": [
    "beach",
    "hotel",
    "park",
    "internet2",
    "global",
    "nature",
    "anchor",
    "air",
  ],
  "Time & Planning": [
    "calendar",
    "alarm",
    "time",
    "alarmClock",
    "alarmSet",
    "timer",
    "today",
    "renew",
  ],
  "Communication & Social": [
    "announcement",
    "email",
    "mail",
    "registration",
    "archive",
    "attachment",
    "backup",
    "ballot",
    "prediction",
  ],
  "Religious & Spiritual": ["mosque", "church", "temple", "synagogue"],
  "Security & Safety": ["fireDept", "police", "legal", "balance", "bugReport"],
  Miscellaneous: [
    "other",
    "idea",
    "favorite",
    "rating",
    "awards",
    "unlimited",
    "awesome",
    "autoFix",
  ],
};

const EditCategory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, friendId } = useParams(); // Get category ID from URL

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
    (state) => state.categories || {}
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
        }
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
        expense.id === id ? { ...expense, includeInBudget: checked } : expense
      )
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

  if (initialLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#1b1b1b",
        }}
      >
        <CircularProgress sx={{ color: categoryData.color || "#1976d2" }} />
      </Box>
    );
  }

  return (
    <div className="bg-[#1b1b1b]">
      {/* <div className="w-full sm:w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}
      <div
        className="flex lg:w-[calc(100vw-370px)] flex-col justify-between sm:w-full"
        style={{
          height: "auto",
          minHeight: "calc(100vh - 100px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: "1px solid rgb(0, 0, 0)",
          opacity: 1,
          padding: "16px",
        }}
      >
        <div>
          <div className="w-full flex justify-between items-center mb-2">
            <p className="text-white font-extrabold text-2xl sm:text-3xl">
              Edit Category
            </p>
            <button
              onClick={handleCloseCategory}
              className="px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a]"
            >
              X
            </button>
          </div>
          <hr className="border-t border-gray-600 w-full mb-2 sm:mb-4 -mt-3" />

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
                    <>
                      {(() => {
                        const el =
                          categoryData.selectedIconKey &&
                          CATEGORY_ICONS[categoryData.selectedIconKey];
                        return React.isValidElement(el) ? (
                          React.cloneElement(el, {
                            sx: { mr: 1, color: categoryData.color },
                          })
                        ) : (
                          <CategoryIcon
                            sx={{ mr: 1, color: categoryData.color }}
                          />
                        );
                      })()}
                    </>
                  ),
                  style: { color: "white" },
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: categoryData.color,
                    },
                    color: "white",
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
                  style: { color: "white" },
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: categoryData.color,
                    },
                    color: "white",
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
                        "& fieldset": {
                          borderColor: "rgba(255,255,255,0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255,255,255,0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: categoryData.color,
                        },
                        color: "white",
                      },
                    }}
                  />
                )}
                sx={{
                  flex: 1,
                  "& .MuiAutocomplete-popupIndicator": {
                    color: "white",
                  },
                  "& .MuiAutocomplete-clearIndicator": {
                    color: "white",
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
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: 1,
                      p: 2,
                      height: "200px",
                      overflowY: "auto",
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
                              ? "2px solid white"
                              : "1px solid rgba(255,255,255,0.3)",
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
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: 1,
                      height: "200px",
                      display: "flex",
                      flexDirection: "column",
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
                        borderColor: "rgba(255,255,255,0.1)",
                        "& .MuiTab-root": {
                          color: "rgba(255,255,255,0.7)",
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
                          background: "rgba(255,255,255,0.05)",
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
                      {currentTabIcons.map((iconKey) => (
                        <Box
                          key={iconKey}
                          onClick={() => handleIconSelect(iconKey)}
                          sx={{
                            width: "45px",
                            height: "45px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",
                            border:
                              categoryData.selectedIconKey === iconKey
                                ? `2px solid ${categoryData.color}`
                                : "1px solid rgba(255,255,255,0.3)",
                            cursor: "pointer",
                            "&:hover": {
                              opacity: 0.8,
                              backgroundColor: "rgba(255,255,255,0.1)",
                            },
                            backgroundColor:
                              categoryData.selectedIconKey === iconKey
                                ? `${categoryData.color}33`
                                : "transparent",
                            position: "relative",
                            transition: "all 0.2s ease",
                            "&::after":
                              categoryData.selectedIconKey === iconKey
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
                          {(() => {
                            const el = CATEGORY_ICONS[iconKey];
                            if (React.isValidElement(el)) {
                              return React.cloneElement(el, {
                                style: {
                                  color:
                                    categoryData.selectedIconKey === iconKey
                                      ? categoryData.color
                                      : "white",
                                  fontSize: "26px",
                                },
                              });
                            }
                            return (
                              <CategoryIcon
                                sx={{
                                  color:
                                    categoryData.selectedIconKey === iconKey
                                      ? categoryData.color
                                      : "white",
                                  fontSize: "26px",
                                }}
                              />
                            );
                          })()}
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
                      <Typography sx={{ color: "white" }}>
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
                  <Box sx={{ height: 320, width: "100%" }}>
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
