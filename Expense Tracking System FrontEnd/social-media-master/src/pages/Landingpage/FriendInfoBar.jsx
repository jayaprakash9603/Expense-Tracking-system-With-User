import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  CircularProgress,
} from "@mui/material";

const FriendInfoBar = ({
  friendship,
  friendId,
  friends = [],
  loading = false,
  onFriendChange,
  showInfoBar = true,
}) => {
  const [showFriendDropdown, setShowFriendDropdown] = useState(false);
  const friendDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        friendDropdownRef.current &&
        !friendDropdownRef.current.contains(event.target)
      ) {
        setShowFriendDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If loading, show skeleton
  if (loading) {
    return (
      <div
        className="bg-[#1b1b1b] rounded-lg mx-4 mt-2 flex items-center justify-between relative"
        style={{ height: "50px", padding: "0 12px" }}
      >
        <div className="flex items-center gap-2">
          <Skeleton
            variant="circular"
            width={28}
            height={28}
            sx={{ bgcolor: "#333" }}
          />
          <div>
            <Skeleton
              variant="text"
              width={80}
              height={14}
              sx={{ bgcolor: "#333" }}
            />
            <Skeleton
              variant="text"
              width={60}
              height={10}
              sx={{ bgcolor: "#333" }}
            />
          </div>
          <div className="w-8 h-[2px] bg-[#333]"></div>
          <Skeleton
            variant="circular"
            width={28}
            height={28}
            sx={{ bgcolor: "#333" }}
          />
          <div>
            <Skeleton
              variant="text"
              width={80}
              height={14}
              sx={{ bgcolor: "#333" }}
            />
            <Skeleton
              variant="text"
              width={60}
              height={10}
              sx={{ bgcolor: "#333" }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton
            variant="rounded"
            width={80}
            height={24}
            sx={{ bgcolor: "#333" }}
          />
          <Skeleton
            variant="rounded"
            width={80}
            height={24}
            sx={{ bgcolor: "#333" }}
          />
          <Skeleton
            variant="rounded"
            width={100}
            height={24}
            sx={{ bgcolor: "#333" }}
          />
        </div>
      </div>
    );
  }

  // If no friendship data or not showing info bar, return empty div with height
  if (!friendship || !showInfoBar) {
    return <div className="h-[50px]"></div>;
  }

  const handleFriendSelect = (friendId) => {
    if (onFriendChange) {
      onFriendChange(friendId);
    } else {
      navigate(`/friends/expenses/${friendId}`);
    }
    setShowFriendDropdown(false);
  };

  return (
    <>
      {/* Friend Info Bar - 50px with integrated scrolling text */}
      <div
        className="bg-[#1b1b1b] rounded-lg mx-4 mt-2 flex items-center justify-between relative"
        style={{
          height: "50px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          borderLeft: `4px solid ${
            friendship.status === "ACCEPTED" ? "#00DAC6" : "#5b7fff"
          }`,
          padding: "0 12px",
        }}
      >
        {/* Left section - User details */}
        <div className="flex items-center gap-2">
          {/* Requester avatar with initial */}
          <Avatar
            src={friendship.requester?.image}
            alt={friendship.requester?.firstName}
            sx={{
              width: 28,
              height: 28,
              bgcolor: "#00DAC6",
              border: "1px solid #00DAC6",
              fontSize: "12px",
            }}
          >
            {friendship.requester?.firstName?.charAt(0)}
          </Avatar>

          {/* Requester details */}
          <div className="flex flex-col justify-center">
            <span className="text-[#00DAC6] font-medium text-xs leading-tight">
              {friendship.requester?.firstName}{" "}
              {friendship.requester?.lastName?.charAt(0)}
            </span>
            <span className="text-gray-400 text-[10px] leading-tight">
              {friendship.requester?.email?.split("@")[0]}
            </span>
          </div>

          {/* Connection indicator */}
          <div className="flex items-center mx-1">
            <div className="w-8 h-[2px] bg-gradient-to-r from-[#00DAC6] to-[#5b7fff]"></div>
          </div>

          {/* Recipient avatar with initial */}
          <Avatar
            src={friendship.recipient?.image}
            alt={friendship.recipient?.firstName}
            sx={{
              width: 28,
              height: 28,
              bgcolor: "#5b7fff",
              border: "1px solid #5b7fff",
              fontSize: "12px",
            }}
          >
            {friendship.recipient?.firstName?.charAt(0)}
          </Avatar>

          {/* Recipient details */}
          <div className="flex flex-col justify-center">
            <span className="text-[#5b7fff] font-medium text-xs leading-tight">
              {friendship.recipient?.firstName}{" "}
              {friendship.recipient?.lastName?.charAt(0)}
            </span>
            <span className="text-gray-400 text-[10px] leading-tight">
              {friendship.recipient?.email?.split("@")[0]}
            </span>
          </div>
        </div>

        {/* Center section - Scrolling notification */}
        <div
          className="scrolling-text-container absolute left-0 right-0 mx-auto"
          style={{ width: "40%", zIndex: 1 }}
        >
          <div className="scrolling-text">
            {friendship.recipientAccess === "ADMIN" ||
            friendship.recipientAccess === "FULL"
              ? "You have full access to this user's expenses. Any changes you make will be reflected in their account."
              : friendship.recipientAccess === "EDITOR" ||
                friendship.recipientAccess === "WRITE" ||
                friendship.recipientAccess === "READ_WRITE"
              ? "You have write access to this user's expenses. Any changes you make will be reflected in their account."
              : friendship.recipientAccess === "READ"
              ? "You have read-only access to this user's expenses. You can view all details but cannot make changes."
              : friendship.recipientAccess === "SUMMARY"
              ? "You have summary access to this user's expenses. You can view monthly summaries but not individual expenses."
              : friendship.recipientAccess === "LIMITED"
              ? "You have limited access to this user's expenses. You can only view basic totals and summaries."
              : "You don't have access to this user's expenses."}
          </div>
        </div>

        {/* Right section - Status, Access Level and Friend Switcher */}
        <div className="flex items-center gap-3 z-10">
          {/* Status badge */}
          <div className="bg-[#23243a] px-2 py-1 rounded-full text-xs">
            <span className="text-white">Status: </span>
            <span
              className={`font-medium ${
                friendship.status === "ACCEPTED"
                  ? "text-[#00DAC6]"
                  : friendship.status === "PENDING"
                  ? "text-[#FFC107]"
                  : "text-[#ff4d4f]"
              }`}
            >
              {friendship.status}
            </span>
          </div>

          {/* Access Level badge */}
          <div className="bg-[#23243a] px-2 py-1 rounded-full text-xs">
            <span className="text-white">Access: </span>
            <span
              className={`font-medium ${
                friendship.recipientAccess === "ADMIN" ||
                friendship.recipientAccess === "FULL"
                  ? "text-[#00DAC6]"
                  : friendship.recipientAccess === "EDITOR" ||
                    friendship.recipientAccess === "WRITE" ||
                    friendship.recipientAccess === "READ_WRITE"
                  ? "text-[#5b7fff]"
                  : "text-[#FFC107]"
              }`}
            >
              {friendship.recipientAccess || "VIEWER"}
            </span>
          </div>

          {/* Friend Switcher Button */}
          <div className="relative" ref={friendDropdownRef}>
            <Button
              variant="contained"
              size="small"
              endIcon={
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-300 ${
                    showFriendDropdown ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              onClick={() => setShowFriendDropdown(!showFriendDropdown)}
              sx={{
                backgroundColor: "#23243a",
                color: "#5b7fff",
                fontSize: "0.75rem",
                padding: "4px 10px",
                minWidth: "auto",
                borderRadius: "16px",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#2a2b45",
                  boxShadow: "none",
                },
              }}
            >
              Switch Friend
            </Button>

            {/* Friend Dropdown */}
            {showFriendDropdown && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  right: 0,
                  mt: 1,
                  width: 240,
                  backgroundColor: "#1b1b1b",
                  borderRadius: 2,
                  border: "1px solid #333",
                  overflow: "hidden",
                  zIndex: 50,
                  animation: "dropdownFadeIn 0.2s ease-out forwards",
                  maxHeight: 400,
                  overflowY: "auto",
                }}
                className="custom-scrollbar"
              >
                <Box
                  sx={{
                    p: 1,
                    borderBottom: "1px solid #333",
                    backgroundColor: "#23243a",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#00DAC6", fontWeight: 500 }}
                  >
                    Select a friend
                  </Typography>
                </Box>

                {friends.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <CircularProgress size={20} sx={{ color: "#5b7fff" }} />
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mt: 1, color: "#999" }}
                    >
                      Loading friends...
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ py: 0 }}>
                    {friends.map((friend) => (
                      <ListItem
                        key={friend.id}
                        button
                        selected={friendId === friend.id.toString()}
                        onClick={() => handleFriendSelect(friend.id)}
                        sx={{
                          py: 1,
                          px: 2,
                          "&.Mui-selected": {
                            backgroundColor: "#23243a",
                            "&:hover": {
                              backgroundColor: "#2a2b45",
                            },
                          },
                          "&:hover": {
                            backgroundColor: "#23243a",
                          },
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <Avatar
                            src={
                              friend.image ||
                              friend.requester?.image ||
                              friend.recipient?.image
                            }
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: friend.color || "#5b7fff",
                              fontSize: "10px",
                            }}
                          >
                            {(friend.firstName || friend.name || "").charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#fff",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              {friend.firstName ||
                                friend.name ||
                                (friend.id === friendship.requester?.id
                                  ? friendship.requester?.firstName
                                  : friendship.recipient?.firstName)}
                            </Typography>
                          }
                          secondary={
                            <div className="flex items-center gap-2">
                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    friend.status === "ACCEPTED"
                                      ? "#00DAC6"
                                      : friend.status === "PENDING"
                                      ? "#FFC107"
                                      : "#ff4d4f",
                                  fontSize: "0.625rem",
                                }}
                              >
                                {friend.status || "ACCEPTED"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    friend.recipientAccess === "ADMIN" ||
                                    friend.recipientAccess === "FULL"
                                      ? "#00DAC6"
                                      : friend.recipientAccess === "EDITOR" ||
                                        friend.recipientAccess === "WRITE" ||
                                        friend.recipientAccess === "READ_WRITE"
                                      ? "#5b7fff"
                                      : "#FFC107",
                                  fontSize: "0.625rem",
                                  backgroundColor: "rgba(35, 36, 58, 0.6)",
                                  padding: "0 4px",
                                  borderRadius: "4px",
                                }}
                              >
                                {friend.recipientAccess || "VIEWER"}
                              </Typography>
                            </div>
                          }
                          sx={{ margin: 0 }}
                        />
                        {friendId === friend.id.toString() && (
                          <Box sx={{ ml: "auto" }}>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 12L10 17L19 8"
                                stroke="#00DAC6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Box>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}

                <Box
                  sx={{
                    p: 1,
                    borderTop: "1px solid #333",
                    backgroundColor: "#23243a",
                    textAlign: "center",
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => {
                      navigate("/friends");
                      setShowFriendDropdown(false);
                    }}
                    sx={{
                      color: "#5b7fff",
                      fontSize: "0.75rem",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "transparent",
                        color: "#00DAC6",
                      },
                    }}
                  >
                    View All Friends
                  </Button>
                </Box>
              </Paper>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrolling-text-container {
          position: absolute;
          overflow: hidden;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scrolling-text {
          white-space: nowrap;
          animation: scrollText 15s linear infinite;
          display: inline-block;
          padding-right: 50px;
          color: ${friendship?.accessLevel === "ADMIN" ||
          friendship?.accessLevel === "FULL"
            ? "#06D6A0"
            : friendship?.accessLevel === "EDITOR" ||
              friendship?.accessLevel === "WRITE" ||
              friendship?.accessLevel === "READ_WRITE"
            ? "#5b7fff"
            : "#FFC107"};
          font-size: 12px;
          font-weight: 500;
          text-align: center;
        }

        @keyframes scrollText {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @media (max-width: 768px) {
          .scrolling-text {
            font-size: 10px;
          }
        }

        /* Friend dropdown animation */
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default FriendInfoBar;
