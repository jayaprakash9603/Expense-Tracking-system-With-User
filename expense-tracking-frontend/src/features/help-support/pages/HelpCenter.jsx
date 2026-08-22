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
import { FAQ_CATEGORIES as FAQ_CATEGORY_CONTENT } from "../content/faqCategories";

/**
 * Help Center Page Component
 * Browse FAQs and help articles organized by category
 */

const FAQ_ICONS = {
  "getting-started": HelpIcon,
  expenses: ExpenseIcon,
  budgets: BudgetIcon,
  categories: CategoryIcon,
  payments: PaymentIcon,
  friends: FriendsIcon,
  security: SecurityIcon,
  notifications: NotificationsIcon,
  settings: SettingsIcon,
  reports: ArticleIcon,
};

export const FAQ_CATEGORIES = FAQ_CATEGORY_CONTENT.map((category) => ({
  ...category,
  icon: FAQ_ICONS[category.id] || HelpIcon,
}));

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
