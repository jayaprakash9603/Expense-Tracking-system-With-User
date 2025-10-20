import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import PaymentIcon from "@mui/icons-material/Payment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useFriendAccess from "../../hooks/useFriendAccess";
import useRedirectIfReadOnly from "../../hooks/useRedirectIfReadOnly";
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
  createPaymentMethod,
  fetchPaymentMethodByTargetId,
  updatePaymentMethod,
} from "../../Redux/Payment Method/paymentMethod.action";
import ToastNotification from "./ToastNotification";

// Define icon categories for better organization
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

const EditPaymentMethod = ({ onClose, onPaymentMethodCreated }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id, friendId: routeFriendId } = useParams();

  const isEditMode = !!id;

  const [paymentMethodData, setPaymentMethodData] = useState({
    name: "",
    description: "",
    type: "expense", // Default type
    amount: "",
    color: DEFAULT_CATEGORY_COLOR, // Default color
    isGlobal: false,
    selectedIconKey: null, // Add this to track selected icon
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { uncategorizedExpenses } = useSelector(
    (state) => state.categories || {}
  );
  const userId = useSelector((state) => state.auth?.user?.id);
  const [currentIconTab, setCurrentIconTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  // Derive friendId directly from route param if present
  const friendId = routeFriendId;
  const { hasWriteAccess } = useFriendAccess(friendId);
  const isPaymentMethodFlow = location.pathname.startsWith("/payment-method");
  useRedirectIfReadOnly(friendId, {
    buildFriendPath: (fid) =>
      isPaymentMethodFlow
        ? `/payment-method/${fid}`
        : `/friends/expenses/${fid}`,
    selfPath: isPaymentMethodFlow ? "/payment-method" : "/friends/expenses",
    defaultPath: isPaymentMethodFlow ? "/payment-method" : "/friends/expenses",
  });

  // Load payment method data if in edit mode
  useEffect(() => {
    const loadPaymentMethodData = async () => {
      if (!isEditMode || !id) {
        console.log("Not in edit mode or no ID provided");
        return;
      }

      console.log("Loading payment method with ID:", id);
      setLoading(true);
      setErrors({}); // Clear any previous errors

      try {
        const paymentMethodResponse = await dispatch(
          fetchPaymentMethodByTargetId(id, friendId || "")
        );

        console.log("Raw Payment Method Response:", paymentMethodResponse);

        // Handle different response structures
        let paymentMethod;
        if (paymentMethodResponse?.payload) {
          paymentMethod = paymentMethodResponse.payload;
        } else if (paymentMethodResponse?.data) {
          paymentMethod = paymentMethodResponse.data;
        } else {
          paymentMethod = paymentMethodResponse;
        }

        console.log("Processed Payment Method:", paymentMethod);

        if (!paymentMethod) {
          throw new Error("No payment method data received");
        }

        // Update state with the fetched data
        setPaymentMethodData({
          name: paymentMethod.name || "",
          description: paymentMethod.description || "",
          type: paymentMethod.type || "expense",
          amount: paymentMethod.amount?.toString() || "0",
          color: paymentMethod.color || DEFAULT_CATEGORY_COLOR,
          isGlobal: paymentMethod.global || paymentMethod.isGlobal || false,
          selectedIconKey: paymentMethod.icon || null,
        });

        console.log("Payment method data loaded successfully");
      } catch (error) {
        console.error("Error loading payment method:", error);

        // More detailed error handling
        let errorMessage = "Failed to load payment method details.";

        if (error.response) {
          // Server responded with error status
          if (error.response.status === 404) {
            errorMessage = "Payment method not found.";
          } else if (error.response.status === 403) {
            errorMessage =
              "You don't have permission to access this payment method.";
          } else if (error.response.status === 401) {
            errorMessage = "Please log in to access this payment method.";
          } else {
            errorMessage = `Server error: ${error.response.status}`;
          }
        } else if (error.request) {
          // Network error
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        setErrors({
          submit: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethodData();
  }, [dispatch, isEditMode, id, friendId]); // Added isEditMode to dependencies

  const handlePaymentMethodChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPaymentMethodData((prev) => ({
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
    setPaymentMethodData((prev) => ({
      ...prev,
      color: color,
    }));
  };

  // Add a function to handle icon selection
  const handleIconSelect = (iconKey) => {
    setPaymentMethodData((prev) => ({
      ...prev,
      selectedIconKey: iconKey,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentMethodData.name.trim()) {
      newErrors.name = "Payment method name is required";
    }

    if (paymentMethodData.name.length > 50) {
      newErrors.name = "Payment method name must be less than 50 characters";
    }

    if (!paymentMethodData.amount || isNaN(paymentMethodData.amount)) {
      newErrors.amount = "Amount is required and must be a number";
    }

    if (
      paymentMethodData.description &&
      paymentMethodData.description.length > 200
    ) {
      newErrors.description = "Description must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentMethodSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // If no icon is selected, default to "payment" icon
    const iconToUse = paymentMethodData.selectedIconKey || "payment";

    const formattedData = {
      id: isEditMode ? parseInt(id) : null,
      name: paymentMethodData.name,
      description: paymentMethodData.description,
      type: paymentMethodData.type || null,
      amount: parseInt(paymentMethodData.amount) || 0,
      icon: iconToUse,
      color: paymentMethodData.color || "",
      userIds: [],
      editUserIds: [],
      global: paymentMethodData.isGlobal,
    };

    console.log("Submitting payment method data:", formattedData);

    setIsSubmitting(true);
    setErrors({}); // Clear any previous errors

    try {
      const actionPromise = isEditMode
        ? dispatch(updatePaymentMethod(id, formattedData, friendId || ""))
        : dispatch(createPaymentMethod(formattedData, friendId || ""));

      await actionPromise;

      setShowSuccessMessage(true);

      // Call callback if provided
      if (onPaymentMethodCreated) {
        onPaymentMethodCreated();
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(-1);
      }, 200);
    } catch (error) {
      console.error("Error submitting payment method:", error);

      let errorMessage;
      if (isEditMode) {
        errorMessage = "Failed to update payment method. Please try again.";
      } else {
        errorMessage =
          error.response?.status === 409
            ? "Payment method already exists. You cannot create another."
            : "Failed to create payment method. Please try again.";
      }

      setErrors({
        submit: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePaymentMethod = () => {
    console.log("Close Payment Method clicked");
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleIconTabChange = (event, newValue) => {
    setCurrentIconTab(newValue);
  };

  // Get the icon category names for tabs
  const iconCategoryNames = Object.keys(ICON_CATEGORIES);
  // Get the icons for the current tab
  const currentTabIcons =
    ICON_CATEGORIES[iconCategoryNames[currentIconTab]] || [];

  // Show loading state
  if (loading) {
    return (
      <div className="bg-[#1b1b1b]">
        <div className="w-full sm:w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
        <div
          className="flex lg:w-[calc(100vw-370px)] flex-col justify-center items-center sm:w-full"
          style={{
            height: "calc(100vh - 100px)",
            backgroundColor: "rgb(11, 11, 11)",
            borderRadius: "8px",
            border: "1px solid rgb(0, 0, 0)",
          }}
        >
          <Typography sx={{ color: "white", fontSize: "1.2rem" }}>
            Loading payment method details...
          </Typography>
        </div>
      </div>
    );
  }

  // Show error state if there's a loading error
  if (errors.submit && isEditMode && !paymentMethodData.name) {
    return (
      <div className="bg-[#1b1b1b]">
        <div className="w-full sm:w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
        <div
          className="flex lg:w-[calc(100vw-370px)] flex-col justify-center items-center sm:w-full"
          style={{
            height: "calc(100vh - 100px)",
            backgroundColor: "rgb(11, 11, 11)",
            borderRadius: "8px",
            border: "1px solid rgb(0, 0, 0)",
            padding: "16px",
          }}
        >
          <Typography sx={{ color: "red", fontSize: "1.2rem", mb: 2 }}>
            {errors.submit}
          </Typography>
          <Button
            onClick={handleClosePaymentMethod}
            variant="contained"
            sx={{ bgcolor: "#29282b", "&:hover": { bgcolor: "#3a3a3a" } }}
          >
            Go Back
          </Button>
        </div>
      </div>
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
          marginRight: "20px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: "1px solid rgb(0, 0, 0)",
          opacity: 1,
          padding: "16px",
        }}
      >
        <div>
          <div className="w-full flex justify-between items-center mb-2">
            <p className="text-white font-extrabold text-2xl sm:text-3xl">
              {isEditMode ? "Edit Payment Method" : "Create Payment Method"}
            </p>
            <button
              onClick={handleClosePaymentMethod}
              className="px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a]"
            >
              X
            </button>
          </div>
          <hr className="border-t border-gray-600 w-full mb-2 sm:mb-4 -mt-3" />

          <Box component="form" onSubmit={handlePaymentMethodSubmit} noValidate>
            {/* Modified layout for the top fields with equal width */}
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
                value={paymentMethodData.name}
                onChange={handlePaymentMethodChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <>
                      {paymentMethodData.selectedIconKey ? (
                        React.cloneElement(
                          CATEGORY_ICONS[paymentMethodData.selectedIconKey],
                          {
                            sx: { mr: 1, color: paymentMethodData.color },
                          }
                        )
                      ) : (
                        <PaymentIcon
                          sx={{ mr: 1, color: paymentMethodData.color }}
                        />
                      )}
                    </>
                  ),
                  style: { color: "white" },
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: errors.name
                        ? "red"
                        : "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.name
                        ? "red"
                        : "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.name
                        ? "red"
                        : paymentMethodData.color,
                    },
                    color: "white",
                  },
                  "& .MuiFormHelperText-root": {
                    color: errors.name ? "red" : paymentMethodData.color,
                  },
                }}
              />

              <TextField
                multiline
                rows={1}
                id="description"
                name="description"
                placeholder="Enter description"
                value={paymentMethodData.description}
                onChange={handlePaymentMethodChange}
                error={!!errors.description}
                helperText={errors.description}
                InputProps={{
                  startAdornment: (
                    <DescriptionIcon
                      sx={{ mr: 1, color: paymentMethodData.color }}
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
                      borderColor: paymentMethodData.color,
                    },
                    color: "white",
                  },
                  "& .MuiFormHelperText-root": {
                    color: errors.description ? "red" : paymentMethodData.color,
                  },
                }}
              />

              <TextField
                required
                id="amount"
                name="amount"
                placeholder="Enter amount"
                value={paymentMethodData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    handlePaymentMethodChange(e);
                  }
                }}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: (
                    <AttachMoneyIcon
                      sx={{ mr: 1, color: paymentMethodData.color }}
                    />
                  ),
                  style: { color: "white" },
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: errors.amount
                        ? "red"
                        : "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.amount
                        ? "red"
                        : "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.amount
                        ? "red"
                        : paymentMethodData.color,
                    },
                    color: "white",
                  },
                  "& .MuiFormHelperText-root": {
                    color: errors.amount ? "red" : paymentMethodData.color,
                  },
                }}
              />

              <Autocomplete
                options={CATEGORY_TYPES}
                value={paymentMethodData.type}
                onChange={(event, newValue) => {
                  setPaymentMethodData((prev) => ({ ...prev, type: newValue }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select type"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <AttachMoneyIcon
                          sx={{ mr: 1, color: paymentMethodData.color }}
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
                          borderColor: paymentMethodData.color,
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

            {/* Payment method color and icons side by side with equal width */}
            <Grid container spacing={2} sx={{ mb: 2, mt: -1 }}>
              {/* Payment method color section */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography
                    sx={{ color: "white", mb: 1, fontSize: "0.9rem" }}
                  >
                    Select Color
                  </Typography>
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
                            paymentMethodData.color === color
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

              {/* Payment method icons section with tabs */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography
                    sx={{ color: "white", mb: 1, fontSize: "0.9rem" }}
                  >
                    Select Icon
                  </Typography>
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
                                backgroundColor: `${paymentMethodData.color}33`,
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
                                  borderRight: `6px solid ${paymentMethodData.color}`,
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
                                  borderLeft: `6px solid ${paymentMethodData.color}`,
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
                            color: paymentMethodData.color,
                          },
                          minHeight: "40px",
                          padding: "8px 12px",
                          fontSize: "0.85rem",
                        },
                        "& .MuiTabs-indicator": {
                          backgroundColor: paymentMethodData.color,
                        },
                        "& .MuiTabs-scrollButtons": {
                          color: paymentMethodData.color,
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
                          background: `${paymentMethodData.color}66`,
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          background: paymentMethodData.color,
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
                              paymentMethodData.selectedIconKey === iconKey
                                ? `2px solid ${paymentMethodData.color}`
                                : "1px solid rgba(255,255,255,0.3)",
                            cursor: "pointer",
                            "&:hover": {
                              opacity: 0.8,
                              backgroundColor: "rgba(255,255,255,0.1)",
                            },
                            backgroundColor:
                              paymentMethodData.selectedIconKey === iconKey
                                ? `${paymentMethodData.color}33`
                                : "transparent",
                            position: "relative",
                            transition: "all 0.2s ease",
                            "&::after":
                              paymentMethodData.selectedIconKey === iconKey
                                ? {
                                    content: '""',
                                    position: "absolute",
                                    bottom: "-3px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "5px",
                                    height: "5px",
                                    borderRadius: "50%",
                                    backgroundColor: paymentMethodData.color,
                                  }
                                : {},
                          }}
                        >
                          {React.cloneElement(CATEGORY_ICONS[iconKey], {
                            style: {
                              color:
                                paymentMethodData.selectedIconKey === iconKey
                                  ? paymentMethodData.color
                                  : "white",
                              fontSize: "26px",
                            },
                          })}
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
                        checked={paymentMethodData.isGlobal}
                        onChange={handlePaymentMethodChange}
                        sx={{
                          color: paymentMethodData.color,
                          "&.Mui-checked": {
                            color: paymentMethodData.color,
                          },
                        }}
                      />
                      <Typography sx={{ color: "white" }}>
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
                    bgcolor: paymentMethodData.color,
                    color: "black",
                    "&:hover": {
                      bgcolor: paymentMethodData.color,
                      opacity: 0.9,
                    },
                  }}
                >
                  {isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                    ? "Update Payment Method"
                    : "Create Payment Method"}
                </Button>
              )}
            </Box>
          </Box>
        </div>

        {/* Success message snackbar */}
        <ToastNotification
          open={showSuccessMessage}
          message={`Payment method ${
            isEditMode ? "updated" : "created"
          } successfully!`}
          onClose={() => setShowSuccessMessage(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
      </div>
    </div>
  );
};

export default EditPaymentMethod;
