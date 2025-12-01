import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SecurityIcon from "@mui/icons-material/Security";
import PaletteIcon from "@mui/icons-material/Palette";
import StorageIcon from "@mui/icons-material/Storage";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { getThemeColors } from "../../../config/themeConfig";
import "./AdminPanel.css";

const AdminSettings = () => {
  const { mode } = useSelector((state) => state.theme || {});
  const themeColors = getThemeColors(mode);

  // Settings state
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    securityAlerts: true,
    maintenanceAlerts: false,
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: "30",
    passwordExpiry: "90",
    maxLoginAttempts: "5",
    ipWhitelisting: false,
    
    // Appearance Settings
    defaultTheme: "light",
    compactMode: false,
    showAnimations: true,
    
    // System Settings
    dataRetention: "365",
    autoBackup: true,
    backupFrequency: "daily",
    maintenanceMode: false,
    debugMode: false,
  });

  const handleToggle = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSaveSettings = () => {
    alert("Settings saved successfully!");
    console.log("Saved settings:", settings);
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div
      className="p-6 rounded-lg mb-6"
      style={{ backgroundColor: themeColors.card_bg }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon style={{ color: themeColors.accent, fontSize: 28 }} />
        <h3
          className="text-xl font-semibold"
          style={{ color: themeColors.primary_text }}
        >
          {title}
        </h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  return (
    <div
      className="admin-panel-container"
      style={{
        backgroundColor: themeColors.secondary_bg,
        color: themeColors.primary_text,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: themeColors.primary_text }}
          >
            System Settings
          </h1>
          <p style={{ color: themeColors.secondary_text }}>
            Configure system preferences and security options
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          style={{
            backgroundColor: themeColors.accent,
            color: "#fff",
          }}
        >
          Save Changes
        </Button>
      </div>

      {/* Notification Settings */}
      <SettingSection title="Notification Preferences" icon={NotificationsIcon}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
              color="primary"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Email Notifications
            </span>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.pushNotifications}
              onChange={() => handleToggle("pushNotifications")}
              color="primary"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Push Notifications
            </span>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.weeklyReports}
              onChange={() => handleToggle("weeklyReports")}
              color="primary"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Weekly Summary Reports
            </span>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.securityAlerts}
              onChange={() => handleToggle("securityAlerts")}
              color="primary"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Security Alerts <Chip label="Recommended" size="small" color="error" />
            </span>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.maintenanceAlerts}
              onChange={() => handleToggle("maintenanceAlerts")}
              color="primary"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Maintenance Notifications
            </span>
          }
        />
      </SettingSection>

      {/* Security Settings */}
      <SettingSection title="Security Configuration" icon={SecurityIcon}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.twoFactorAuth}
              onChange={() => handleToggle("twoFactorAuth")}
              color="primary"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Two-Factor Authentication <Chip label="Recommended" size="small" color="success" />
            </span>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormControl size="small" fullWidth>
            <InputLabel style={{ color: themeColors.secondary_text }}>
              Session Timeout (minutes)
            </InputLabel>
            <Select
              value={settings.sessionTimeout}
              onChange={(e) => handleChange("sessionTimeout", e.target.value)}
              label="Session Timeout (minutes)"
              style={{
                color: themeColors.primary_text,
                backgroundColor: themeColors.primary_bg,
              }}
            >
              <MuiMenuItem value="15">15 minutes</MuiMenuItem>
              <MuiMenuItem value="30">30 minutes</MuiMenuItem>
              <MuiMenuItem value="60">1 hour</MuiMenuItem>
              <MuiMenuItem value="120">2 hours</MuiMenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel style={{ color: themeColors.secondary_text }}>
              Password Expiry (days)
            </InputLabel>
            <Select
              value={settings.passwordExpiry}
              onChange={(e) => handleChange("passwordExpiry", e.target.value)}
              label="Password Expiry (days)"
              style={{
                color: themeColors.primary_text,
                backgroundColor: themeColors.primary_bg,
              }}
            >
              <MuiMenuItem value="30">30 days</MuiMenuItem>
              <MuiMenuItem value="60">60 days</MuiMenuItem>
              <MuiMenuItem value="90">90 days</MuiMenuItem>
              <MuiMenuItem value="never">Never</MuiMenuItem>
            </Select>
          </FormControl>
        </div>
        <TextField
          label="Max Login Attempts"
          type="number"
          size="small"
          value={settings.maxLoginAttempts}
          onChange={(e) => handleChange("maxLoginAttempts", e.target.value)}
          fullWidth
          InputProps={{
            style: {
              color: themeColors.primary_text,
              backgroundColor: themeColors.primary_bg,
            },
          }}
          InputLabelProps={{
            style: { color: themeColors.secondary_text },
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.ipWhitelisting}
              onChange={() => handleToggle("ipWhitelisting")}
              color="primary"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Enable IP Whitelisting
            </span>
          }
        />
      </SettingSection>

      {/* Appearance Settings */}
      <SettingSection title="Appearance Settings" icon={PaletteIcon}>
        <FormControl size="small" fullWidth>
          <InputLabel style={{ color: themeColors.secondary_text }}>
            Default Theme
          </InputLabel>
          <Select
            value={settings.defaultTheme}
            onChange={(e) => handleChange("defaultTheme", e.target.value)}
            label="Default Theme"
            style={{
              color: themeColors.primary_text,
              backgroundColor: themeColors.primary_bg,
            }}
          >
            <MuiMenuItem value="light">Light</MuiMenuItem>
            <MuiMenuItem value="dark">Dark</MuiMenuItem>
            <MuiMenuItem value="auto">Auto (System)</MuiMenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={settings.compactMode}
              onChange={() => handleToggle("compactMode")}
              color="primary"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Compact Mode
            </span>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.showAnimations}
              onChange={() => handleToggle("showAnimations")}
              color="primary"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Show Animations
            </span>
          }
        />
      </SettingSection>

      {/* System Settings */}
      <SettingSection title="System Configuration" icon={StorageIcon}>
        <FormControl size="small" fullWidth>
          <InputLabel style={{ color: themeColors.secondary_text }}>
            Data Retention (days)
          </InputLabel>
          <Select
            value={settings.dataRetention}
            onChange={(e) => handleChange("dataRetention", e.target.value)}
            label="Data Retention (days)"
            style={{
              color: themeColors.primary_text,
              backgroundColor: themeColors.primary_bg,
            }}
          >
            <MuiMenuItem value="90">90 days</MuiMenuItem>
            <MuiMenuItem value="180">180 days</MuiMenuItem>
            <MuiMenuItem value="365">1 year</MuiMenuItem>
            <MuiMenuItem value="730">2 years</MuiMenuItem>
            <MuiMenuItem value="unlimited">Unlimited</MuiMenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={settings.autoBackup}
              onChange={() => handleToggle("autoBackup")}
              color="primary"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Automatic Backups <Chip label="Recommended" size="small" color="success" />
            </span>
          }
        />
        {settings.autoBackup && (
          <FormControl size="small" fullWidth>
            <InputLabel style={{ color: themeColors.secondary_text }}>
              Backup Frequency
            </InputLabel>
            <Select
              value={settings.backupFrequency}
              onChange={(e) => handleChange("backupFrequency", e.target.value)}
              label="Backup Frequency"
              style={{
                color: themeColors.primary_text,
                backgroundColor: themeColors.primary_bg,
              }}
            >
              <MuiMenuItem value="hourly">Hourly</MuiMenuItem>
              <MuiMenuItem value="daily">Daily</MuiMenuItem>
              <MuiMenuItem value="weekly">Weekly</MuiMenuItem>
              <MuiMenuItem value="monthly">Monthly</MuiMenuItem>
            </Select>
          </FormControl>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={settings.maintenanceMode}
              onChange={() => handleToggle("maintenanceMode")}
              color="warning"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Maintenance Mode <Chip label="Caution" size="small" color="warning" />
            </span>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.debugMode}
              onChange={() => handleToggle("debugMode")}
              color="error"
            />
          }
          label={
            <span style={{ color: themeColors.primary_text }}>
              Debug Mode <Chip label="Dev Only" size="small" color="error" />
            </span>
          }
        />
      </SettingSection>
    </div>
  );
};

export default AdminSettings;
