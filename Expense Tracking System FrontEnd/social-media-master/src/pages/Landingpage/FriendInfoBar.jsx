import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../hooks/useTheme";
import { useMasking } from "../../hooks/useMasking";
import { useTranslation } from "../../hooks/useTranslation";
import { toggleTheme } from "../../Redux/Theme/theme.actions";
import { updateUserSettings } from "../../Redux/UserSettings/userSettings.action";
import {
  InlineSearchBar,
  UniversalSearchModal,
} from "../../components/common/UniversalSearch";
import NotificationsPanelRedux from "../../components/common/NotificationsPanelRedux";

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
  customErrorRedirectPath = "/friends",
  ...otherProps
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";
  const { maskingEnabled, toggleMasking } = useMasking();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showFriendDropdown, setShowFriendDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const friendDropdownRef = useRef(null);
  const portalDropdownRef = useRef(null); // ref to portal dropdown
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Theme toggle handler
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    dispatch(
      updateUserSettings({
        theme: isDark ? "light" : "dark",
      }),
    );
  };

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

  // Close dropdown when clicking outside (account for portal element)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inButton = friendDropdownRef.current?.contains(event.target);
      const inPortal = portalDropdownRef.current?.contains(event.target);
      if (!inButton && !inPortal) {
        setShowFriendDropdown(false);
        setSearchTerm("");
      }
    };
    if (showFriendDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFriendDropdown]);

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
        className="rounded-lg mx-4 flex items-center justify-between relative"
        style={{
          height: "50px",
          padding: "0 12px",
          backgroundColor: colors.secondary_bg,
        }}
      >
        <div className="flex items-center gap-2">
          <Skeleton
            variant="circular"
            width={28}
            height={28}
            sx={{ bgcolor: colors.hover_bg }}
          />
          <div>
            <Skeleton
              variant="text"
              width={80}
              height={14}
              sx={{ bgcolor: colors.hover_bg }}
            />
            <Skeleton
              variant="text"
              width={60}
              height={10}
              sx={{ bgcolor: colors.hover_bg }}
            />
          </div>
          <div
            className="w-8 h-[2px]"
            style={{ backgroundColor: colors.hover_bg }}
          ></div>
          <Skeleton
            variant="circular"
            width={28}
            height={28}
            sx={{ bgcolor: colors.hover_bg }}
          />
          <div>
            <Skeleton
              variant="text"
              width={80}
              height={14}
              sx={{ bgcolor: colors.hover_bg }}
            />
            <Skeleton
              variant="text"
              width={60}
              height={10}
              sx={{ bgcolor: colors.hover_bg }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton
            variant="rounded"
            width={80}
            height={24}
            sx={{ bgcolor: colors.hover_bg }}
          />
          <Skeleton
            variant="rounded"
            width={80}
            height={24}
            sx={{ bgcolor: colors.hover_bg }}
          />
          <Skeleton
            variant="rounded"
            width={100}
            height={24}
            sx={{ bgcolor: colors.hover_bg }}
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
          return error; // Re-throw if it's not a 403 error
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
          return error; // Re-throw if it's not a 403 error
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
              selectedFriendId,
            );
            navigate(customErrorRedirectPath);
            return;
          }
          return error; // Re-throw if it's not a 403 error
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
        className="rounded-lg mx-4 flex items-center justify-between relative"
        style={{
          height: "50px",
          backgroundColor: colors.secondary_bg,
          boxShadow:
            colors.mode === "dark"
              ? "0 4px 12px rgba(0,0,0,0.15)"
              : "0 4px 12px rgba(0,0,0,0.08)",
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
              src={friendship.requester?.profileImage}
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
                        bgcolor: colors.tertiary_bg,
                        color: "#00DAC6",
                        fontSize: "0.75rem",
                        border: "1px solid #00DAC6",
                        "& .MuiTooltip-arrow": {
                          color: colors.tertiary_bg,
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
                        bgcolor: colors.tertiary_bg,
                        color: colors.secondary_text,
                        fontSize: "0.7rem",
                        border: `1px solid ${colors.border_color}`,
                        "& .MuiTooltip-arrow": {
                          color: colors.tertiary_bg,
                        },
                      },
                    },
                  }}
                >
                  <span
                    className="text-[10px] leading-tight cursor-help truncate block"
                    style={{ color: colors.secondary_text }}
                  >
                    {requesterEmailData.display}
                  </span>
                </Tooltip>
              ) : (
                <span
                  className="text-[10px] leading-tight truncate block"
                  style={{ color: colors.secondary_text }}
                >
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
              src={friendship.recipient?.profileImage}
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
                        bgcolor: colors.tertiary_bg,
                        color: "#5b7fff",
                        fontSize: "0.75rem",
                        border: "1px solid #5b7fff",
                        "& .MuiTooltip-arrow": {
                          color: colors.tertiary_bg,
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
                        bgcolor: colors.tertiary_bg,
                        color: colors.secondary_text,
                        fontSize: "0.7rem",
                        border: `1px solid ${colors.border_color}`,
                        "& .MuiTooltip-arrow": {
                          color: colors.tertiary_bg,
                        },
                      },
                    },
                  }}
                >
                  <span
                    className="text-[10px] leading-tight cursor-help truncate block"
                    style={{ color: colors.secondary_text }}
                  >
                    {recipientEmailData.display}
                  </span>
                </Tooltip>
              ) : (
                <span
                  className="text-[10px] leading-tight truncate block"
                  style={{ color: colors.secondary_text }}
                >
                  {recipientEmailData.display}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center section - Scrolling notification */}
        <div
          className="scrolling-text-container absolute"
          style={{ left: "25%", width: "30%", zIndex: 1 }}
        >
          {(() => {
            const access =
              friendship.requester.id == user.id
                ? friendship.requesterAccess
                : friendship.recipientAccess;

            return (
              <div className="scrolling-text">
                {access === "ADMIN" || access === "FULL"
                  ? "You have full access to this user's expenses. Any changes you make will be reflected in their account."
                  : access === "EDITOR" ||
                      access === "WRITE" ||
                      access === "READ_WRITE"
                    ? "You have write access to this user's expenses. Any changes you make will be reflected in their account."
                    : access === "READ"
                      ? "You have read-only access to this user's expenses. You can view all details but cannot make changes."
                      : access === "SUMMARY"
                        ? "You have summary access to this user's expenses. You can view monthly summaries but not individual expenses."
                        : access === "LIMITED"
                          ? "You have limited access to this user's expenses. You can only view basic totals and summaries."
                          : "You don't have access to this user's expenses."}
              </div>
            );
          })()}
        </div>

        {/* Right section - Search, Masking Toggle, Theme Toggle and Friend Switcher */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Inline Search Bar */}
          <InlineSearchBar />

          {/* Universal Search Modal for Ctrl+K */}
          <UniversalSearchModal />

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
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
                    fontSize: "0.5rem",
                    height: "14px",
                    minWidth: "14px",
                    padding: "0 3px",
                  },
                }}
              >
                <svg
                  className={`w-[18px] h-[18px] ${
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

          {/* Masking Toggle Button */}
          <button
            onClick={toggleMasking}
            className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
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
                className={`w-[18px] h-[18px] ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              />
            ) : (
              <VisibilityIcon
                className={`w-[18px] h-[18px] ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
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
                className="w-[18px] h-[18px] text-yellow-400"
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
                className="w-[18px] h-[18px] text-gray-700"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

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
                backgroundColor: colors.tertiary_bg,
                color: "#5b7fff",
                fontSize: "0.75rem",
                padding: "4px 10px",
                minWidth: "auto",
                borderRadius: "16px",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: colors.hover_bg,
                  boxShadow: "none",
                },
              }}
            >
              Switch Friend
            </Button>

            {/* Enhanced Friend Dropdown with Search via Portal */}
            {showFriendDropdown &&
              createPortal(
                <Paper
                  ref={portalDropdownRef}
                  elevation={6}
                  sx={{
                    position: "fixed",
                    top: (() => {
                      const btn = friendDropdownRef.current;
                      if (!btn) return 80;
                      const rect = btn.getBoundingClientRect();
                      return rect.bottom + 8;
                    })(),
                    left: (() => {
                      const btn = friendDropdownRef.current;
                      if (!btn) return 0;
                      const rect = btn.getBoundingClientRect();
                      return Math.max(8, rect.right - 320); // keep inside viewport
                    })(),
                    width: 320, // Increased width for better search experience
                    backgroundColor: colors.primary_bg,
                    borderRadius: 2,
                    border: `1px solid ${colors.border_color}`,
                    overflow: "hidden",
                    zIndex: 1600,
                    animation: "dropdownFadeIn 0.18s ease-out forwards",
                    maxHeight: 500, // Increased max height
                    boxShadow:
                      colors.mode === "dark"
                        ? "0 8px 32px rgba(0,0,0,0.5)"
                        : "0 8px 32px rgba(0,0,0,0.15)",
                  }}
                >
                  {/* Header with search */}
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${colors.border_color}`,
                      backgroundColor: colors.tertiary_bg,
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
                            <SearchIcon
                              sx={{ color: "#5b7fff", fontSize: 18 }}
                            />
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
                          backgroundColor: colors.secondary_bg,
                          borderRadius: 1,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border_color,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#5b7fff",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#00DAC6",
                          },
                          "& input": {
                            color: colors.primary_text,
                            fontSize: "0.875rem",
                            padding: "8px 0",
                          },
                          "& input::placeholder": {
                            color: colors.secondary_text,
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
                        sx={{
                          display: "block",
                          mt: 2,
                          color: colors.secondary_text,
                        }}
                      >
                        Loading friends...
                      </Typography>
                    </Box>
                  ) : filteredFriends.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.secondary_text, mb: 1 }}
                      >
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
                                borderBottom: `1px solid ${colors.border_color}`,
                                cursor: "pointer",
                                "&.Mui-selected": {
                                  backgroundColor: colors.tertiary_bg,
                                  borderLeft: `3px solid ${colors.primary_accent}`,
                                  "&:hover": {
                                    backgroundColor: colors.hover_bg,
                                    cursor: "pointer",
                                  },
                                },
                                "&:hover": {
                                  backgroundColor: colors.hover_bg,
                                  cursor: "pointer",
                                },
                                "&:last-child": {
                                  borderBottom: "none",
                                },
                              }}
                            >
                              <ListItemAvatar sx={{ minWidth: 40 }}>
                                <Avatar
                                  src={friend.profileImage}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: friend.color || "#5b7fff",
                                    fontSize: "12px",
                                    border: isSelected
                                      ? `2px solid ${colors.primary_accent}`
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
                                      color: colors.primary_text,
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
                                        color: colors.secondary_text,
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
                                          backgroundColor: colors.tertiary_bg,
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        {friend.status || "ACCEPTED"}
                                      </Typography>

                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: (() => {
                                            // Determine the current user's access level to this friend's data
                                            const access =
                                              friend.requesterUserId === user.id
                                                ? friend.requesterAccess
                                                : friend.recipientAccess;

                                            return access === "ADMIN" ||
                                              access === "FULL"
                                              ? "#00DAC6"
                                              : access === "EDITOR" ||
                                                  access === "WRITE" ||
                                                  access === "READ_WRITE"
                                                ? "#5b7fff"
                                                : "#FFC107";
                                          })(),
                                          fontSize: "0.625rem",
                                          backgroundColor: colors.tertiary_bg,
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        {(() => {
                                          // Determine the current user's access level to this friend's data
                                          const access =
                                            friend.requesterUserId === user.id
                                              ? friend.requesterAccess
                                              : friend.recipientAccess;
                                          return access || "VIEWER";
                                        })()}
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
                      borderTop: `1px solid ${colors.border_color}`,
                      backgroundColor: colors.tertiary_bg,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: colors.secondary_text, fontSize: "0.75rem" }}
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
                </Paper>,
                document.body,
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
          color: ${(() => {
            const access =
              friendship?.requester?.id == user?.id
                ? friendship?.requesterAccess
                : friendship?.recipientAccess;

            return access === "ADMIN" || access === "FULL"
              ? "#06D6A0"
              : access === "EDITOR" ||
                  access === "WRITE" ||
                  access === "READ_WRITE"
                ? "#5b7fff"
                : access === "READ"
                  ? "#00DAC6"
                  : access === "SUMMARY"
                    ? "#FFC107"
                    : access === "LIMITED"
                      ? "#ff9800"
                      : "#999";
          })()};
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
          scrollbar-color: #5b7fff ${colors.primary_bg};
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${colors.primary_bg};
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

export default FriendInfoBar;
