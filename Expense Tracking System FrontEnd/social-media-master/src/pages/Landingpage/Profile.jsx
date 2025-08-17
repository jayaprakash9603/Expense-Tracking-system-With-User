import AdvancedBudgetManagementTab from "./AdvancedBudgetManagementTab";

import FinancialTab from "./FinancialTab";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Avatar,
  Button,
  TextField,
  IconButton,
  Typography,
  Grid,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel as MuiFormControlLabel,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Box,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  PhotoCamera,
  Edit,
  Save,
  Cancel,
  Settings,
  LocationOn,
  Work,
  School,
  Cake,
  Phone,
  Email,
  Language,
  Security,
  Notifications,
  Visibility,
  VerifiedUser,
  TrendingUp,
  AccountBalance,
  CreditCard,
  Timeline,
  MonetizationOn,
  Receipt,
  Category,
  PieChart,
  BarChart,
  CalendarToday,
  AttachMoney,
  Savings,
  TrendingDown,
  Warning,
  CheckCircle,
  Star,
  EmojiEvents,
  LocalAtm,
  CreditScore,
  AccountBalanceWallet,
  PaymentIcon,
  ShoppingCart,
  Restaurant,
  DirectionsCar,
  Home,
  HealthAndSafety,
  School as EducationIcon,
  SportsEsports,
  ExpandMore,
  Add,
  Remove,
  Download,
  Upload,
  Sync,
  CloudUpload,
  FileDownload,
  Analytics,
  Dashboard,
  Report,
  Schedule,
  AlarmOn,
  NotificationsActive,
  SmartToy,
  Psychology,
  Lightbulb,
  AutoGraph,
  CompareArrows,
  SwapHoriz,
  TrendingFlat,
  Person,
  Close,
  Business,
  Description,
  Favorite,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  updateProfileAction,
  getProfileAction,
  resetCloudinaryState,
  uploadToCloudinary,
} from "../../Redux/Auth/auth.action";
import PersonalInfoTab from "./PersonalInfoTab";
import AnalyticsDashboard from "./AnalyticsDashboard";

const Profile = () => {
  const {
    user,
    error: authError,
    imageUrl,
    loading: uploading,
    error: cloudinaryError,
  } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    gender: "",
    bio: "",
    website: "",
    phoneNumber: "",
    location: "",
    image: "",
    dateOfBirth: "",
    occupation: "",
    company: "",
    education: "",
    interests: [],
    socialLinks: {
      linkedin: "",
      twitter: "",
      github: "",
      instagram: "",
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      profileVisibility: "public",
      twoFactorAuth: false,
      darkMode: true,
      currency: "USD",
      budgetAlerts: true,
      expenseReminders: true,
      weeklyReports: true,
      monthlyReports: true,
      autoSync: true,
      smartInsights: true,
    },
    financialProfile: {
      monthlyIncome: 5000,
      primaryBank: "Chase Bank",
      creditScore: 750,
      riskTolerance: "moderate",
      investmentGoals: [],
      retirementAge: 65,
      emergencyFundGoal: 15000,
      debtToIncomeRatio: 25,
    },
    budgetSettings: {
      budgetMethod: "50/30/20", // 50/30/20, zero-based, envelope
      budgetPeriod: "monthly", // weekly, monthly, yearly
      rolloverUnused: true,
      strictMode: false,
      autoAdjust: true,
    },
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  // Enhanced dummy data for expense tracking features
  const dummyStats = {
    totalExpenses: 15420.5,
    monthlyBudget: 5000,
    savingsGoal: 25000,
    currentSavings: 18750,
    creditScore: 750,
    monthlyIncome: 6500,
    totalDebts: 12000,
    investmentValue: 45000,
    emergencyFund: 8500,
    expenseCategories: [
      {
        name: "Food & Dining",
        amount: 2340,
        percentage: 35,
        budget: 1500,
        icon: <Restaurant />,
        color: "#ff6b6b",
      },
      {
        name: "Transportation",
        amount: 1560,
        percentage: 23,
        budget: 800,
        icon: <DirectionsCar />,
        color: "#4ecdc4",
      },
      {
        name: "Shopping",
        amount: 980,
        percentage: 15,
        budget: 600,
        icon: <ShoppingCart />,
        color: "#45b7d1",
      },
      {
        name: "Entertainment",
        amount: 780,
        percentage: 12,
        budget: 500,
        icon: <SportsEsports />,
        color: "#96ceb4",
      },
      {
        name: "Utilities",
        amount: 650,
        percentage: 10,
        budget: 400,
        icon: <Home />,
        color: "#feca57",
      },
      {
        name: "Healthcare",
        amount: 450,
        percentage: 7,
        budget: 300,
        icon: <HealthAndSafety />,
        color: "#ff9ff3",
      },
      {
        name: "Education",
        amount: 330,
        percentage: 5,
        budget: 200,
        icon: <EducationIcon />,
        color: "#54a0ff",
      },
    ],
    recentTransactions: [
      {
        id: 1,
        description: "Starbucks Coffee",
        amount: -5.75,
        date: "2024-01-15",
        category: "Food",
        merchant: "Starbucks",
        paymentMethod: "Credit Card",
      },
      {
        id: 2,
        description: "Salary Deposit",
        amount: 3500,
        date: "2024-01-14",
        category: "Income",
        merchant: "Company",
        paymentMethod: "Direct Deposit",
      },
      {
        id: 3,
        description: "Uber Ride",
        amount: -18.5,
        date: "2024-01-13",
        category: "Transportation",
        merchant: "Uber",
        paymentMethod: "Debit Card",
      },
      {
        id: 4,
        description: "Netflix Subscription",
        amount: -15.99,
        date: "2024-01-12",
        category: "Entertainment",
        merchant: "Netflix",
        paymentMethod: "Credit Card",
      },
      {
        id: 5,
        description: "Grocery Shopping",
        amount: -127.45,
        date: "2024-01-11",
        category: "Food",
        merchant: "Whole Foods",
        paymentMethod: "Debit Card",
      },
    ],
    achievements: [
      {
        title: "Budget Master",
        description: "Stayed under budget for 3 months",
        icon: "🏆",
        progress: 100,
        unlocked: true,
      },
      {
        title: "Savings Champion",
        description: "Reached 75% of savings goal",
        icon: "💰",
        progress: 75,
        unlocked: true,
      },
      {
        title: "Expense Tracker",
        description: "Logged expenses for 30 days straight",
        icon: "📊",
        progress: 100,
        unlocked: true,
      },
      {
        title: "Debt Crusher",
        description: "Paid off $5000 in debt",
        icon: "💪",
        progress: 60,
        unlocked: false,
      },
      {
        title: "Investment Guru",
        description: "Portfolio reached $50k",
        icon: "📈",
        progress: 90,
        unlocked: false,
      },
      {
        title: "Emergency Ready",
        description: "Built 6-month emergency fund",
        icon: "🛡️",
        progress: 45,
        unlocked: false,
      },
    ],
    financialGoals: [
      {
        id: 1,
        title: "Emergency Fund",
        target: 15000,
        current: 8500,
        deadline: "2024-12-31",
        priority: "high",
        category: "savings",
      },
      {
        id: 2,
        title: "Vacation Fund",
        target: 5000,
        current: 2300,
        deadline: "2024-08-15",
        priority: "medium",
        category: "savings",
      },
      {
        id: 3,
        title: "Pay off Credit Card",
        target: 3500,
        current: 1200,
        deadline: "2024-06-30",
        priority: "high",
        category: "debt",
      },
      {
        id: 4,
        title: "New Car Down Payment",
        target: 8000,
        current: 3200,
        deadline: "2024-10-01",
        priority: "medium",
        category: "purchase",
      },
    ],
    budgetAlerts: [
      {
        category: "Food & Dining",
        spent: 1340,
        budget: 1500,
        percentage: 89,
        status: "warning",
      },
      {
        category: "Entertainment",
        spent: 480,
        budget: 500,
        percentage: 96,
        status: "danger",
      },
      {
        category: "Transportation",
        spent: 560,
        budget: 800,
        percentage: 70,
        status: "good",
      },
    ],
    monthlyTrends: [
      { month: "Jan", income: 6500, expenses: 4200, savings: 2300 },
      { month: "Feb", income: 6500, expenses: 4800, savings: 1700 },
      { month: "Mar", income: 6500, expenses: 4100, savings: 2400 },
      { month: "Apr", income: 6500, expenses: 4600, savings: 1900 },
      { month: "May", income: 6500, expenses: 4300, savings: 2200 },
      { month: "Jun", income: 6500, expenses: 4500, savings: 2000 },
    ],
    paymentMethods: [
      {
        name: "Chase Credit Card",
        type: "credit",
        balance: 1250,
        limit: 5000,
        lastUsed: "2024-01-15",
      },
      {
        name: "Checking Account",
        type: "debit",
        balance: 3200,
        lastUsed: "2024-01-14",
      },
      {
        name: "Savings Account",
        type: "savings",
        balance: 18750,
        lastUsed: "2024-01-10",
      },
      { name: "PayPal", type: "digital", balance: 450, lastUsed: "2024-01-12" },
    ],
    insights: [
      {
        type: "spending",
        message:
          "You spent 15% less on dining out this month compared to last month",
        impact: "positive",
      },
      {
        type: "budget",
        message: "You're on track to exceed your entertainment budget by $80",
        impact: "warning",
      },
      {
        type: "savings",
        message:
          "At your current rate, you'll reach your emergency fund goal 2 months early",
        impact: "positive",
      },
      {
        type: "investment",
        message:
          "Consider increasing your 401k contribution by 2% to maximize employer match",
        impact: "suggestion",
      },
    ],
  };

  const availableInterests = [
    "Personal Finance",
    "Investing",
    "Budgeting",
    "Cryptocurrency",
    "Real Estate",
    "Technology",
    "Travel",
    "Cooking",
    "Sports",
    "Music",
    "Reading",
    "Photography",
    "Gaming",
    "Fitness",
    "Art",
    "Movies",
    "Entrepreneurship",
    "Side Hustles",
  ];

  const currencyOptions = [
    "USD",
    "EUR",
    "GBP",
    "CAD",
    "AUD",
    "JPY",
    "INR",
    "CNY",
  ];
  const budgetMethods = [
    "50/30/20",
    "Zero-Based",
    "Envelope",
    "Pay Yourself First",
  ];
  const riskToleranceOptions = ["conservative", "moderate", "aggressive"];

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token && !user) {
      dispatch(getProfileAction(token));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      const emailUsername = user.email ? user.email.split("@")[0] : "";
      setFormData({
        firstName: user.firstName || "John",
        lastName: user.lastName || "Doe",
        email: user.email || "john.doe@example.com",
        username: user.username || emailUsername || "johndoe",
        gender: user.gender
          ? user.gender.charAt(0).toUpperCase() +
            user.gender.slice(1).toLowerCase()
          : "Male",
        bio:
          user.bio ||
          "Passionate about personal finance and smart money management. Love tracking expenses and optimizing budgets for financial freedom.",
        website: user.website || "https://johndoe.portfolio.com",
        phoneNumber: user.phoneNumber || "+1 (555) 123-4567",
        location: user.location || "San Francisco, CA",
        image: user.image || "",
        dateOfBirth: user.dateOfBirth || "1990-05-15",
        occupation: user.occupation || "Software Engineer",
        company: user.company || "Tech Solutions Inc.",
        education: user.education || "Master's in Computer Science",
        interests: user.interests || [
          "Personal Finance",
          "Technology",
          "Investing",
        ],
        socialLinks: user.socialLinks || {
          linkedin: "https://linkedin.com/in/johndoe",
          twitter: "https://twitter.com/johndoe",
          github: "https://github.com/johndoe",
          instagram: "https://instagram.com/johndoe",
        },
        preferences: user.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          profileVisibility: "public",
          twoFactorAuth: true,
          darkMode: true,
          currency: "USD",
          budgetAlerts: true,
          expenseReminders: true,
          weeklyReports: true,
          monthlyReports: true,
          autoSync: true,
          smartInsights: true,
        },
        financialProfile: user.financialProfile || {
          monthlyIncome: 6500,
          primaryBank: "Chase Bank",
          creditScore: 750,
          riskTolerance: "moderate",
          investmentGoals: ["Retirement", "Emergency Fund"],
          retirementAge: 65,
          emergencyFundGoal: 15000,
          debtToIncomeRatio: 25,
        },
        budgetSettings: user.budgetSettings || {
          budgetMethod: "50/30/20",
          budgetPeriod: "monthly",
          rolloverUnused: true,
          strictMode: false,
          autoAdjust: true,
        },
      });
      setPreviewImage(user.image || "");
    }
  }, [user]);

  useEffect(() => {
    if (imageUrl) {
      const updatedFormData = { ...formData, image: imageUrl };
      setFormData(updatedFormData);
      dispatch(updateProfileAction(updatedFormData));
      dispatch(resetCloudinaryState());
      setIsEditing(false);
      setSelectedFile(null);
      toast.success("Profile updated successfully!");
    }
    if (cloudinaryError) {
      toast.error(cloudinaryError);
      dispatch(resetCloudinaryState());
    }
    if (authError) {
      toast.error(authError);
    }
  }, [imageUrl, cloudinaryError, authError, dispatch, formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name) => (event) => {
    const keys = name.split(".");
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = event.target.checked;
      return newData;
    });
  };

  const handleSliderChange = (name) => (event, value) => {
    const keys = name.split(".");
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      dispatch(uploadToCloudinary(selectedFile));
    } else {
      dispatch(updateProfileAction(formData));
      setIsEditing(false);
      setSelectedFile(null);
      toast.success("Profile updated successfully!");
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setSelectedFile(null);
      dispatch(resetCloudinaryState());
    }
  };

  const getInitials = () => {
    const firstInitial = formData.firstName?.charAt(0)?.toUpperCase() || "";
    const lastInitial = formData.lastName?.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return renderPersonalInfo();
      case "financial":
        return (
          <FinancialTab
            financialOverview={renderFinancialOverview()}
            financialHealthScore={renderFinancialHealthScore()}
          />
        );
      case "budget":
        return (
          <AdvancedBudgetManagementTab
            formData={formData}
            dummyStats={dummyStats}
            setOpenBudgetDialog={setOpenBudgetDialog}
            setOpenCategoryDialog={setOpenCategoryDialog}
          />
        );
      case "goals":
        return renderGoalsTracking();
      case "analytics":
        return renderAnalytics();
      case "investments":
        return renderInvestmentTracking();
      case "debt":
        return renderDebtManagement();

      case "security":
        return renderAdvancedSecurity();
      case "integrations":
        return renderIntegrations();
      case "achievements":
        return renderAchievements();
      case "preferences":
        return renderPreferences();
      default:
        return renderPersonalInfo();
    }
  };

  // 1. FINANCIAL HEALTH SCORE SECTION
  const renderFinancialHealthScore = () => (
    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(20, 184, 166, 0.3)",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
          Financial Health Score
        </Typography>
        <div className="text-center mb-4">
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={85}
              size={120}
              thickness={4}
              sx={{ color: "#14b8a6" }}
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                85
              </Typography>
              <Typography variant="caption" sx={{ color: "#aaa" }}>
                Excellent
              </Typography>
            </Box>
          </Box>
        </div>

        {/* Health Score Breakdown */}
        <div className="space-y-3">
          {[
            { label: "Savings Rate", score: 90, color: "#10b981" },
            { label: "Debt Management", score: 85, color: "#14b8a6" },
            { label: "Budget Adherence", score: 80, color: "#f59e0b" },
            { label: "Emergency Fund", score: 75, color: "#ef4444" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <Typography variant="body2" sx={{ color: "white" }}>
                {item.label}
              </Typography>
              <div className="flex items-center gap-2">
                <LinearProgress
                  variant="determinate"
                  value={item.score}
                  sx={{
                    width: 100,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#333",
                    "& .MuiLinearProgress-bar": { backgroundColor: item.color },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: item.color, minWidth: 30 }}
                >
                  {item.score}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // 2. ADVANCED BUDGET MANAGEMENT
  // ...existing code...

  // 3. INVESTMENT TRACKING
  const renderInvestmentTracking = () => (
    <div className="space-y-6">
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            Investment Portfolio
          </Typography>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-[#0b0b0b]">
              <Typography
                variant="h4"
                sx={{ color: "#10b981", fontWeight: "bold" }}
              >
                $45,230
              </Typography>
              <Typography variant="body2" sx={{ color: "#aaa" }}>
                Total Portfolio Value
              </Typography>
            </div>
            <div className="text-center p-4 rounded-lg bg-[#0b0b0b]">
              <Typography
                variant="h4"
                sx={{ color: "#14b8a6", fontWeight: "bold" }}
              >
                +12.5%
              </Typography>
              <Typography variant="body2" sx={{ color: "#aaa" }}>
                YTD Return
              </Typography>
            </div>
            <div className="text-center p-4 rounded-lg bg-[#0b0b0b]">
              <Typography
                variant="h4"
                sx={{ color: "#f59e0b", fontWeight: "bold" }}
              >
                8
              </Typography>
              <Typography variant="body2" sx={{ color: "#aaa" }}>
                Holdings
              </Typography>
            </div>
          </div>

          {/* Asset Allocation */}
          <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
            Asset Allocation
          </Typography>
          <div className="space-y-3">
            {[
              {
                asset: "Stocks",
                percentage: 60,
                amount: 27138,
                color: "#10b981",
              },
              {
                asset: "Bonds",
                percentage: 25,
                amount: 11307,
                color: "#14b8a6",
              },
              {
                asset: "Real Estate",
                percentage: 10,
                amount: 4523,
                color: "#f59e0b",
              },
              { asset: "Cash", percentage: 5, amount: 2262, color: "#ef4444" },
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body2" sx={{ color: "white" }}>
                    {item.asset}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#aaa" }}>
                    ${item.amount.toLocaleString()} ({item.percentage}%)
                  </Typography>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={item.percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#333",
                    "& .MuiLinearProgress-bar": { backgroundColor: item.color },
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // 4. DEBT MANAGEMENT
  const renderDebtManagement = () => (
    <Card
      sx={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(20, 184, 166, 0.3)",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
          Debt Management
        </Typography>

        {/* Debt Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-[#0b0b0b]">
            <Typography
              variant="h4"
              sx={{ color: "#ef4444", fontWeight: "bold" }}
            >
              $12,450
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              Total Debt
            </Typography>
          </div>
          <div className="text-center p-4 rounded-lg bg-[#0b0b0b]">
            <Typography
              variant="h4"
              sx={{ color: "#14b8a6", fontWeight: "bold" }}
            >
              18 months
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              Payoff Timeline
            </Typography>
          </div>
        </div>

        {/* Debt List */}
        <div className="space-y-3">
          {[
            {
              name: "Credit Card",
              balance: 3500,
              rate: 18.9,
              minPayment: 105,
              payoffDate: "2025-08-15",
            },
            {
              name: "Student Loan",
              balance: 8950,
              rate: 4.5,
              minPayment: 125,
              payoffDate: "2026-12-20",
            },
          ].map((debt, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-[#0b0b0b] border border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Typography
                    variant="body1"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    {debt.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    APR: {debt.rate}% | Min Payment: ${debt.minPayment}
                  </Typography>
                </div>
                <Typography
                  variant="h6"
                  sx={{ color: "#ef4444", fontWeight: "bold" }}
                >
                  ${debt.balance.toLocaleString()}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  Payoff Date: {new Date(debt.payoffDate).toLocaleDateString()}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: "#14b8a6", color: "#14b8a6" }}
                >
                  Pay Extra
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // 7. ADVANCED SECURITY & COMPLIANCE
  const renderAdvancedSecurity = () => (
    <div className="space-y-6">
      {/* Security Status */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            Security Status
          </Typography>
          <div className="space-y-4">
            {[
              {
                feature: "Two-Factor Authentication",
                enabled: true,
                description: "SMS and Authenticator App",
              },
              {
                feature: "Biometric Login",
                enabled: true,
                description: "Fingerprint and Face ID",
              },
              {
                feature: "Device Management",
                enabled: true,
                description: "3 trusted devices",
              },
              {
                feature: "Login Alerts",
                enabled: true,
                description: "Email and push notifications",
              },
              {
                feature: "Data Encryption",
                enabled: true,
                description: "AES-256 encryption",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-[#0b0b0b]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.enabled ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div>
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: "500" }}
                    >
                      {item.feature}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      {item.description}
                    </Typography>
                  </div>
                </div>
                <Typography
                  variant="caption"
                  sx={{ color: item.enabled ? "#10b981" : "#ef4444" }}
                >
                  {item.enabled ? "Active" : "Inactive"}
                </Typography>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            Privacy Controls
          </Typography>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" sx={{ color: "white" }}>
                  Data Sharing with Partners
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  Allow sharing anonymized data for better insights
                </Typography>
              </div>
              <Switch
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" sx={{ color: "white" }}>
                  Marketing Communications
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  Receive personalized financial tips and offers
                </Typography>
              </div>
              <Switch
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" sx={{ color: "white" }}>
                  Usage Analytics
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  Help improve the app with usage data
                </Typography>
              </div>
              <Switch
                defaultChecked
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // 8. INTEGRATION & AUTOMATION
  const renderIntegrations = () => (
    <div className="space-y-6">
      {/* Connected Accounts */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <Typography variant="h6" sx={{ color: "white" }}>
              Connected Accounts
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ borderColor: "#14b8a6", color: "#14b8a6" }}
            >
              Add Account
            </Button>
          </div>
          <div className="space-y-3">
            {[
              {
                bank: "Chase Bank",
                accounts: 2,
                lastSync: "2 minutes ago",
                status: "connected",
              },
              {
                bank: "Wells Fargo",
                accounts: 1,
                lastSync: "1 hour ago",
                status: "connected",
              },
              {
                bank: "American Express",
                accounts: 1,
                lastSync: "Failed",
                status: "error",
              },
            ].map((account, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-[#0b0b0b]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      account.status === "connected"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div>
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: "500" }}
                    >
                      {account.bank}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      {account.accounts} account
                      {account.accounts > 1 ? "s" : ""} • Last sync:{" "}
                      {account.lastSync}
                    </Typography>
                  </div>
                </div>
                <Button size="small" variant="text" sx={{ color: "#14b8a6" }}>
                  {account.status === "error" ? "Reconnect" : "Manage"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <Typography variant="h6" sx={{ color: "white" }}>
              Automation Rules
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ borderColor: "#14b8a6", color: "#14b8a6" }}
            >
              Create Rule
            </Button>
          </div>
          <div className="space-y-3">
            {[
              {
                name: "Auto-categorize Starbucks",
                description:
                  "Automatically categorize Starbucks purchases as 'Coffee'",
                active: true,
              },
              {
                name: "Savings Goal Transfer",
                description: "Transfer $200 to savings every payday",
                active: true,
              },
              {
                name: "Bill Payment Alert",
                description: "Notify 3 days before bill due dates",
                active: false,
              },
            ].map((rule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-[#0b0b0b]"
              >
                <div className="flex-1">
                  <Typography
                    variant="body2"
                    sx={{ color: "white", fontWeight: "500" }}
                  >
                    {rule.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    {rule.description}
                  </Typography>
                </div>
                <Switch
                  checked={rule.active}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPersonalInfo = () => (
    <PersonalInfoTab
      isEditing={isEditing}
      toggleEdit={toggleEdit}
      handleSubmit={handleSubmit}
      previewImage={previewImage}
      getInitials={getInitials}
      handleFileChange={handleFileChange}
      formData={formData}
      handleInputChange={handleInputChange}
      selectedFile={selectedFile}
      availableInterests={availableInterests}
      handleInterestToggle={handleInterestToggle}
      uploading={uploading}
      dummyStats={dummyStats}
    />
  );

  const renderBudgetManagement = () => (
    <div className="space-y-6">
      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <Typography variant="h6" sx={{ color: "white" }}>
                Budget Status
              </Typography>
              <IconButton
                onClick={() => setOpenBudgetDialog(true)}
                sx={{ color: "#14b8a6" }}
              >
                <Settings />
              </IconButton>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  This Month
                </Typography>
                <Typography variant="body2" sx={{ color: "white" }}>
                  ${dummyStats.totalExpenses.toLocaleString()} / $
                  {dummyStats.monthlyBudget.toLocaleString()}
                </Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={
                  (dummyStats.totalExpenses / dummyStats.monthlyBudget) * 100
                }
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#333",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      dummyStats.totalExpenses / dummyStats.monthlyBudget > 0.9
                        ? "#ef4444"
                        : "#14b8a6",
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: "#aaa" }}>
                {Math.round(
                  (dummyStats.totalExpenses / dummyStats.monthlyBudget) * 100
                )}
                % of budget used
              </Typography>
            </div>
          </CardContent>
        </Card>

        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
              Budget Method
            </Typography>
            <div className="flex items-center gap-2">
              <PieChart sx={{ color: "#14b8a6" }} />
              <Typography variant="body1" sx={{ color: "white" }}>
                {formData.budgetSettings.budgetMethod}
              </Typography>
            </div>
            <Typography variant="body2" sx={{ color: "#aaa", mt: 1 }}>
              {formData.budgetSettings.budgetPeriod} budget cycle
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
              Remaining Budget
            </Typography>
            <Typography
              variant="h4"
              sx={{ color: "#10b981", fontWeight: "bold" }}
            >
              $
              {(
                dummyStats.monthlyBudget - dummyStats.totalExpenses
              ).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              Available to spend
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            Budget Alerts
          </Typography>
          <div className="space-y-3">
            {dummyStats.budgetAlerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-[#0b0b0b]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      alert.status === "danger"
                        ? "bg-red-500"
                        : alert.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  />
                  <div>
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {alert.category}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      ${alert.spent} of ${alert.budget} spent
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        alert.status === "danger"
                          ? "#ef4444"
                          : alert.status === "warning"
                          ? "#f59e0b"
                          : "#10b981",
                      fontWeight: "bold",
                    }}
                  >
                    {alert.percentage}%
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <Typography variant="h6" sx={{ color: "white" }}>
              Category Budgets
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenCategoryDialog(true)}
              sx={{
                borderColor: "#14b8a6",
                color: "#14b8a6",
                "&:hover": {
                  borderColor: "#0d9488",
                  backgroundColor: "rgba(20, 184, 166, 0.1)",
                },
              }}
            >
              Manage Categories
            </Button>
          </div>
          <div className="space-y-4">
            {dummyStats.expenseCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {category.name}
                    </Typography>
                  </div>
                  <Typography variant="body2" sx={{ color: "#aaa" }}>
                    ${category.amount} / ${category.budget}
                  </Typography>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={(category.amount / category.budget) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#333",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: category.color,
                    },
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGoalsTracking = () => (
    <div className="space-y-6">
      {/* Goals Overview */}
      <div className="flex items-center justify-between">
        <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
          Financial Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenGoalDialog(true)}
          sx={{
            backgroundColor: "#14b8a6",
            color: "#0b0b0b",
            "&:hover": { backgroundColor: "#0d9488" },
          }}
        >
          Add Goal
        </Button>
      </div>

      {/* Active Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dummyStats.financialGoals.map((goal) => (
          <Card
            key={goal.id}
            sx={{
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(20, 184, 166, 0.3)",
            }}
          >
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <Typography variant="h6" sx={{ color: "white" }}>
                  {goal.title}
                </Typography>
                <Chip
                  label={goal.priority}
                  size="small"
                  sx={{
                    backgroundColor:
                      goal.priority === "high"
                        ? "#ef4444"
                        : goal.priority === "medium"
                        ? "#f59e0b"
                        : "#10b981",
                    color: "white",
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Typography variant="body2" sx={{ color: "#aaa" }}>
                    Progress
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    ${goal.current.toLocaleString()} / $
                    {goal.target.toLocaleString()}
                  </Typography>
                </div>

                <LinearProgress
                  variant="determinate"
                  value={(goal.current / goal.target) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#333",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#14b8a6",
                    },
                  }}
                />

                <div className="flex justify-between items-center">
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#14b8a6" }}>
                    {Math.round((goal.current / goal.target) * 100)}% Complete
                  </Typography>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: "#14b8a6", color: "#14b8a6" }}
                  >
                    Update
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: "#ef4444", color: "#ef4444" }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goal Insights */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            Goal Insights
          </Typography>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0b0b]">
              <Lightbulb sx={{ color: "#f59e0b" }} />
              <div>
                <Typography variant="body2" sx={{ color: "white" }}>
                  You're ahead of schedule on your Emergency Fund goal!
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  At your current savings rate, you'll reach your goal 2 months
                  early.
                </Typography>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0b0b]">
              <Warning sx={{ color: "#ef4444" }} />
              <div>
                <Typography variant="body2" sx={{ color: "white" }}>
                  Credit Card debt goal needs attention
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  Consider increasing monthly payments to meet your deadline.
                </Typography>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0b0b0b]">
              <CheckCircle sx={{ color: "#10b981" }} />
              <div>
                <Typography variant="body2" sx={{ color: "white" }}>
                  Vacation fund is on track
                </Typography>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  You're saving $287/month, right on schedule for your August
                  trip.
                </Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinancialOverview = () => (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-3">
              <MonetizationOn sx={{ color: "#10b981", fontSize: "2rem" }} />
              <div>
                <Typography
                  variant="h5"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  ${dummyStats.monthlyIncome.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Monthly Income
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-3">
              <TrendingDown sx={{ color: "#ef4444", fontSize: "2rem" }} />
              <div>
                <Typography
                  variant="h5"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  ${dummyStats.totalExpenses.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Monthly Expenses
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-3">
              <Savings sx={{ color: "#14b8a6", fontSize: "2rem" }} />
              <div>
                <Typography
                  variant="h5"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  ${dummyStats.currentSavings.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Total Savings
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent>
            <div className="flex items-center gap-3">
              <CreditScore sx={{ color: "#f59e0b", fontSize: "2rem" }} />
              <div>
                <Typography
                  variant="h5"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  {dummyStats.creditScore}
                </Typography>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                  Credit Score
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6" sx={{ color: "white" }}>
              Recent Transactions
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: "#14b8a6",
                color: "#14b8a6",
                "&:hover": {
                  borderColor: "#0d9488",
                  backgroundColor: "rgba(20, 184, 166, 0.1)",
                },
              }}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {dummyStats.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#0b0b0b] hover:bg-[#222] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.amount > 0
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                    }`}
                  >
                    {transaction.amount > 0 ? (
                      <TrendingUp
                        sx={{ color: "#10b981", fontSize: "1.2rem" }}
                      />
                    ) : (
                      <TrendingDown
                        sx={{ color: "#ef4444", fontSize: "1.2rem" }}
                      />
                    )}
                  </div>
                  <div>
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: "500" }}
                    >
                      {transaction.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#aaa" }}>
                      {transaction.merchant} • {transaction.paymentMethod}
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                  <Typography
                    variant="body2"
                    sx={{
                      color: transaction.amount > 0 ? "#10b981" : "#ef4444",
                      fontWeight: "bold",
                    }}
                  >
                    {transaction.amount > 0 ? "+" : ""}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            Payment Methods
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dummyStats.paymentMethods.map((method, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-[#0b0b0b] border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard sx={{ color: "#14b8a6" }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "white", fontWeight: "500" }}
                    >
                      {method.name}
                    </Typography>
                  </div>
                  <Chip
                    label={method.type}
                    size="small"
                    sx={{
                      backgroundColor:
                        method.type === "credit"
                          ? "#ef4444"
                          : method.type === "savings"
                          ? "#10b981"
                          : "#14b8a6",
                      color: "white",
                      fontSize: "0.7rem",
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Typography variant="body2" sx={{ color: "#aaa" }}>
                    Balance: ${method.balance.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Last used: {new Date(method.lastUsed).toLocaleDateString()}
                  </Typography>
                </div>
                {method.limit && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Credit Utilization</span>
                      <span>
                        {Math.round((method.balance / method.limit) * 100)}%
                      </span>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={(method.balance / method.limit) * 100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#333",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            method.balance / method.limit > 0.7
                              ? "#ef4444"
                              : "#14b8a6",
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => <AnalyticsDashboard dummyStats={dummyStats} />;

  const renderPreferences = () => (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            Notification Preferences
          </Typography>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <NotificationsActive sx={{ color: "#14b8a6" }} />
                <div>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Budget Alerts
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Get notified when approaching budget limits
                  </Typography>
                </div>
              </div>
              <Switch
                checked={formData.preferences.budgetAlerts}
                onChange={handleSwitchChange("preferences.budgetAlerts")}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#14b8a6",
                  },
                }}
              />
            </div>

            <Divider sx={{ backgroundColor: "#333" }} />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlarmOn sx={{ color: "#14b8a6" }} />
                <div>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Expense Reminders
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Daily reminders to log your expenses
                  </Typography>
                </div>
              </div>
              <Switch
                checked={formData.preferences.expenseReminders}
                onChange={handleSwitchChange("preferences.expenseReminders")}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#14b8a6",
                  },
                }}
              />
            </div>

            <Divider sx={{ backgroundColor: "#333" }} />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Report sx={{ color: "#14b8a6" }} />
                <div>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Weekly Reports
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Receive weekly spending summaries
                  </Typography>
                </div>
              </div>
              <Switch
                checked={formData.preferences.weeklyReports}
                onChange={handleSwitchChange("preferences.weeklyReports")}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#14b8a6",
                  },
                }}
              />
            </div>

            <Divider sx={{ backgroundColor: "#333" }} />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SmartToy sx={{ color: "#14b8a6" }} />
                <div>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Smart Insights
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    AI-powered spending insights and recommendations
                  </Typography>
                </div>
              </div>
              <Switch
                checked={formData.preferences.smartInsights}
                onChange={handleSwitchChange("preferences.smartInsights")}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#14b8a6",
                  },
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            App Preferences
          </Typography>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MonetizationOn sx={{ color: "#14b8a6" }} />
                <div>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Default Currency
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Choose your preferred currency
                  </Typography>
                </div>
              </div>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={formData.preferences.currency}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "preferences.currency",
                        value: e.target.value,
                      },
                    })
                  }
                  sx={{
                    backgroundColor: "#0b0b0b",
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                  }}
                >
                  {currencyOptions.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {currency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <Divider sx={{ backgroundColor: "#333" }} />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sync sx={{ color: "#14b8a6" }} />
                <div>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Auto Sync
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Automatically sync data across devices
                  </Typography>
                </div>
              </div>
              <Switch
                checked={formData.preferences.autoSync}
                onChange={handleSwitchChange("preferences.autoSync")}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#14b8a6",
                  },
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            Data & Privacy
          </Typography>
          <div className="space-y-3">
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Download />}
              sx={{
                borderColor: "#14b8a6",
                color: "#14b8a6",
                "&:hover": {
                  borderColor: "#0d9488",
                  backgroundColor: "rgba(20, 184, 166, 0.1)",
                },
              }}
            >
              Export My Data
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CloudUpload />}
              sx={{
                borderColor: "#14b8a6",
                color: "#14b8a6",
                "&:hover": {
                  borderColor: "#0d9488",
                  backgroundColor: "rgba(20, 184, 166, 0.1)",
                },
              }}
            >
              Import Data
            </Button>
            <Button
              variant="outlined"
              fullWidth
              color="error"
              startIcon={<Remove />}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            Privacy & Security
          </Typography>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Notifications sx={{ color: "#14b8a6" }} />
                <div>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Email Notifications
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Receive updates via email
                  </Typography>
                </div>
              </div>
              <Switch
                checked={formData.preferences.emailNotifications}
                onChange={handleSwitchChange("preferences.emailNotifications")}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#14b8a6",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#14b8a6",
                  },
                }}
              />
            </div>

            <Divider sx={{ backgroundColor: "#333" }} />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Security sx={{ color: "#14b8a6" }} />
                <div>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Two-Factor Authentication
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Add an extra layer of security
                  </Typography>
                </div>
              </div>
              <Switch
                checked={formData.preferences.twoFactorAuth}
                onChange={handleSwitchChange("preferences.twoFactorAuth")}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#14b8a6",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#14b8a6",
                  },
                }}
              />
            </div>

            <Divider sx={{ backgroundColor: "#333" }} />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Visibility sx={{ color: "#14b8a6" }} />
                <div>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Profile Visibility
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Control who can see your profile
                  </Typography>
                </div>
              </div>
              <FormControl size="small">
                <TextField
                  select
                  value={formData.preferences.profileVisibility}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "preferences.profileVisibility",
                        value: e.target.value,
                      },
                    })
                  }
                  SelectProps={{
                    native: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#0b0b0b",
                      color: "white",
                      "& fieldset": {
                        borderColor: "#14b8a6",
                      },
                    },
                  }}
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </TextField>
              </FormControl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <Card
        sx={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
            Achievements & Badges
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dummyStats.achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? "bg-[#0b0b0b] border-teal-500/60 hover:border-teal-500"
                    : "bg-[#0b0b0b] border-gray-700/30 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`text-2xl ${
                      achievement.unlocked ? "" : "grayscale"
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <Typography
                      variant="body1"
                      sx={{
                        color: achievement.unlocked ? "white" : "#666",
                        fontWeight: "bold",
                      }}
                    >
                      {achievement.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: achievement.unlocked ? "#aaa" : "#555" }}
                    >
                      {achievement.description}
                    </Typography>
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle
                      sx={{ color: "#10b981", fontSize: "1.5rem" }}
                    />
                  )}
                </div>

                {!achievement.unlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-gray-400">
                        {achievement.progress}%
                      </span>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={achievement.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#333",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#14b8a6",
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent className="text-center">
            <EmojiEvents sx={{ color: "#f59e0b", fontSize: "3rem", mb: 1 }} />
            <Typography
              variant="h4"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              {dummyStats.achievements.filter((a) => a.unlocked).length}
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              Achievements Unlocked
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent className="text-center">
            <Star sx={{ color: "#14b8a6", fontSize: "3rem", mb: 1 }} />
            <Typography
              variant="h4"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              {Math.round(
                dummyStats.achievements.reduce(
                  (acc, a) => acc + a.progress,
                  0
                ) / dummyStats.achievements.length
              )}
              %
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              Overall Progress
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(20, 184, 166, 0.3)",
          }}
        >
          <CardContent className="text-center">
            <Timeline sx={{ color: "#10b981", fontSize: "3rem", mb: 1 }} />
            <Typography
              variant="h4"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              47
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              Days Streak
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #14b8a6 #1a1a1a;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #14b8a6;
          border-radius: 4px;
          border: 1px solid #1a1a1a;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0d9488;
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #1a1a1a;
        }

        /* Hide scrollbar for elements with scrollbar-hide class but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        className="fixed overflow-hidden"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          top: "50px",
          right: "20px",
          backgroundColor: "#0b0b0b",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(20, 184, 166, 0.3)",
        }}
      >
        {/* Content Container */}
        <div className="flex flex-col h-full">
          {/* Header Section - Fixed */}

          {/* Header Section - Fixed */}
          <div className="flex-shrink-0 p-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Profile Settings
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Manage your account information and preferences
                </p>
              </div>
              {/* Remove the Edit Profile button from here */}
            </div>

            {/* Enhanced Tab Navigation - Sticky */}
            <div className="flex flex-wrap gap-1 bg-[#1a1a1a] p-1 rounded-lg">
              {[
                { key: "personal", label: "Personal", icon: <Person /> },
                {
                  key: "financial",
                  label: "Financial",
                  icon: <AccountBalance />,
                },
                { key: "budget", label: "Budget", icon: <PieChart /> },
                { key: "goals", label: "Goals", icon: <EmojiEvents /> },
                { key: "analytics", label: "Analytics", icon: <Analytics /> },
                {
                  key: "investments",
                  label: "Investments",
                  icon: <TrendingUp />,
                },
                { key: "debt", label: "Debt", icon: <CreditCard /> },
                { key: "security", label: "Security", icon: <Security /> },
                { key: "integrations", label: "Integrations", icon: <Sync /> },
                {
                  key: "achievements",
                  label: "Achievements",
                  icon: <VerifiedUser />,
                },
                {
                  key: "preferences",
                  label: "Preferences",
                  icon: <Settings />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-teal-500 text-black"
                      : "text-gray-400 hover:text-white hover:bg-[#333]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-6">
            {/* Profile Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Avatar and Basic Info - Only show for personal tab */}

              {/* Right Column - Tab Content */}
              <div className={"lg:col-span-3"}>{renderTabContent()}</div>
            </div>
          </div>
        </div>
        {/* Dialogs */}
        <Dialog
          open={openBudgetDialog}
          onClose={() => setOpenBudgetDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(20, 184, 166, 0.3)",
            },
          }}
        >
          <DialogTitle sx={{ color: "white" }}>Budget Settings</DialogTitle>
          <DialogContent>
            <div className="space-y-4 mt-2">
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#aaa" }}>Budget Method</InputLabel>
                <Select
                  value={formData.budgetSettings.budgetMethod}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "budgetSettings.budgetMethod",
                        value: e.target.value,
                      },
                    })
                  }
                  sx={{
                    backgroundColor: "#0b0b0b",
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                  }}
                >
                  {budgetMethods.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: "#aaa" }}>Budget Period</InputLabel>
                <Select
                  value={formData.budgetSettings.budgetPeriod}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "budgetSettings.budgetPeriod",
                        value: e.target.value,
                      },
                    })
                  }
                  sx={{
                    backgroundColor: "#0b0b0b",
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                  }}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>

              <div className="flex items-center justify-between">
                <Typography variant="body2" sx={{ color: "white" }}>
                  Rollover Unused Budget
                </Typography>
                <Switch
                  checked={formData.budgetSettings.rolloverUnused}
                  onChange={handleSwitchChange("budgetSettings.rolloverUnused")}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#14b8a6",
                    },
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Typography variant="body2" sx={{ color: "white" }}>
                  Auto-Adjust Budget
                </Typography>
                <Switch
                  checked={formData.budgetSettings.autoAdjust}
                  onChange={handleSwitchChange("budgetSettings.autoAdjust")}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#14b8a6",
                    },
                  }}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenBudgetDialog(false)}
              sx={{ color: "#aaa" }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setOpenBudgetDialog(false)}
              sx={{ color: "#14b8a6" }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openGoalDialog}
          onClose={() => setOpenGoalDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(20, 184, 166, 0.3)",
            },
          }}
        >
          <DialogTitle sx={{ color: "white" }}>Add Financial Goal</DialogTitle>
          <DialogContent>
            <div className="space-y-4 mt-2">
              <TextField
                fullWidth
                label="Goal Title"
                variant="outlined"
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#aaa" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0b0b0b",
                    "& fieldset": { borderColor: "#14b8a6" },
                    "&:hover fieldset": { borderColor: "#14b8a6" },
                    "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Target Amount"
                type="number"
                variant="outlined"
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#aaa" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0b0b0b",
                    "& fieldset": { borderColor: "#14b8a6" },
                    "&:hover fieldset": { borderColor: "#14b8a6" },
                    "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Deadline"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true, style: { color: "#aaa" } }}
                InputProps={{ style: { color: "white" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0b0b0b",
                    "& fieldset": { borderColor: "#14b8a6" },
                    "&:hover fieldset": { borderColor: "#14b8a6" },
                    "&.Mui-focused fieldset": { borderColor: "#14b8a6" },
                  },
                }}
              />
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#aaa" }}>Priority</InputLabel>
                <Select
                  defaultValue="medium"
                  sx={{
                    backgroundColor: "#0b0b0b",
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#14b8a6",
                    },
                  }}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenGoalDialog(false)}
              sx={{ color: "#aaa" }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setOpenGoalDialog(false)}
              sx={{ color: "#14b8a6" }}
            >
              Add Goal
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default Profile;
