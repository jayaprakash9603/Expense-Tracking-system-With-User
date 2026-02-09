import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  useMediaQuery,
  IconButton,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  AccountBalance as AccountIcon,
  CreditCard as PaymentIcon,
  Receipt as ExpenseIcon,
  PieChart as BudgetIcon,
  Category as CategoryIcon,
  Group as FriendsIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

/**
 * Help Center Page Component
 * Browse FAQs and help articles organized by category
 */

// FAQ Categories with questions
const FAQ_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: HelpIcon,
    faqs: [
      {
        question: "How do I create my first expense?",
        answer:
          "Navigate to Expenses from the sidebar, then click the 'Add Expense' button. Fill in the amount, category, date, and description, then save your expense.",
      },
      {
        question: "How do I set up my profile?",
        answer:
          "Go to Profile from the sidebar menu. You can update your personal information, profile picture, and cover image. Click the edit button to make changes.",
      },
      {
        question: "What currencies are supported?",
        answer:
          "We support multiple currencies including USD, EUR, GBP, INR, JPY, and many more. You can change your preferred currency in Settings > Preferences.",
      },
    ],
  },
  {
    id: "expenses",
    title: "Managing Expenses",
    icon: ExpenseIcon,
    faqs: [
      {
        question: "How do I edit or delete an expense?",
        answer:
          "Find the expense in your expense list, click on it to view details, then use the edit or delete buttons. You can also swipe left on mobile to reveal action buttons.",
      },
      {
        question: "Can I upload expenses in bulk?",
        answer:
          "Yes! Go to Expenses > Upload and you can import expenses from CSV or Excel files. Make sure your file follows the required format shown in the upload dialog.",
      },
      {
        question: "How do I categorize expenses?",
        answer:
          "When creating or editing an expense, select a category from the dropdown. You can also create custom categories in the Categories section.",
      },
      {
        question: "Can I add recurring expenses?",
        answer:
          "Yes, when creating an expense, toggle the 'Recurring' option and set the frequency (daily, weekly, monthly, yearly). The system will automatically create entries based on your schedule.",
      },
    ],
  },
  {
    id: "budgets",
    title: "Budgets & Planning",
    icon: BudgetIcon,
    faqs: [
      {
        question: "How do I create a budget?",
        answer:
          "Go to Budgets from the sidebar and click 'Create Budget'. Set the budget name, amount, time period, and optionally link it to specific categories.",
      },
      {
        question: "What happens when I exceed my budget?",
        answer:
          "You'll receive notifications when you reach 80% and 100% of your budget. The budget card will also change color to indicate the status (green = on track, yellow = warning, red = exceeded).",
      },
      {
        question: "Can I set budgets for specific categories?",
        answer:
          "Yes! When creating a budget, you can select specific categories to track. This helps you monitor spending in areas like groceries, entertainment, or transportation.",
      },
    ],
  },
  {
    id: "categories",
    title: "Categories",
    icon: CategoryIcon,
    faqs: [
      {
        question: "How do I create custom categories?",
        answer:
          "Go to Categories and click 'Add Category'. Choose a name, icon, and color for your category. Custom categories help you organize expenses according to your needs.",
      },
      {
        question: "Can I merge or delete categories?",
        answer:
          "You can delete unused categories from the category settings. To merge, create a new category and reassign expenses from the old categories before deleting them.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payment Methods",
    icon: PaymentIcon,
    faqs: [
      {
        question: "How do I add a payment method?",
        answer:
          "Go to Payment Methods and click 'Add Payment Method'. Enter the name (e.g., 'Chase Credit Card'), type (credit, debit, cash, etc.), and any notes.",
      },
      {
        question: "Can I track spending by payment method?",
        answer:
          "Yes! Each expense can be linked to a payment method. View reports by payment method in the Reports section to see spending patterns across different accounts.",
      },
    ],
  },
  {
    id: "friends",
    title: "Friends & Sharing",
    icon: FriendsIcon,
    faqs: [
      {
        question: "How do I add friends?",
        answer:
          "Go to Friends and use the search to find users by name or email. Send a friend request and once accepted, you can share expenses and track group spending.",
      },
      {
        question: "How do I share expenses with friends?",
        answer:
          "When viewing a friend's profile, you can access shared expense tracking. Add expenses that involve your friend to keep track of who owes what.",
      },
      {
        question: "What is the shared dashboard?",
        answer:
          "The shared dashboard shows expenses between you and a friend. It calculates balances and helps you settle up easily.",
      },
    ],
  },
  {
    id: "security",
    title: "Security & Privacy",
    icon: SecurityIcon,
    faqs: [
      {
        question: "How do I enable two-factor authentication?",
        answer:
          "Go to Settings > Security and enable 'Two-Factor Authentication'. You can use an authenticator app or SMS verification for added security.",
      },
      {
        question: "How do I change my password?",
        answer:
          "In Settings > Security, click 'Change Password'. Enter your current password and then your new password twice to confirm.",
      },
      {
        question: "Is my financial data secure?",
        answer:
          "Yes! We use industry-standard encryption for all data in transit and at rest. Your financial information is never shared with third parties without your consent.",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: NotificationsIcon,
    faqs: [
      {
        question: "How do I customize notifications?",
        answer:
          "Go to Settings > Notifications to manage all notification preferences. You can enable/disable notifications by type and choose delivery methods (in-app, email, push).",
      },
      {
        question: "Why am I not receiving notifications?",
        answer:
          "Check that notifications are enabled in Settings. Also verify your browser/device allows notifications for our app. Check your email spam folder for email notifications.",
      },
    ],
  },
  {
    id: "settings",
    title: "Account Settings",
    icon: SettingsIcon,
    faqs: [
      {
        question: "How do I change the app theme?",
        answer:
          "Go to Settings > Appearance and select your preferred theme (Light, Dark, or System). The change applies immediately.",
      },
      {
        question: "How do I export my data?",
        answer:
          "In Settings > Data Management, click 'Export Data'. You can download all your expenses, budgets, and categories in various formats (CSV, JSON, PDF).",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Go to Settings > Data Management and click 'Delete Account'. This action is permanent and will delete all your data. You'll need to confirm with your password.",
      },
    ],
  },
];

const HelpCenter = () => {
  const navigate = useNavigate();
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery("(max-width:900px)");
  const isDark = mode === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Filter FAQs based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query),
      ),
    })).filter((category) => category.faqs.length > 0);
  }, [searchQuery]);

  // Count total FAQs found
  const totalResults = useMemo(
    () => filteredCategories.reduce((acc, cat) => acc + cat.faqs.length, 0),
    [filteredCategories],
  );

  const handleAccordionChange = (categoryId) => (event, isExpanded) => {
    setExpandedCategory(isExpanded ? categoryId : null);
  };

  return (
    <Box
      sx={{
        bgcolor: colors.primary_bg,
        width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        maxHeight: "calc(100vh - 100px)",
        borderRadius: isSmallScreen ? 0 : "8px",
        border: isSmallScreen ? "none" : `1px solid ${colors.border_color}`,
        mr: isSmallScreen ? 0 : "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: `1px solid ${colors.border_color}`,
          bgcolor: colors.secondary_bg,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: colors.primary_text }}
          >
            <ArrowBackIcon />
          </IconButton>
          <HelpIcon sx={{ color: colors.primary_accent, fontSize: 28 }} />
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: colors.primary_text }}
          >
            {t("settings.helpCenter") || "Help Center"}
          </Typography>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ p: 2, bgcolor: colors.secondary_bg }}>
        <TextField
          fullWidth
          placeholder="Search FAQs and help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.secondary_text }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: colors.primary_bg,
              borderRadius: 2,
              "& fieldset": {
                borderColor: colors.border_color,
              },
              "&:hover fieldset": {
                borderColor: colors.primary_accent,
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.primary_accent,
              },
            },
            "& .MuiInputBase-input": {
              color: colors.primary_text,
            },
          }}
        />
        {searchQuery && (
          <Typography
            variant="body2"
            sx={{ mt: 1, color: colors.secondary_text }}
          >
            Found {totalResults} result{totalResults !== 1 ? "s" : ""} in{" "}
            {filteredCategories.length} categor
            {filteredCategories.length !== 1 ? "ies" : "y"}
          </Typography>
        )}
      </Box>

      {/* FAQ Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: colors.border_color,
            borderRadius: "3px",
          },
        }}
      >
        {filteredCategories.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: colors.secondary_bg,
              borderRadius: 2,
            }}
          >
            <HelpIcon
              sx={{ fontSize: 48, color: colors.secondary_text, mb: 2 }}
            />
            <Typography variant="h6" sx={{ color: colors.primary_text, mb: 1 }}>
              No results found
            </Typography>
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              Try different keywords or browse the categories below
            </Typography>
          </Paper>
        ) : (
          filteredCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <Accordion
                key={category.id}
                expanded={expandedCategory === category.id || !!searchQuery}
                onChange={handleAccordionChange(category.id)}
                sx={{
                  mb: 1,
                  bgcolor: colors.secondary_bg,
                  borderRadius: "8px !important",
                  border: `1px solid ${colors.border_color}`,
                  "&:before": { display: "none" },
                  "&.Mui-expanded": {
                    margin: "0 0 8px 0",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon sx={{ color: colors.secondary_text }} />
                  }
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 2,
                    },
                  }}
                >
                  <CategoryIcon sx={{ color: colors.primary_accent }} />
                  <Typography
                    sx={{ fontWeight: 500, color: colors.primary_text }}
                  >
                    {category.title}
                  </Typography>
                  <Chip
                    label={`${category.faqs.length} FAQs`}
                    size="small"
                    sx={{
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.08)",
                      color: colors.secondary_text,
                      fontSize: "0.75rem",
                    }}
                  />
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Divider sx={{ mb: 2, borderColor: colors.border_color }} />
                  {category.faqs.map((faq, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        bgcolor: isDark
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.02)",
                        borderRadius: 2,
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <ArticleIcon
                          sx={{
                            color: colors.primary_accent,
                            fontSize: 20,
                            mt: 0.3,
                          }}
                        />
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 500,
                              color: colors.primary_text,
                              mb: 1,
                            }}
                          >
                            {faq.question}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.secondary_text,
                              lineHeight: 1.6,
                            }}
                          >
                            {faq.answer}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </AccordionDetails>
              </Accordion>
            );
          })
        )}

        {/* Quick Links */}
        <Paper
          sx={{
            mt: 3,
            p: 2,
            bgcolor: colors.secondary_bg,
            borderRadius: 2,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: colors.primary_text, mb: 2 }}
          >
            Need more help?
          </Typography>
          <List dense>
            <ListItem
              button
              onClick={() => navigate("/support/contact")}
              sx={{
                borderRadius: 1,
                "&:hover": { bgcolor: colors.hover_bg },
              }}
            >
              <ListItemIcon>
                <HelpIcon sx={{ color: colors.primary_accent }} />
              </ListItemIcon>
              <ListItemText
                primary="Contact Support"
                secondary="Get help from our support team"
                primaryTypographyProps={{ color: colors.primary_text }}
                secondaryTypographyProps={{ color: colors.secondary_text }}
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default HelpCenter;
