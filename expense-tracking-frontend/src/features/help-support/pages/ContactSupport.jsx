import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  useMediaQuery,
  IconButton,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Support as SupportIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  BugReport as BugIcon,
  Feedback as FeedbackIcon,
  HelpOutline as QuestionIcon,
  AccountCircle as AccountIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import { useSelector } from "react-redux";

/**
 * Contact Support Page Component
 * Get help from our support team through various channels
 */

const SUPPORT_CATEGORIES = [
  { value: "general", label: "General Inquiry", icon: QuestionIcon },
  { value: "bug", label: "Bug Report", icon: BugIcon },
  { value: "feature", label: "Feature Request", icon: FeedbackIcon },
  { value: "account", label: "Account Issue", icon: AccountIcon },
  { value: "billing", label: "Billing & Payments", icon: PaymentIcon },
];

const CONTACT_METHODS = [
  {
    id: "email",
    title: "Email Support",
    description: "Send us an email and we'll respond within 24 hours",
    icon: EmailIcon,
    action: "support@expensio.com",
    color: "#4CAF50",
  },
  {
    id: "chat",
    title: "Live Chat",
    description: "Chat with our support team (9 AM - 6 PM EST)",
    icon: ChatIcon,
    action: "Start Chat",
    color: "#2196F3",
  },
  {
    id: "phone",
    title: "Phone Support",
    description: "Call us for urgent issues (Business hours)",
    icon: PhoneIcon,
    action: "+1 (555) 123-4567",
    color: "#FF9800",
  },
];

const ContactSupport = () => {
  const navigate = useNavigate();
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery("(max-width:900px)");
  const isDark = mode === "dark";
  const user = useSelector((state) => state.auth?.user);

  const [formData, setFormData] = useState({
    name: user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : "",
    email: user?.email || "",
    category: "general",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewTicket = () => {
    setSubmitted(false);
    setFormData((prev) => ({
      ...prev,
      subject: "",
      message: "",
      category: "general",
    }));
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
          <SupportIcon sx={{ color: colors.primary_accent, fontSize: 28 }} />
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: colors.primary_text }}
          >
            {t("settings.contactSupport") || "Contact Support"}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
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
        {/* Contact Methods */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: colors.primary_text, mb: 2 }}
        >
          Contact Methods
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {CONTACT_METHODS.map((method) => {
            const MethodIcon = method.icon;
            return (
              <Grid item xs={12} sm={4} key={method.id}>
                <Card
                  sx={{
                    bgcolor: colors.secondary_bg,
                    border: `1px solid ${colors.border_color}`,
                    borderRadius: 2,
                    height: "100%",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: method.color,
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${method.color}20`,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: `${method.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <MethodIcon sx={{ fontSize: 28, color: method.color }} />
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary_text,
                        mb: 0.5,
                      }}
                    >
                      {method.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.secondary_text,
                        mb: 2,
                        minHeight: 40,
                      }}
                    >
                      {method.description}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: method.color }}
                    >
                      {method.action}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ my: 3, borderColor: colors.border_color }} />

        {/* Support Form */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: colors.primary_text, mb: 2 }}
        >
          Submit a Support Ticket
        </Typography>

        {submitted ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: colors.secondary_bg,
              borderRadius: 2,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 64, color: "#4CAF50", mb: 2 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: colors.primary_text, mb: 1 }}
            >
              Ticket Submitted Successfully!
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: colors.secondary_text, mb: 3 }}
            >
              We've received your support request and will respond within 24
              hours. Check your email for updates.
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.secondary_text, mb: 3 }}
            >
              Ticket ID:{" "}
              <strong style={{ color: colors.primary_accent }}>
                #TKT-{Date.now().toString().slice(-6)}
              </strong>
            </Typography>
            <Button
              variant="contained"
              onClick={handleNewTicket}
              sx={{
                bgcolor: colors.primary_accent,
                "&:hover": { bgcolor: colors.primary_accent_hover },
              }}
            >
              Submit Another Ticket
            </Button>
          </Paper>
        ) : (
          <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 3,
              bgcolor: colors.secondary_bg,
              borderRadius: 2,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: colors.primary_bg,
                      "& fieldset": { borderColor: colors.border_color },
                      "&:hover fieldset": {
                        borderColor: colors.primary_accent,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.primary_accent,
                      },
                    },
                    "& .MuiInputLabel-root": { color: colors.secondary_text },
                    "& .MuiInputBase-input": { color: colors.primary_text },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: colors.primary_bg,
                      "& fieldset": { borderColor: colors.border_color },
                      "&:hover fieldset": {
                        borderColor: colors.primary_accent,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.primary_accent,
                      },
                    },
                    "& .MuiInputLabel-root": { color: colors.secondary_text },
                    "& .MuiInputBase-input": { color: colors.primary_text },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={formData.category}
                  onChange={handleInputChange("category")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: colors.primary_bg,
                      "& fieldset": { borderColor: colors.border_color },
                      "&:hover fieldset": {
                        borderColor: colors.primary_accent,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.primary_accent,
                      },
                    },
                    "& .MuiInputLabel-root": { color: colors.secondary_text },
                    "& .MuiSelect-select": { color: colors.primary_text },
                  }}
                >
                  {SUPPORT_CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={handleInputChange("subject")}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: colors.primary_bg,
                      "& fieldset": { borderColor: colors.border_color },
                      "&:hover fieldset": {
                        borderColor: colors.primary_accent,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.primary_accent,
                      },
                    },
                    "& .MuiInputLabel-root": { color: colors.secondary_text },
                    "& .MuiInputBase-input": { color: colors.primary_text },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Describe your issue"
                  value={formData.message}
                  onChange={handleInputChange("message")}
                  required
                  placeholder="Please provide as much detail as possible about your issue..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: colors.primary_bg,
                      "& fieldset": { borderColor: colors.border_color },
                      "&:hover fieldset": {
                        borderColor: colors.primary_accent,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.primary_accent,
                      },
                    },
                    "& .MuiInputLabel-root": { color: colors.secondary_text },
                    "& .MuiInputBase-input": { color: colors.primary_text },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SendIcon />
                    )
                  }
                  sx={{
                    bgcolor: colors.primary_accent,
                    "&:hover": { bgcolor: colors.primary_accent_hover },
                    "&:disabled": { bgcolor: colors.border_color },
                  }}
                >
                  {loading ? "Submitting..." : "Submit Ticket"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ContactSupport;
