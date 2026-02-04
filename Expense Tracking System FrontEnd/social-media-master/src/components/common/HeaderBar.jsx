import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Badge } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useMasking } from "../../hooks/useMasking";
import { toggleTheme } from "../../Redux/Theme/theme.actions";
import { updateUserSettings } from "../../Redux/UserSettings/userSettings.action";
import NotificationsPanelRedux from "./NotificationsPanelRedux";
import SystemErrorIndicator from "./SystemErrorIndicator";
import ProfileDropdown from "./ProfileDropdown";
import { useTranslation } from "../../hooks/useTranslation";
import GlobalHeaderMessageSlot from "./GlobalHeaderMessage/GlobalHeaderMessageSlot";
import { InlineSearchBar, UniversalSearchModal } from "./UniversalSearch";

/**
 * HeaderBar Component
 * Displays notifications icon, theme toggle, user profile with dropdown menu
 * Used in the main layout when not in friend view
 */
const HeaderBar = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme || {});
  const { isMasking, toggleMasking } = useMasking();
  const maskingEnabled = isMasking();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(5);
  const { t } = useTranslation();

  const isDark = mode === "dark";

  const handleThemeToggle = () => {
    dispatch(toggleTheme());

    // Update user settings in backend
    const newMode = isDark ? "light" : "dark";
    dispatch(updateUserSettings({ themeMode: newMode })).catch((error) => {
      console.error("Failed to update theme setting:", error);
    });
  };

  return (
    <>
      {/* Universal Search Modal - Opens with Ctrl/Cmd + K */}
      <UniversalSearchModal />

      <div
        className={`h-[50px] flex items-center justify-between px-4 sm:px-6  transition-colors ${
          isDark ? "bg-[#1b1b1b] " : "bg-white "
        }`}
      >
        {/* Left Section: Empty or logo */}
        <div className="flex items-center gap-3">
          {/* Placeholder for left content */}
        </div>

        {/* Center Section: Global messages */}
        <div className="flex-1 flex justify-end px-2">
          <div className="w-full" style={{ maxWidth: 500 }}>
            <GlobalHeaderMessageSlot className="justify-end" />
          </div>
        </div>

        {/* Right Section: Search, Masking Toggle, Theme Toggle & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Inline Search Bar */}
          <InlineSearchBar />

          {/* Masking Toggle Button */}
          <button
            onClick={toggleMasking}
            data-shortcut="masking"
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            title={
              maskingEnabled ? t("header.showAmounts") : t("header.hideAmounts")
            }
          >
            {maskingEnabled ? (
              <VisibilityOffIcon
                className={`w-5 h-5 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              />
            ) : (
              <VisibilityIcon
                className={`w-5 h-5 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            data-shortcut="theme"
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            title={
              isDark ? t("header.switchToLight") : t("header.switchToDark")
            }
          >
            {isDark ? (
              // Sun Icon (Light Mode)
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              // Moon Icon (Dark Mode)
              <svg
                className="w-5 h-5 text-gray-700"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <SystemErrorIndicator isDark={isDark} />

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              data-shortcut="notifications"
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              title={t("header.notifications")}
            >
              <Badge
                badgeContent={unreadNotificationsCount}
                color="error"
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.625rem",
                    height: "16px",
                    minWidth: "16px",
                    padding: "0 4px",
                  },
                }}
              >
                <svg
                  className={`w-5 h-5 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </Badge>
            </button>
          </div>

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanelRedux
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNotificationRead={(unreadCount) =>
          setUnreadNotificationsCount(unreadCount)
        }
      />
    </>
  );
};

export default HeaderBar;
