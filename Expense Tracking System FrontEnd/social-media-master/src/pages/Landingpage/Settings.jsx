import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Switch,
  Button,
  Paper,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Chip,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  ChevronRight as ChevronRightIcon,
  ArrowBack as ArrowBackIcon,
  Palette as PaletteIcon,
  AccountCircle as AccountCircleIcon,
  Shield as ShieldIcon,
  Help as HelpIcon,
  Description as DescriptionIcon,
  Support as SupportIcon,
  Storage as StorageIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  Assessment as AssessmentIcon,
  MonetizationOn as MonetizationOnIcon,
} from "@mui/icons-material";
import { toggleTheme } from "../../Redux/Theme/theme.actions";
import { useTheme } from "../../hooks/useTheme";
import ToastNotification from "./ToastNotification";
import { updateUserSettings } from "../../Redux/UserSettings/userSettings.action";

/**
 * Settings Page Component
 * Provides comprehensive application settings and user preferences
 */
const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { colors, mode } = useTheme();
  const { user } = useSelector((state) => state.auth || {});
  const { settings: userSettings, loading: settingsLoading } = useSelector(
    (state) => state.userSettings || {}
  );
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  // State management - Initialize from Redux store
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [friendRequests, setFriendRequests] = useState(true);
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("INR");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const isDark = mode === "dark";

  // Sync local state with Redux store when settings are loaded
  useEffect(() => {
    if (userSettings) {
      setEmailNotifications(userSettings.emailNotifications ?? true);
      setBudgetAlerts(userSettings.budgetAlerts ?? true);
      setWeeklyReports(userSettings.weeklyReports ?? false);
      setPushNotifications(userSettings.pushNotifications ?? true);
      setFriendRequests(userSettings.friendRequestNotifications ?? true);
      setLanguage(userSettings.language ?? "en");
      setCurrency(userSettings.currency ?? "INR");
      setDateFormat(userSettings.dateFormat ?? "DD/MM/YYYY");
    }
  }, [userSettings]);

  // Helper function to update settings in backend
  const updateSettings = async (updates) => {
    try {
      await dispatch(updateUserSettings(updates));
      showSnackbar("Settings updated successfully", "success");
    } catch (error) {
      showSnackbar("Failed to update settings", "error");
      console.error("Error updating settings:", error);
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    const newMode = isDark ? "light" : "dark";
    updateSettings({ themeMode: newMode });
    showSnackbar(`Theme changed to ${newMode} mode`, "success");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Setting Item Component
  const SettingItem = ({
    icon: Icon,
    title,
    description,
    action,
    isSwitch = false,
    switchChecked = false,
    onSwitchChange,
    isButton = false,
    buttonText = "",
    onButtonClick,
    isSelect = false,
    selectValue = "",
    selectOptions = [],
    onSelectChange,
    isDanger = false,
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 2.5,
        px: 0,
        transition: "all 0.2s",
        "&:hover": {
          backgroundColor: colors.hover_bg,
          mx: -2,
          px: 2,
          borderRadius: 2,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: isDanger
              ? "rgba(239, 68, 68, 0.1)"
              : `${colors.primary_accent}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            sx={{
              fontSize: "1.3rem",
              color: isDanger ? "#ef4444" : colors.primary_accent,
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body1"
            sx={{
              color: isDanger ? "#ef4444" : colors.primary_text,
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: colors.secondary_text,
              fontSize: "0.85rem",
              lineHeight: 1.4,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      {/* Action Component */}
      <Box sx={{ ml: 2, flexShrink: 0 }}>
        {isSwitch && (
          <Switch
            checked={switchChecked}
            onChange={onSwitchChange}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: colors.primary_accent,
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: colors.primary_accent,
              },
            }}
          />
        )}
        {isButton && (
          <Button
            variant="outlined"
            size="small"
            onClick={onButtonClick}
            sx={{
              borderColor: isDanger ? "#ef4444" : colors.primary_accent,
              color: isDanger ? "#ef4444" : colors.primary_accent,
              textTransform: "none",
              fontWeight: 600,
              minWidth: 80,
              "&:hover": {
                borderColor: isDanger ? "#dc2626" : colors.button_hover,
                backgroundColor: isDanger
                  ? "rgba(239, 68, 68, 0.1)"
                  : `${colors.primary_accent}15`,
              },
            }}
          >
            {buttonText}
          </Button>
        )}
        {isSelect && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectValue}
              onChange={onSelectChange}
              sx={{
                color: colors.primary_text,
                backgroundColor: colors.secondary_bg,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border_color,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary_accent,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary_accent,
                },
                "& .MuiSvgIcon-root": {
                  color: colors.primary_text,
                },
              }}
            >
              {selectOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {action && action}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        backgroundColor: colors.primary_bg,
        width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
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
          backgroundColor: colors.tertiary_bg,
          borderBottom: `1px solid ${colors.border_color}`,
          p: isSmallScreen ? 2 : 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: colors.secondary_text,
              backgroundColor: colors.secondary_bg,
              width: 40,
              height: 40,
              "&:hover": {
                backgroundColor: colors.hover_bg,
                color: colors.primary_accent,
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography
              variant={isSmallScreen ? "h6" : "h5"}
              sx={{
                color: colors.primary_text,
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              Settings
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.secondary_text,
                fontSize: "0.85rem",
              }}
            >
              Manage your preferences and account settings
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: isSmallScreen ? 2 : 3,
          backgroundColor: colors.secondary_bg,
        }}
        className="custom-scrollbar"
      >
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          {/* Appearance Section */}
          <Paper
            sx={{
              backgroundColor: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 3,
              p: 3,
              mb: 3,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${colors.primary_accent}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PaletteIcon
                  sx={{ color: colors.primary_accent, fontSize: "1.3rem" }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                Appearance
              </Typography>
            </Box>

            <SettingItem
              icon={isDark ? DarkModeIcon : LightModeIcon}
              title="Theme Mode"
              description={`Currently using ${isDark ? "dark" : "light"} mode`}
              isSwitch
              switchChecked={isDark}
              onSwitchChange={handleThemeToggle}
            />
          </Paper>

          {/* Notifications Section */}
          <Paper
            sx={{
              backgroundColor: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 3,
              p: 3,
              mb: 3,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${colors.primary_accent}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NotificationsIcon
                  sx={{ color: colors.primary_accent, fontSize: "1.3rem" }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                Notifications
              </Typography>
            </Box>

            <SettingItem
              icon={EmailIcon}
              title="Email Notifications"
              description="Receive email updates about expenses and activities"
              isSwitch
              switchChecked={emailNotifications}
              onSwitchChange={(e) => {
                const checked = e.target.checked;
                setEmailNotifications(checked);
                updateSettings({ emailNotifications: checked });
                showSnackbar(
                  `Email notifications ${checked ? "enabled" : "disabled"}`,
                  "success"
                );
              }}
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={AssessmentIcon}
              title="Budget Alerts"
              description="Get notified when approaching budget limits"
              isSwitch
              switchChecked={budgetAlerts}
              onSwitchChange={(e) => {
                const checked = e.target.checked;
                setBudgetAlerts(checked);
                updateSettings({ budgetAlerts: checked });
                showSnackbar(
                  `Budget alerts ${checked ? "enabled" : "disabled"}`,
                  "success"
                );
              }}
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={DescriptionIcon}
              title="Weekly Reports"
              description="Receive weekly expense summaries via email"
              isSwitch
              switchChecked={weeklyReports}
              onSwitchChange={(e) => {
                const checked = e.target.checked;
                setWeeklyReports(checked);
                updateSettings({ weeklyReports: checked });
                showSnackbar(
                  `Weekly reports ${checked ? "enabled" : "disabled"}`,
                  "success"
                );
              }}
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={NotificationsIcon}
              title="Push Notifications"
              description="Receive real-time notifications in your browser"
              isSwitch
              switchChecked={pushNotifications}
              onSwitchChange={(e) => {
                const checked = e.target.checked;
                setPushNotifications(checked);
                updateSettings({ pushNotifications: checked });
                showSnackbar(
                  `Push notifications ${checked ? "enabled" : "disabled"}`,
                  "success"
                );
              }}
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={PersonIcon}
              title="Friend Request Notifications"
              description="Get notified about new friend requests"
              isSwitch
              switchChecked={friendRequests}
              onSwitchChange={(e) => {
                const checked = e.target.checked;
                setFriendRequests(checked);
                updateSettings({ friendRequestNotifications: checked });
                showSnackbar(
                  `Friend request notifications ${
                    checked ? "enabled" : "disabled"
                  }`,
                  "success"
                );
              }}
            />
          </Paper>

          {/* Preferences Section */}
          <Paper
            sx={{
              backgroundColor: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 3,
              p: 3,
              mb: 3,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${colors.primary_accent}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LanguageIcon
                  sx={{ color: colors.primary_accent, fontSize: "1.3rem" }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                Preferences
              </Typography>
            </Box>

            <SettingItem
              icon={LanguageIcon}
              title="Language"
              description="Choose your preferred language"
              isSelect
              selectValue={language}
              selectOptions={[
                { value: "en", label: "English" },
                { value: "es", label: "Spanish" },
                { value: "fr", label: "French" },
                { value: "de", label: "German" },
                { value: "hi", label: "Hindi" },
              ]}
              onSelectChange={(e) => {
                const value = e.target.value;
                setLanguage(value);
                updateSettings({ language: value });
                showSnackbar("Language preference updated", "success");
              }}
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={MonetizationOnIcon}
              title="Default Currency"
              description="Set your preferred currency for transactions"
              isSelect
              selectValue={currency}
              selectOptions={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "INR", label: "INR (₹)" },
                { value: "JPY", label: "JPY (¥)" },
              ]}
              onSelectChange={(e) => {
                const value = e.target.value;
                setCurrency(value);
                updateSettings({ currency: value });
                showSnackbar("Currency preference updated", "success");
              }}
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={InfoIcon}
              title="Date Format"
              description="Choose how dates are displayed"
              isSelect
              selectValue={dateFormat}
              selectOptions={[
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
              ]}
              onSelectChange={(e) => {
                const value = e.target.value;
                setDateFormat(value);
                updateSettings({ dateFormat: value });
                showSnackbar("Date format updated", "success");
              }}
            />
          </Paper>

          {/* Privacy & Security Section */}
          <Paper
            sx={{
              backgroundColor: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 3,
              p: 3,
              mb: 3,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${colors.primary_accent}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldIcon
                  sx={{ color: colors.primary_accent, fontSize: "1.3rem" }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                Privacy & Security
              </Typography>
            </Box>

            <SettingItem
              icon={VisibilityIcon}
              title="Profile Visibility"
              description="Control who can see your profile information"
              isButton
              buttonText="Public"
              onButtonClick={() =>
                showSnackbar("Profile visibility settings", "info")
              }
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={SecurityIcon}
              title="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              isButton
              buttonText="Enable"
              onButtonClick={() =>
                showSnackbar("2FA setup coming soon", "info")
              }
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={BlockIcon}
              title="Blocked Users"
              description="Manage blocked users and privacy settings"
              isButton
              buttonText="Manage"
              onButtonClick={() =>
                showSnackbar("Blocked users management", "info")
              }
            />
          </Paper>

          {/* Account Management Section */}
          <Paper
            sx={{
              backgroundColor: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 3,
              p: 3,
              mb: 3,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${colors.primary_accent}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccountCircleIcon
                  sx={{ color: colors.primary_accent, fontSize: "1.3rem" }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                Account Management
              </Typography>
            </Box>

            <SettingItem
              icon={PersonIcon}
              title="Edit Profile"
              description="Update your personal information and preferences"
              isButton
              buttonText="Edit"
              onButtonClick={() => navigate("/profile")}
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={LockIcon}
              title="Change Password"
              description="Update your account password"
              isButton
              buttonText="Change"
              onButtonClick={() => setPasswordDialogOpen(true)}
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={StorageIcon}
              title="Data Export"
              description="Download all your expense data"
              isButton
              buttonText="Export"
              onButtonClick={() =>
                showSnackbar("Data export initiated", "success")
              }
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={DeleteIcon}
              title="Delete Account"
              description="Permanently delete your account and all data"
              isButton
              buttonText="Delete"
              onButtonClick={() => setDeleteDialogOpen(true)}
              isDanger
            />
          </Paper>

          {/* Help & Support Section */}
          <Paper
            sx={{
              backgroundColor: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 3,
              p: 3,
              mb: 3,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${colors.primary_accent}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HelpIcon
                  sx={{ color: colors.primary_accent, fontSize: "1.3rem" }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                Help & Support
              </Typography>
            </Box>

            <SettingItem
              icon={HelpIcon}
              title="Help Center"
              description="Browse FAQs and help articles"
              action={
                <IconButton
                  size="small"
                  sx={{ color: colors.secondary_text }}
                  onClick={() => showSnackbar("Help center", "info")}
                >
                  <ChevronRightIcon />
                </IconButton>
              }
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={SupportIcon}
              title="Contact Support"
              description="Get help from our support team"
              action={
                <IconButton
                  size="small"
                  sx={{ color: colors.secondary_text }}
                  onClick={() => showSnackbar("Contact support", "info")}
                >
                  <ChevronRightIcon />
                </IconButton>
              }
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={DescriptionIcon}
              title="Terms of Service"
              description="Read our terms and conditions"
              action={
                <IconButton
                  size="small"
                  sx={{ color: colors.secondary_text }}
                  onClick={() => showSnackbar("Terms of service", "info")}
                >
                  <ChevronRightIcon />
                </IconButton>
              }
            />
            <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
            <SettingItem
              icon={ShieldIcon}
              title="Privacy Policy"
              description="Learn about how we protect your data"
              action={
                <IconButton
                  size="small"
                  sx={{ color: colors.secondary_text }}
                  onClick={() => showSnackbar("Privacy policy", "info")}
                >
                  <ChevronRightIcon />
                </IconButton>
              }
            />
          </Paper>

          {/* App Information */}
          <Paper
            sx={{
              backgroundColor: colors.tertiary_bg,
              border: `1px solid ${colors.border_color}`,
              borderRadius: 3,
              p: 3,
              mb: 3,
              boxShadow: "none",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: `${colors.primary_accent}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <InfoIcon
                  sx={{ color: colors.primary_accent, fontSize: "1.3rem" }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary_text,
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                About
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: colors.secondary_text }}
                >
                  App Version
                </Typography>
                <Chip
                  label="v2.0.0"
                  size="small"
                  sx={{
                    backgroundColor: `${colors.primary_accent}20`,
                    color: colors.primary_accent,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: colors.secondary_text }}
                >
                  Last Updated
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.primary_text, fontWeight: 600 }}
                >
                  October 2025
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: colors.secondary_text }}
                >
                  Build Number
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.primary_text, fontWeight: 600 }}
                >
                  2025.10.29
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.tertiary_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: 3,
            minWidth: isSmallScreen ? "90%" : 400,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.primary_text,
            fontWeight: 700,
            borderBottom: `1px solid ${colors.border_color}`,
          }}
        >
          Delete Account
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography sx={{ color: colors.primary_text, mb: 2 }}>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Typography>
          <Typography sx={{ color: colors.secondary_text, fontSize: "0.9rem" }}>
            All your data, including expenses, budgets, and friends, will be
            permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: `1px solid ${colors.border_color}` }}
        >
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: colors.secondary_text,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              showSnackbar("Account deletion cancelled", "info");
            }}
            sx={{
              backgroundColor: "#ef4444",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.tertiary_bg,
            border: `1px solid ${colors.border_color}`,
            borderRadius: 3,
            minWidth: isSmallScreen ? "90%" : 400,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.primary_text,
            fontWeight: 700,
            borderBottom: `1px solid ${colors.border_color}`,
          }}
        >
          Change Password
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                color: colors.primary_text,
                backgroundColor: colors.secondary_bg,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border_color,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary_accent,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary_accent,
                },
              },
            }}
            InputLabelProps={{
              sx: { color: colors.secondary_text },
            }}
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                color: colors.primary_text,
                backgroundColor: colors.secondary_bg,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border_color,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary_accent,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary_accent,
                },
              },
            }}
            InputLabelProps={{
              sx: { color: colors.secondary_text },
            }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            variant="outlined"
            InputProps={{
              sx: {
                color: colors.primary_text,
                backgroundColor: colors.secondary_bg,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border_color,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary_accent,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary_accent,
                },
              },
            }}
            InputLabelProps={{
              sx: { color: colors.secondary_text },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: `1px solid ${colors.border_color}` }}
        >
          <Button
            onClick={() => setPasswordDialogOpen(false)}
            sx={{
              color: colors.secondary_text,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setPasswordDialogOpen(false);
              showSnackbar("Password changed successfully", "success");
            }}
            sx={{
              backgroundColor: colors.primary_accent,
              color: colors.button_text,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: colors.button_hover,
              },
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <ToastNotification
        open={snackbar.open}
        message={snackbar.message}
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${colors.secondary_bg};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.primary_accent};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary_accent};
          opacity: 0.8;
        }
      `}</style>
    </Box>
  );
};

export default Settings;
