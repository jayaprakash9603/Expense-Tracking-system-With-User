import React, { useState } from "react";
import { Avatar } from "@mui/material";
import MenuItem from "./MenuItem";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAction } from "../../Redux/Auth/auth.action";
import Modal from "./Modal";
import { useTranslation } from "../../hooks/useTranslation";
import {
  getThemeColors,
  BRAND_GRADIENT_COLORS,
} from "../../config/themeConfig";

// Import MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CategoryIcon from "@mui/icons-material/Category";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BarChartIcon from "@mui/icons-material/BarChart";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupsIcon from "@mui/icons-material/Groups";
import ShareIcon from "@mui/icons-material/Share";
import PublicIcon from "@mui/icons-material/Public";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const Left = () => {
  const { user } = useSelector((state) => state.auth || {});
  const { currentMode } = useSelector((state) => state.auth || {});
  const { mode } = useSelector((state) => state.theme || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const themeColors = getThemeColors(mode);
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Check if user has ADMIN role
  const hasAdminRole =
    user?.roles?.includes("ADMIN") || user?.roles?.includes("ROLE_ADMIN");
  const isAdminMode = currentMode === "ADMIN";

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
    setIsSidebarOpen(false);
    setIsConfirmModalOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDeclineConfirm = () => {
    setIsConfirmModalOpen(false);
  };

  // Get user initials for fallback avatar
  const getInitials = () => {
    const firstInitial = user?.firstName?.charAt(0)?.toUpperCase() || "";
    const lastInitial = user?.lastName?.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}`;
  };

  // Determine avatar source or fallback
  const avatarSrc = user?.profileImage || "";

  return (
    <>
      {/* Hamburger Menu (Visible on Mobile) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md focus:outline-none"
          style={{
            backgroundColor: themeColors.active_bg,
            color: themeColors.primary_text,
          }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isSidebarOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* Overlay (Hides Background on Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: themeColors.modal_overlay }}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-[350px] flex flex-col justify-between items-center py-6 z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:w-[400px] md:static md:translate-x-0 lg:w-[450px]`}
        style={{
          backgroundColor: themeColors.primary_bg,
          color: themeColors.primary_text,
        }}
      >
        {/* Top Section */}
        <div className="flex flex-col items-center w-full px-4">
          {/* Profile */}
          <div className="w-[90%] max-w-[260px] h-[180px] flex flex-col justify-center items-center mb-4">
            <div className="w-20 h-20 mb-2">
              <Avatar
                sx={{
                  width: "100%",
                  height: "100%",
                  bgcolor: themeColors.avatar_bg,
                  color: themeColors.avatar_text,
                }}
                src={avatarSrc}
              >
                {!avatarSrc && getInitials()}
              </Avatar>
            </div>
            <p
              className="text-base font-semibold text-center"
              style={{ color: themeColors.primary_text }}
            >
              {user?.firstName?.charAt(0).toUpperCase() +
                user?.firstName?.slice(1)}{" "}
              {user?.lastName?.charAt(0).toUpperCase() +
                user?.lastName?.slice(1)}
            </p>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col items-center w-full max-w-[360px] space-y-2">
            {/* Show different menu based on current mode */}
            {hasAdminRole && isAdminMode ? (
              <>
                {/* ADMIN MODE - Show only admin menu items */}
                <div className="w-full px-4 py-1">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: themeColors.secondary_text }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("navigation.adminPanelHeading")}
                  </p>
                </div>

                <MenuItem
                  name={t("navigation.dashboard")}
                  path="/admin/dashboard"
                  icon={<DashboardIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.userManagement")}
                  path="/admin/users"
                  icon={<PersonIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.roleManagement")}
                  path="/admin/roles"
                  icon={<AdminPanelSettingsIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.systemAnalytics")}
                  path="/admin/analytics"
                  icon={<BarChartIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.auditLogs")}
                  path="/admin/audit"
                  icon={<HistoryIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.reports")}
                  path="/admin/reports"
                  icon={<AssessmentIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.settings")}
                  path="/admin/settings"
                  icon={<SettingsIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              </>
            ) : (
              <>
                {/* USER MODE - Show regular user menu items */}
                <MenuItem
                  name={t("navigation.home")}
                  path="/dashboard"
                  icon={<HomeIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.expenses")}
                  path="/expenses"
                  icon={<ReceiptLongIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />

                {/* <MenuItem
                  name={t("navigation.history")}
                  path="/history"
                  icon={<HistoryIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                /> */}

                <MenuItem
                  name={t("navigation.categories")}
                  path="/category-flow"
                  icon={<CategoryIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />

                <MenuItem
                  name={t("navigation.payments")}
                  path="/payment-method"
                  icon={<PaymentIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.bill")}
                  path="/bill"
                  icon={<ReceiptIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.friends")}
                  path="/friends"
                  icon={<PeopleIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.groups")}
                  path="/groups"
                  icon={<GroupsIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.budgets")}
                  path="/budget"
                  icon={<AccountBalanceWalletIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.reports")}
                  path="/reports"
                  icon={<AssessmentIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.myShares")}
                  path="/my-shares"
                  icon={<ShareIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.publicShares")}
                  path="/public-shares"
                  icon={<PublicIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
                <MenuItem
                  name={t("navigation.sharedWithMe")}
                  path="/shared-with-me"
                  icon={<PersonAddIcon />}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              </>
            )}
          </div>
        </div>

        {/* Footer Logo Text */}
        <div className="mb-4 w-full flex flex-col items-center px-4">
          <p
            className="text-center text-[18px] md:text-[20px] font-bold leading-[26px] font-[Syncopate]"
            style={{ width: "90%", whiteSpace: "pre-line" }}
          >
            <span
              style={{
                color: BRAND_GRADIENT_COLORS[0].color,
                fontSize: BRAND_GRADIENT_COLORS[0].fontSize,
              }}
            >
              Ex
            </span>
            <span
              style={{
                color: BRAND_GRADIENT_COLORS[1].color,
                fontSize: BRAND_GRADIENT_COLORS[1].fontSize,
              }}
            >
              p
            </span>
            <span
              style={{
                color: BRAND_GRADIENT_COLORS[2].color,
                fontSize: BRAND_GRADIENT_COLORS[2].fontSize,
              }}
            >
              en
            </span>
            <span
              style={{
                color: BRAND_GRADIENT_COLORS[3].color,
                fontSize: BRAND_GRADIENT_COLORS[3].fontSize,
              }}
            >
              s
            </span>
            <span
              style={{
                color: BRAND_GRADIENT_COLORS[4].color,
                fontSize: BRAND_GRADIENT_COLORS[4].fontSize,
              }}
            >
              i
            </span>
            <span
              style={{
                color: BRAND_GRADIENT_COLORS[5].color,
                fontSize: BRAND_GRADIENT_COLORS[5].fontSize,
              }}
            >
              o
            </span>
            <span
              style={{
                color: BRAND_GRADIENT_COLORS[6].color,
                fontSize: BRAND_GRADIENT_COLORS[6].fontSize,
              }}
            >
              {" "}
              Finance
            </span>
          </p>
        </div>
      </div>
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={t("modals.logoutTitle")}
        confirmationText={t("modals.logoutPrompt")}
        onApprove={handleLogout}
        onDecline={handleDeclineConfirm}
        approveText={t("common.yes")}
        declineText={t("common.no")}
      />
    </>
  );
};

export default Left;
