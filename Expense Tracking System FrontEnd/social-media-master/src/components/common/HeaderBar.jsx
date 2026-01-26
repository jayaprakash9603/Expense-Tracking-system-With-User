import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useMasking } from "../../hooks/useMasking";
import { toggleTheme } from "../../Redux/Theme/theme.actions";
import {
  logoutAction,
  switchUserModeAction,
} from "../../Redux/Auth/auth.action";
import { updateUserSettings } from "../../Redux/UserSettings/userSettings.action";
import Modal from "../../pages/Landingpage/Modal";
import NotificationsPanelRedux from "./NotificationsPanelRedux";
import SystemErrorIndicator from "./SystemErrorIndicator";
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
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const { currentMode } = useSelector((state) => state.auth || {});
  const { mode } = useSelector((state) => state.theme || {});
  const { isMasking, toggleMasking } = useMasking();
  const maskingEnabled = isMasking();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(5);
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  const isDark = mode === "dark";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // Get user initials for avatar fallback
  const getInitials = () => {
    const firstInitial = user?.firstName?.charAt(0)?.toUpperCase() || "";
    const lastInitial = user?.lastName?.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}`;
  };

  const avatarSrc = user?.profileImage || "";

  const handleThemeToggle = () => {
    dispatch(toggleTheme());

    // Update user settings in backend
    const newMode = isDark ? "light" : "dark";
    dispatch(updateUserSettings({ themeMode: newMode })).catch((error) => {
      console.error("Failed to update theme setting:", error);
    });
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
    setIsLogoutModalOpen(false);
  };

  const handleProfileNavigate = () => {
    navigate("/profile");
    setIsProfileOpen(false);
  };

  const handleSettingsNavigate = () => {
    navigate("/settings");
    setIsProfileOpen(false);
  };

  const handleSwitchMode = async () => {
    const newMode = currentMode === "ADMIN" ? "USER" : "ADMIN";
    const result = await dispatch(switchUserModeAction(newMode));

    if (result.success) {
      setIsProfileOpen(false);
      console.log(`Successfully switched to ${newMode} mode`);

      // Navigate to appropriate dashboard based on mode
      if (newMode === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      console.error("Failed to switch mode:", result.message);
    }
  };

  // Check if user has ADMIN role
  const hasAdminRole =
    user?.roles?.includes("ADMIN") || user?.roles?.includes("ROLE_ADMIN");

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
        <div className="flex-1 flex justify-center px-2">
          <div className="w-full" style={{ maxWidth: 360 }}>
            <GlobalHeaderMessageSlot className="justify-center" />
          </div>
        </div>

        {/* Right Section: Search, Masking Toggle, Theme Toggle & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Inline Search Bar */}
          <InlineSearchBar />

          {/* Masking Toggle Button */}
          <button
            onClick={toggleMasking}
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
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-2 focus:outline-none group"
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#14b8a6",
                  fontSize: "14px",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
                src={avatarSrc}
              >
                {!avatarSrc && getInitials()}
              </Avatar>

              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180" : ""
                } ${isDark ? "text-gray-400" : "text-gray-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div
                className={`absolute right-0 mt-3 w-64 rounded-xl shadow-2xl overflow-hidden z-50 ${
                  isDark ? "bg-[#1e1e1e]" : "bg-white"
                }`}
                style={{
                  boxShadow: isDark
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                {/* User Info Section with Avatar */}
                <div
                  className={`px-4 py-3 ${
                    isDark
                      ? "bg-gradient-to-r from-[#14b8a6]/20 to-[#06b6d4]/20"
                      : "bg-gradient-to-r from-[#14b8a6]/10 to-[#06b6d4]/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "#14b8a6",
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                      src={avatarSrc}
                    >
                      {!avatarSrc && getInitials()}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold truncate leading-tight ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p
                        className={`text-[11px] truncate leading-tight mt-0.5 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {user?.email}
                      </p>
                      {currentMode && (
                        <span
                          className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide ${
                            currentMode === "ADMIN"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {currentMode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleProfileNavigate}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-150 ${
                      isDark
                        ? "text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDark ? "bg-[#2a2a2a]" : "bg-gray-100"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">
                      {t("header.viewProfile")}
                    </span>
                  </button>

                  <button
                    onClick={handleSettingsNavigate}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-150 ${
                      isDark
                        ? "text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDark ? "bg-[#2a2a2a]" : "bg-gray-100"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">
                      {t("navigation.settings")}
                    </span>
                  </button>

                  {/* Mode Switch Button - Only show if user has ADMIN role */}
                  {hasAdminRole && (
                    <>
                      <div
                        className={`my-2 mx-4 h-px ${
                          isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      />
                      <button
                        onClick={handleSwitchMode}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-150 ${
                          isDark
                            ? "text-teal-400 hover:bg-[#2a2a2a] hover:text-teal-300"
                            : "text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDark ? "bg-teal-500/20" : "bg-teal-100"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">
                          {currentMode === "ADMIN"
                            ? t("header.switchToUserMode")
                            : t("header.switchToAdminMode")}
                        </span>
                      </button>
                    </>
                  )}

                  <div
                    className={`my-2 mx-4 h-px ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  />

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all duration-150 ${
                      isDark
                        ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        : "text-red-600 hover:bg-red-50 hover:text-red-700"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDark ? "bg-red-500/20" : "bg-red-100"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">{t("auth.logout")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title={t("modals.logoutTitle")}
        confirmationText={t("modals.logoutPrompt")}
        onApprove={handleLogout}
        onDecline={() => setIsLogoutModalOpen(false)}
        approveText={t("common.yes")}
        declineText={t("common.no")}
      />

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
