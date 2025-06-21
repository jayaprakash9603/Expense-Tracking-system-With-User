import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFriendInfoBar from "./useFriendInfoBar";
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
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const FriendInfoBar = ({
  friendship,
  friendId,
  friends = [],
  loading = false,
  onFriendChange,
  showInfoBar = true,
  onRouteChange, // New prop to handle route changes
  refreshData, // New prop to trigger data refresh
  additionalRefreshFn = null,
  customErrorRedirectPath = "/expenses",
  ...otherProps
}) => {
  const [showFriendDropdown, setShowFriendDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFriends, setFilteredFriends] = useState([]);
  const friendDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Filter friends based on search term
  useEffect(() => {
    if (!friends || friends.length === 0) {
      setFilteredFriends([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredFriends(friends);
      return;
    }

    const filtered = friends.filter((friend) => {
      // Use the name and email directly from the friendship detailed data
      const friendName = friend.name || "";
      const friendEmail = friend.email || "";

      const search = searchTerm.toLowerCase();

      return (
        friendName.toLowerCase().includes(search) ||
        friendEmail.toLowerCase().includes(search)
      );
    });

    setFilteredFriends(filtered);
  }, [friends, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        friendDropdownRef.current &&
        !friendDropdownRef.current.contains(event.target)
      ) {
        setShowFriendDropdown(false);
        setSearchTerm(""); // Clear search when closing
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showFriendDropdown && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showFriendDropdown]);

  // Helper function to truncate text and determine if tooltip is needed
  const getTruncatedText = (text, maxLength = 12) => {
    if (!text) return { display: "", full: "", needsTooltip: false };

    const fullText = text.toString();
    if (fullText.length <= maxLength) {
      return { display: fullText, full: fullText, needsTooltip: false };
    }

    return {
      display: fullText.substring(0, maxLength) + "...",
      full: fullText,
      needsTooltip: true,
    };
  };

  // If loading, show skeleton
  if (loading) {
    return (
      <div
        className="bg-[#1b1b1b] rounded-lg mx-4 flex items-center justify-between relative"
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

  const handleFriendSelect = async (selectedFriendId) => {
    try {
      setShowFriendDropdown(false);
      setSearchTerm(""); // Clear search when selecting

      // If onRouteChange is provided, use it to handle route change and data refresh
      if (onRouteChange) {
        try {
          await onRouteChange(selectedFriendId);
        } catch (error) {
          // Check if it's a 403 unauthorized error
          if (error.response && error.response.status === 403) {
            console.warn("Access denied for friend:", selectedFriendId);
            navigate(customErrorRedirectPath);
            return;
          }
          throw error; // Re-throw if it's not a 403 error
        }
      } else if (onFriendChange) {
        // Fallback to existing onFriendChange
        try {
          onFriendChange(selectedFriendId);
        } catch (error) {
          // Check if it's a 403 unauthorized error
          if (error.response && error.response.status === 403) {
            console.warn("Access denied for friend:", selectedFriendId);
            navigate(customErrorRedirectPath);
            return;
          }
          throw error; // Re-throw if it's not a 403 error
        }
      } else {
        // Default navigation behavior
        navigate(`/friends/expenses/${selectedFriendId}`);
      }

      // Trigger data refresh if provided
      if (refreshData) {
        try {
          await refreshData(selectedFriendId);
        } catch (error) {
          // Check if it's a 403 unauthorized error
          if (error.response && error.response.status === 403) {
            console.warn(
              "Access denied during data refresh for friend:",
              selectedFriendId
            );
            navigate(customErrorRedirectPath);
            return;
          }
          throw error; // Re-throw if it's not a 403 error
        }
      }
    } catch (error) {
      console.error("Error changing friend:", error);

      // Final catch-all for 403 errors
      if (error.response && error.response.status === 403) {
        console.warn("Unauthorized access detected, redirecting to expenses");
        navigate(customErrorRedirectPath);
      }
    }
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Prepare text data for requester and recipient
  const requesterFullName = `${friendship.requester?.firstName || ""} ${
    friendship.requester?.lastName || ""
  }`.trim();
  const recipientFullName = `${friendship.recipient?.firstName || ""} ${
    friendship.recipient?.lastName || ""
  }`.trim();
  const requesterEmail = friendship.requester?.email || "";
  const recipientEmail = friendship.recipient?.email || "";

  const requesterNameData = getTruncatedText(requesterFullName, 15);
  const recipientNameData = getTruncatedText(recipientFullName, 15);
  const requesterEmailData = getTruncatedText(requesterEmail.split("@")[0], 12);
  const recipientEmailData = getTruncatedText(recipientEmail.split("@")[0], 12);

  return (
    <>
      {/* Friend Info Bar - 50px with integrated scrolling text */}
      <div
        className="bg-[#1b1b1b] rounded-lg mx-4 flex items-center justify-between relative"
        style={{
          height: "50px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          borderLeft: `4px solid ${
            friendship.status === "ACCEPTED" ? "#00DAC6" : "#5b7fff"
          }`,
          padding: "0 12px",
        }}
      >
        {/* Left section - User details with improved spacing and tooltips */}
        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-[45%]">
          {/* Requester section */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
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
                flexShrink: 0,
              }}
            >
              {friendship.requester?.firstName?.charAt(0)}
            </Avatar>

            {/* Requester details with tooltips */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              {requesterNameData.needsTooltip ? (
                <Tooltip
                  title={requesterNameData.full}
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "#23243a",
                        color: "#00DAC6",
                        fontSize: "0.75rem",
                        border: "1px solid #00DAC6",
                        "& .MuiTooltip-arrow": {
                          color: "#23243a",
                        },
                      },
                    },
                  }}
                >
                  <span className="text-[#00DAC6] font-medium text-xs leading-tight cursor-help truncate block">
                    {requesterNameData.display}
                  </span>
                </Tooltip>
              ) : (
                <span className="text-[#00DAC6] font-medium text-xs leading-tight truncate block">
                  {requesterNameData.display}
                </span>
              )}

              {requesterEmailData.needsTooltip ? (
                <Tooltip
                  title={requesterEmail}
                  arrow
                  placement="bottom"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "#23243a",
                        color: "#999",
                        fontSize: "0.7rem",
                        border: "1px solid #333",
                        "& .MuiTooltip-arrow": {
                          color: "#23243a",
                        },
                      },
                    },
                  }}
                >
                  <span className="text-gray-400 text-[10px] leading-tight cursor-help truncate block">
                    {requesterEmailData.display}
                  </span>
                </Tooltip>
              ) : (
                <span className="text-gray-400 text-[10px] leading-tight truncate block">
                  {requesterEmailData.display}
                </span>
              )}
            </div>
          </div>

          {/* Connection indicator */}
          <div className="flex items-center mx-1 flex-shrink-0">
            <div className="w-6 h-[2px] bg-gradient-to-r from-[#00DAC6] to-[#5b7fff]"></div>
          </div>

          {/* Recipient section */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
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
                flexShrink: 0,
              }}
            >
              {friendship.recipient?.firstName?.charAt(0)}
            </Avatar>

            {/* Recipient details with tooltips */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              {recipientNameData.needsTooltip ? (
                <Tooltip
                  title={recipientNameData.full}
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "#23243a",
                        color: "#5b7fff",
                        fontSize: "0.75rem",
                        border: "1px solid #5b7fff",
                        "& .MuiTooltip-arrow": {
                          color: "#23243a",
                        },
                      },
                    },
                  }}
                >
                  <span className="text-[#5b7fff] font-medium text-xs leading-tight cursor-help truncate block">
                    {recipientNameData.display}
                  </span>
                </Tooltip>
              ) : (
                <span className="text-[#5b7fff] font-medium text-xs leading-tight truncate block">
                  {recipientNameData.display}
                </span>
              )}

              {recipientEmailData.needsTooltip ? (
                <Tooltip
                  title={recipientEmail}
                  arrow
                  placement="bottom"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "#23243a",
                        color: "#999",
                        fontSize: "0.7rem",
                        border: "1px solid #333",
                        "& .MuiTooltip-arrow": {
                          color: "#23243a",
                        },
                      },
                    },
                  }}
                >
                  <span className="text-gray-400 text-[10px] leading-tight cursor-help truncate block">
                    {recipientEmailData.display}
                  </span>
                </Tooltip>
              ) : (
                <span className="text-gray-400 text-[10px] leading-tight truncate block">
                  {recipientEmailData.display}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center section - Scrolling notification */}
        <div
          className="scrolling-text-container absolute left-0 right-0 mx-auto"
          style={{ width: "35%", zIndex: 1 }}
        >
          <div className="scrolling-text">
            {friendship.requesterAccess === "ADMIN" ||
            friendship.requesterAccess === "FULL"
              ? "You have full access to this user's expenses. Any changes you make will be reflected in their account."
              : friendship.requesterAccess === "EDITOR" ||
                friendship.requesterAccess === "WRITE" ||
                friendship.requesterAccess === "READ_WRITE"
              ? "You have write access to this user's expenses. Any changes you make will be reflected in their account."
              : friendship.requesterAccess === "READ"
              ? "You have read-only access to this user's expenses. You can view all details but cannot make changes."
              : friendship.requesterAccess === "SUMMARY"
              ? "You have summary access to this user's expenses. You can view monthly summaries but not individual expenses."
              : friendship.requesterAccess === "LIMITED"
              ? "You have limited access to this user's expenses. You can only view basic totals and summaries."
              : "You don't have access to this user's expenses."}
          </div>
        </div>

        {/* Right section - Status, Access Level and Friend Switcher */}
        <div className="flex items-center gap-3 z-10 flex-shrink-0">
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
                friendship.requesterAccess === "ADMIN" ||
                friendship.requesterAccess === "FULL"
                  ? "text-[#00DAC6]"
                  : friendship.requesterAccess === "EDITOR" ||
                    friendship.requesterAccess === "WRITE" ||
                    friendship.requesterAccess === "READ_WRITE"
                  ? "text-[#5b7fff]"
                  : "text-[#FFC107]"
              }`}
            >
              {friendship.requesterAccess || "VIEWER"}
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

            {/* Enhanced Friend Dropdown with Search */}
            {showFriendDropdown && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  right: 0,
                  mt: 1,
                  width: 320, // Increased width for better search experience
                  backgroundColor: "#1b1b1b",
                  borderRadius: 2,
                  border: "1px solid #333",
                  overflow: "hidden",
                  zIndex: 50,
                  animation: "dropdownFadeIn 0.2s ease-out forwards",
                  maxHeight: 500, // Increased max height
                }}
              >
                {/* Header with search */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid #333",
                    backgroundColor: "#23243a",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#00DAC6",
                      fontWeight: 500,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Select a friend ({friends.length} total)
                  </Typography>
                  {/* Search Input */}
                  <TextField
                    ref={searchInputRef}
                    fullWidth
                    size="small"
                    placeholder="Search friends..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#5b7fff", fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            onClick={handleSearchClear}
                            sx={{
                              minWidth: "auto",
                              p: 0.5,
                              color: "#999",
                              "&:hover": {
                                color: "#ff4d4f",
                                backgroundColor: "transparent",
                              },
                            }}
                          >
                            <ClearIcon sx={{ fontSize: 16 }} />
                          </Button>
                        </InputAdornment>
                      ),
                      sx: {
                        backgroundColor: "#1b1b1b",
                        borderRadius: 1,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#333",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#5b7fff",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#00DAC6",
                        },
                        "& input": {
                          color: "#fff",
                          fontSize: "0.875rem",
                          padding: "8px 0",
                        },
                        "& input::placeholder": {
                          color: "#999",
                          opacity: 1,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Friends List with Scrollbar */}
                {friends.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <CircularProgress size={24} sx={{ color: "#5b7fff" }} />
                    <Typography
                      variant="body2"
                      sx={{ display: "block", mt: 2, color: "#999" }}
                    >
                      Loading friends...
                    </Typography>
                  </Box>
                ) : filteredFriends.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body2" sx={{ color: "#999", mb: 1 }}>
                      {searchTerm
                        ? "No friends found matching your search"
                        : "No friends available"}
                    </Typography>
                    {searchTerm && (
                      <Button
                        size="small"
                        onClick={handleSearchClear}
                        sx={{
                          color: "#5b7fff",
                          fontSize: "0.75rem",
                          textTransform: "none",
                        }}
                      >
                        Clear search
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      maxHeight: 350, // Fixed height for scrolling
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                    className="custom-scrollbar"
                  >
                    <List sx={{ py: 0 }}>
                      {filteredFriends.map((friend, index) => {
                        // Use the data directly from the friendship detailed response
                        const friendName = friend.name || "";
                        const friendEmail = friend.email || "";
                        const isSelected = friendId === friend.id.toString();

                        return (
                          <ListItem
                            key={`${friend.id}-${index}`}
                            button
                            selected={isSelected}
                            onClick={() => handleFriendSelect(friend.id)}
                            sx={{
                              py: 1.5,
                              px: 2,
                              borderBottom: "1px solid #2a2a2a",
                              cursor: "pointer", // Added pointer cursor
                              "&.Mui-selected": {
                                backgroundColor: "#23243a",
                                borderLeft: "3px solid #00DAC6",
                                "&:hover": {
                                  backgroundColor: "#2a2b45",
                                  cursor: "pointer", // Maintain pointer on selected hover
                                },
                              },
                              "&:hover": {
                                backgroundColor: "#23243a",
                                cursor: "pointer", // Added pointer cursor on hover
                              },
                              "&:last-child": {
                                borderBottom: "none",
                              },
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 40 }}>
                              <Avatar
                                src={friend.image}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: friend.color || "#5b7fff",
                                  fontSize: "12px",
                                  border: isSelected
                                    ? "2px solid #00DAC6"
                                    : "none",
                                }}
                              >
                                {friendName
                                  .split(" ")[0]
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#fff",
                                    fontSize: "0.875rem",
                                    fontWeight: isSelected ? 600 : 500,
                                  }}
                                >
                                  {friendName}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#999",
                                      fontSize: "0.75rem",
                                      display: "block",
                                    }}
                                  >
                                    {friendEmail}
                                  </Typography>
                                  <Box
                                    sx={{ display: "flex", gap: 1, mt: 0.5 }}
                                  >
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
                                        backgroundColor:
                                          "rgba(35, 36, 58, 0.8)",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
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
                                            : friend.recipientAccess ===
                                                "EDITOR" ||
                                              friend.recipientAccess ===
                                                "WRITE" ||
                                              friend.recipientAccess ===
                                                "READ_WRITE"
                                            ? "#5b7fff"
                                            : "#FFC107",
                                        fontSize: "0.625rem",
                                        backgroundColor:
                                          "rgba(35, 36, 58, 0.8)",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      {friend.recipientAccess || "VIEWER"}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                              sx={{ margin: 0 }}
                            />
                            {isSelected && (
                              <Box sx={{ ml: 1 }}>
                                <svg
                                  width="16"
                                  height="16"
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
                        );
                      })}
                    </List>
                  </Box>
                )}

                {/* Footer */}
                <Box
                  sx={{
                    p: 1.5,
                    borderTop: "1px solid #333",
                    backgroundColor: "#23243a",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#999", fontSize: "0.75rem" }}
                  >
                    {searchTerm
                      ? `${filteredFriends.length} of ${friends.length} friends`
                      : `${friends.length} friends total`}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      navigate("/friends");
                      setShowFriendDropdown(false);
                      setSearchTerm("");
                    }}
                    sx={{
                      color: "#5b7fff",
                      fontSize: "0.75rem",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "transparent",
                        color: "#00DAC6",
                        cursor: "pointer", // Added pointer cursor
                      },
                    }}
                  >
                    Manage Friends
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
          color: ${friendship?.recipientAccess === "ADMIN" ||
          friendship?.recipientAccess === "FULL"
            ? "#06D6A0"
            : friendship?.recipientAccess === "EDITOR" ||
              friendship?.recipientAccess === "WRITE" ||
              friendship?.recipientAccess === "READ_WRITE"
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

        /* Custom scrollbar styles */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #5b7fff #1b1b1b;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1b1b1b;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #5b7fff;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00dac6;
        }
      `}</style>
    </>
  );
};

export default FriendInfoBar;
