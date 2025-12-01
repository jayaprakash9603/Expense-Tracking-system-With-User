import React, { useState } from "react";
import {
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  AdminPanelContainer,
  AdminPageHeader,
  SectionCard,
} from "./components";

const AdminSettings = () => {
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState("instant");

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordExpiry, setPasswordExpiry] = useState("90");

  // Appearance Settings
  const [defaultTheme, setDefaultTheme] = useState("dark");
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // System Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");

  const handleSaveSettings = () => {
    console.log("Saving settings...");
    // Save logic here
  };

  const handleResetSettings = () => {
    console.log("Resetting to defaults...");
    // Reset logic here
  };

  return (
    <AdminPanelContainer>
      {/* Page Header */}
      <AdminPageHeader
        title="Settings"
        description="Configure system preferences and behavior"
        actions={
          <div className="flex gap-3">
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleResetSettings}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              style={{
                backgroundColor: "#14b8a6",
                color: "#fff",
              }}
              onClick={handleSaveSettings}
            >
              Save Changes
            </Button>
          </div>
        }
      />

      {/* Notification Settings */}
      <SectionCard title="Notification Settings" className="mb-6">
        <div className="space-y-4">
          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                color="primary"
              />
            }
            label="Email Notifications"
          />
          <p className="text-sm opacity-70 ml-12 -mt-2">
            Receive notifications via email for important events
          </p>

          <FormControlLabel
            control={
              <Switch
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                color="primary"
              />
            }
            label="Push Notifications"
          />
          <p className="text-sm opacity-70 ml-12 -mt-2">
            Get real-time push notifications in your browser
          </p>

          <FormControl fullWidth className="mt-4">
            <InputLabel>Notification Frequency</InputLabel>
            <Select
              value={notificationFrequency}
              onChange={(e) => setNotificationFrequency(e.target.value)}
              label="Notification Frequency"
            >
              <MuiMenuItem value="instant">Instant</MuiMenuItem>
              <MuiMenuItem value="hourly">Hourly Digest</MuiMenuItem>
              <MuiMenuItem value="daily">Daily Digest</MuiMenuItem>
              <MuiMenuItem value="weekly">Weekly Summary</MuiMenuItem>
            </Select>
          </FormControl>
        </div>
      </SectionCard>

      {/* Security Settings */}
      <SectionCard title="Security Settings" className="mb-6">
        <div className="space-y-4">
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                color="primary"
              />
            }
            label="Two-Factor Authentication"
          />
          <p className="text-sm opacity-70 ml-12 -mt-2">
            Require 2FA for all admin accounts
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <TextField
              label="Session Timeout (minutes)"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              fullWidth
              helperText="Idle time before automatic logout"
            />
            <TextField
              label="Password Expiry (days)"
              type="number"
              value={passwordExpiry}
              onChange={(e) => setPasswordExpiry(e.target.value)}
              fullWidth
              helperText="Force password change after this period"
            />
          </div>

          <TextField
            label="Max Login Attempts"
            type="number"
            value={maxLoginAttempts}
            onChange={(e) => setMaxLoginAttempts(e.target.value)}
            fullWidth
            helperText="Lock account after this many failed attempts"
            className="mt-4"
          />
        </div>
      </SectionCard>

      {/* Appearance Settings */}
      <SectionCard title="Appearance Settings" className="mb-6">
        <div className="space-y-4">
          <FormControl fullWidth>
            <InputLabel>Default Theme</InputLabel>
            <Select
              value={defaultTheme}
              onChange={(e) => setDefaultTheme(e.target.value)}
              label="Default Theme"
            >
              <MuiMenuItem value="light">Light</MuiMenuItem>
              <MuiMenuItem value="dark">Dark</MuiMenuItem>
              <MuiMenuItem value="auto">Auto (System Preference)</MuiMenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                color="primary"
              />
            }
            label="Compact Mode"
          />
          <p className="text-sm opacity-70 ml-12 -mt-2">
            Use a more condensed layout with reduced spacing
          </p>

          <FormControlLabel
            control={
              <Switch
                checked={animationsEnabled}
                onChange={(e) => setAnimationsEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Animations"
          />
          <p className="text-sm opacity-70 ml-12 -mt-2">
            Show smooth transitions and animations throughout the interface
          </p>
        </div>
      </SectionCard>

      {/* System Settings */}
      <SectionCard title="System Settings" className="mb-6">
        <div className="space-y-4">
          <FormControlLabel
            control={
              <Switch
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                color="warning"
              />
            }
            label="Maintenance Mode"
          />
          <p className="text-sm opacity-70 ml-12 -mt-2">
            Temporarily disable access for non-admin users
          </p>

          <FormControlLabel
            control={
              <Switch
                checked={autoBackup}
                onChange={(e) => setAutoBackup(e.target.checked)}
                color="primary"
              />
            }
            label="Automatic Backups"
          />
          <p className="text-sm opacity-70 ml-12 -mt-2">
            Automatically backup system data at scheduled intervals
          </p>

          <FormControl fullWidth className="mt-4">
            <InputLabel>Backup Frequency</InputLabel>
            <Select
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value)}
              label="Backup Frequency"
              disabled={!autoBackup}
            >
              <MuiMenuItem value="hourly">Every Hour</MuiMenuItem>
              <MuiMenuItem value="daily">Daily</MuiMenuItem>
              <MuiMenuItem value="weekly">Weekly</MuiMenuItem>
              <MuiMenuItem value="monthly">Monthly</MuiMenuItem>
            </Select>
          </FormControl>
        </div>
      </SectionCard>

      {/* Application Info */}
      <SectionCard title="Application Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-70 mb-1">Version</p>
            <p className="font-medium">2.5.0</p>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1">Last Updated</p>
            <p className="font-medium">January 15, 2024</p>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1">Database Version</p>
            <p className="font-medium">PostgreSQL 14.5</p>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1">Server Status</p>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
              Operational
            </span>
          </div>
        </div>
      </SectionCard>
    </AdminPanelContainer>
  );
};

export default AdminSettings;
