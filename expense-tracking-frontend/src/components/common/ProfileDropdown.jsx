import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import {
  logoutAction,
  switchUserModeAction,
} from "../../Redux/Auth/auth.action";
import Modal from "../../pages/Landingpage/Modal";
import { useTranslation } from "../../hooks/useTranslation";

/**
 * ProfileDropdown Component
 * Reusable profile dropdown with avatar, user info, and menu items
 * Used in HeaderBar and SharedViewPage
 */
const ProfileDropdown = ({
  onLogoutSuccess,
  showModeSwitch = true, // Whether to show mode switch for admin users
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, currentMode } = useSelector((state) => state.auth || {});
  const { mode } = useSelector((state) => state.theme || {});
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
    setIsLogoutModalOpen(false);
    onLogoutSuccess?.();
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
      {/* Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleProfileClick}
          data-shortcut="profile"
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
                data-shortcut="profile-view"
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
                <span className="font-medium">{t("header.viewProfile")}</span>
              </button>

              <button
                onClick={handleSettingsNavigate}
                data-shortcut="profile-settings"
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
                <span className="font-medium">{t("navigation.settings")}</span>
              </button>

              {/* Mode Switch Button - Only show if user has ADMIN role */}
              {showModeSwitch && hasAdminRole && (
                <>
                  <div
                    className={`my-2 mx-4 h-px ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  />
                  <button
                    onClick={handleSwitchMode}
                    data-shortcut="profile-switch-mode"
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
                data-shortcut="profile-logout"
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
    </>
  );
};

export default ProfileDropdown;
