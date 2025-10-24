import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Switch, Button } from "@mui/material";
import { toggleTheme } from "../../Redux/Theme/theme.actions";

/**
 * Settings Page Component
 * Provides application settings and user preferences
 */
const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme || {});
  const { user } = useSelector((state) => state.auth || {});

  const isDark = mode === "dark";

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors ${
        isDark ? "bg-[#0b0b0b] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => navigate(-1)}
            className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            ← Back
          </Button>
          <Typography
            variant="h4"
            sx={{
              color: isDark ? "white" : "#1f2937",
              fontWeight: "bold",
              mb: 1,
            }}
          >
            Settings
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            Manage your application preferences and settings
          </Typography>
        </div>

        {/* Appearance Settings */}
        <Card
          sx={{
            backgroundColor: isDark ? "#1a1a1a" : "white",
            border: isDark
              ? "1px solid rgba(20, 184, 166, 0.3)"
              : "1px solid #e5e7eb",
            mb: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: isDark ? "white" : "#1f2937",
                mb: 3,
                fontWeight: "600",
              }}
            >
              Appearance
            </Typography>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="body1"
                    sx={{ color: isDark ? "white" : "#1f2937" }}
                  >
                    Dark Mode
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isDark ? "#9ca3af" : "#6b7280", mt: 0.5 }}
                  >
                    Toggle between light and dark theme
                  </Typography>
                </div>
                <Switch
                  checked={isDark}
                  onChange={handleThemeToggle}
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
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card
          sx={{
            backgroundColor: isDark ? "#1a1a1a" : "white",
            border: isDark
              ? "1px solid rgba(20, 184, 166, 0.3)"
              : "1px solid #e5e7eb",
            mb: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: isDark ? "white" : "#1f2937",
                mb: 3,
                fontWeight: "600",
              }}
            >
              Notifications
            </Typography>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="body1"
                    sx={{ color: isDark ? "white" : "#1f2937" }}
                  >
                    Email Notifications
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isDark ? "#9ca3af" : "#6b7280", mt: 0.5 }}
                  >
                    Receive email updates about your expenses
                  </Typography>
                </div>
                <Switch
                  defaultChecked
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

              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="body1"
                    sx={{ color: isDark ? "white" : "#1f2937" }}
                  >
                    Budget Alerts
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isDark ? "#9ca3af" : "#6b7280", mt: 0.5 }}
                  >
                    Get notified when approaching budget limits
                  </Typography>
                </div>
                <Switch
                  defaultChecked
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

              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="body1"
                    sx={{ color: isDark ? "white" : "#1f2937" }}
                  >
                    Weekly Reports
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isDark ? "#9ca3af" : "#6b7280", mt: 0.5 }}
                  >
                    Receive weekly expense summaries
                  </Typography>
                </div>
                <Switch
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
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card
          sx={{
            backgroundColor: isDark ? "#1a1a1a" : "white",
            border: isDark
              ? "1px solid rgba(20, 184, 166, 0.3)"
              : "1px solid #e5e7eb",
            mb: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: isDark ? "white" : "#1f2937",
                mb: 3,
                fontWeight: "600",
              }}
            >
              Privacy
            </Typography>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="body1"
                    sx={{ color: isDark ? "white" : "#1f2937" }}
                  >
                    Profile Visibility
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isDark ? "#9ca3af" : "#6b7280", mt: 0.5 }}
                  >
                    Control who can see your profile information
                  </Typography>
                </div>
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
                  Public
                </Button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="body1"
                    sx={{ color: isDark ? "white" : "#1f2937" }}
                  >
                    Two-Factor Authentication
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isDark ? "#9ca3af" : "#6b7280", mt: 0.5 }}
                  >
                    Add an extra layer of security
                  </Typography>
                </div>
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
                  Enable
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card
          sx={{
            backgroundColor: isDark ? "#1a1a1a" : "white",
            border: isDark
              ? "1px solid rgba(20, 184, 166, 0.3)"
              : "1px solid #e5e7eb",
            mb: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: isDark ? "white" : "#1f2937",
                mb: 3,
                fontWeight: "600",
              }}
            >
              Account
            </Typography>
            <div className="space-y-3">
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/profile")}
                sx={{
                  borderColor: isDark ? "#374151" : "#d1d5db",
                  color: isDark ? "white" : "#1f2937",
                  justifyContent: "flex-start",
                  textTransform: "none",
                  py: 1.5,
                  "&:hover": {
                    borderColor: "#14b8a6",
                    backgroundColor: "rgba(20, 184, 166, 0.1)",
                  },
                }}
              >
                Edit Profile
              </Button>

              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: isDark ? "#374151" : "#d1d5db",
                  color: isDark ? "white" : "#1f2937",
                  justifyContent: "flex-start",
                  textTransform: "none",
                  py: 1.5,
                  "&:hover": {
                    borderColor: "#14b8a6",
                    backgroundColor: "rgba(20, 184, 166, 0.1)",
                  },
                }}
              >
                Change Password
              </Button>

              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  justifyContent: "flex-start",
                  textTransform: "none",
                  py: 1.5,
                  "&:hover": {
                    borderColor: "#dc2626",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                  },
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card
          sx={{
            backgroundColor: isDark ? "#1a1a1a" : "white",
            border: isDark
              ? "1px solid rgba(20, 184, 166, 0.3)"
              : "1px solid #e5e7eb",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: isDark ? "white" : "#1f2937",
                mb: 2,
                fontWeight: "600",
              }}
            >
              About
            </Typography>
            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                >
                  Version
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? "white" : "#1f2937" }}
                >
                  1.0.0
                </Typography>
              </div>
              <div className="flex justify-between py-1">
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                >
                  Last Updated
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? "white" : "#1f2937" }}
                >
                  January 2024
                </Typography>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <Button
                fullWidth
                variant="text"
                sx={{
                  color: "#14b8a6",
                  textTransform: "none",
                  justifyContent: "flex-start",
                }}
              >
                Terms of Service
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{
                  color: "#14b8a6",
                  textTransform: "none",
                  justifyContent: "flex-start",
                }}
              >
                Privacy Policy
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{
                  color: "#14b8a6",
                  textTransform: "none",
                  justifyContent: "flex-start",
                }}
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
