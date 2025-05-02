import React, { useState } from "react";
import { Avatar } from "@mui/material";
import MenuItem from "./MenuItem";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAction } from "../../Redux/Auth/auth.action";
import Modal from "./Modal";

const Left = () => {
  const { user } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
    setIsSidebarOpen(false); // Close sidebar on logout
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
          className="p-2 bg-[#29282b] rounded-md text-white focus:outline-none"
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
          className="fixed inset-0 bg-[#1b1b1b] z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-[350px] bg-[#1b1b1b] text-white flex flex-col justify-between items-center py-6 z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:w-[400px] md:static md:translate-x-0 lg:w-[450px]`}
      >
        {/* Top Section */}
        <div className="flex flex-col items-center w-full px-4">
          {/* Profile */}
          <div className="w-[90%] max-w-[260px] h-[180px] flex flex-col justify-center items-center mb-4">
            <div className="w-20 h-20 mb-2">
              <Avatar
                sx={{ width: "100%", height: "100%", bgcolor: "#14b8a6" }}
                src={avatarSrc}
              >
                {!avatarSrc && getInitials()}
              </Avatar>
            </div>
            <p className="text-base font-semibold text-center">
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
              path="/home"
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
              name="Transactions"
              path="/transactions"
              icon="https://cdn-icons-png.flaticon.com/128/4475/4475436.png"
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="Insights"
              path="/credit-due"
              icon="https://cdn-icons-png.flaticon.com/128/15867/15867059.png"
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="Reports"
              path="/settings"
              icon="https://cdn-icons-png.flaticon.com/128/3094/3094851.png"
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="Budget"
              path="/budget"
              icon="https://cdn-icons-png.flaticon.com/128/2488/2488980.png"
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="Profile"
              path="/profile"
              icon="https://cdn-icons-png.flaticon.com/128/456/456283.png"
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <MenuItem
              name="Logout"
              path="/login"
              icon="https://cdn-icons-png.flaticon.com/128/1828/1828471.png"
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
            <span style={{ color: "#d8fffb", fontSize: "22px" }}>Ex</span>
            <span style={{ color: "rgb(146, 233, 220)", fontSize: "22px" }}>
              p
            </span>
            <span style={{ color: "rgb(0, 218, 196)", fontSize: "22px" }}>
              en
            </span>
            <span style={{ color: "rgb(0, 199, 171)", fontSize: "22px" }}>
              s
            </span>
            <span style={{ color: "rgb(0, 168, 133)", fontSize: "22px" }}>
              i
            </span>
            <span style={{ color: "rgb(0, 137, 102)", fontSize: "22px" }}>
              o
            </span>
            <span style={{ color: "#14b8a6", fontSize: "22px" }}> Finance</span>
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
