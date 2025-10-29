import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import { toggleTheme } from "../../Redux/Theme/theme.actions";
import { logoutAction } from "../../Redux/Auth/auth.action";
import Modal from "../../pages/Landingpage/Modal";

/**
 * HeaderBar Component
 * Displays theme toggle, user profile with dropdown menu
 * Used in the main layout when not in friend view
 */
const HeaderBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const { mode } = useSelector((state) => state.theme || {});
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    <>
      <div
        className={`h-[50px] flex items-center justify-end px-4 sm:px-6  transition-colors ${
          isDark ? "bg-[#1b1b1b] " : "bg-white "
        }`}
      >
        {/* Right Section: Theme Toggle & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
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
                className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden z-50 ${
                  isDark ? "bg-[#29282b]" : "bg-white"
                } border ${isDark ? "border-gray-700" : "border-gray-200"}`}
              >
                {/* User Info Section */}
                <div
                  className={`px-4 py-3 border-b ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {user?.email}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={handleProfileNavigate}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    View Profile
                  </button>

                  <button
                    onClick={handleSettingsNavigate}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
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
                    Settings
                  </button>

                  <div
                    className={`border-t my-1 ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                  />

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDark
                        ? "text-red-400 hover:bg-gray-800"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
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
        title="Logout Confirmation"
        confirmationText="Are you sure you want to logout?"
        onApprove={handleLogout}
        onDecline={() => setIsLogoutModalOpen(false)}
        approveText="Yes"
        declineText="No"
      />
    </>
  );
};

export default HeaderBar;
