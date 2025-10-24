import React, { useState } from "react";
import { Avatar } from "@mui/material";
import MenuItem from "./MenuItem";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAction } from "../../Redux/Auth/auth.action";
import Modal from "./Modal";
import {
  getThemeColors,
  BRAND_GRADIENT_COLORS,
} from "../../config/themeConfig";

const Left = () => {
  const { user } = useSelector((state) => state.auth || {});
  const { mode } = useSelector((state) => state.theme || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const themeColors = getThemeColors(mode);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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
  const avatarSrc = user?.image || "";

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
            <MenuItem
              name="Home"
              path="/dashboard"
              icon="https://cdn-icons-png.flaticon.com/128/25/25694.png"
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="Expenses"
              path="/expenses"
              icon="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
              setIsSidebarOpen={setIsSidebarOpen}
            />

            <MenuItem
              name="Categories"
              path="/category-flow"
              icon={require("../../assests/category.png")}
              setIsSidebarOpen={setIsSidebarOpen}
            />

            <MenuItem
              name="Payments"
              path="/payment-method"
              icon={require("../../assests/payment-method.png")}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="Bill"
              path="/bill"
              icon={require("../../assests/bill.png")}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="Friends"
              path="/friends"
              icon={require("../../assests/friends.png")}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="Budgets"
              path="/budget"
              icon={require("../../assests/budget.png")}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            {/* <MenuItem
              name="Groups"
              path="/groups"
              icon={require("../../assests/group.png")}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="Chats"
              path="/chats"
              icon={require("../../assests/chat.png")}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="More"
              path="/all"
              icon={require("../../assests/more.png")}
              setIsSidebarOpen={setIsSidebarOpen}
            /> */}
            <MenuItem
              name="Logout"
              path="/login"
              icon={require("../../assests/logout.png")}
              onClick={() => setIsConfirmModalOpen(true)}
              setIsSidebarOpen={setIsSidebarOpen}
            />
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
        title="Logout Confirmation"
        confirmationText="Are you sure Logout ?"
        onApprove={handleLogout}
        onDecline={handleDeclineConfirm}
        approveText="Yes"
        declineText="No"
      />
    </>
  );
};

export default Left;
