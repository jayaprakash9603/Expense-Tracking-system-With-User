import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  addNotification,
} from "../../Redux/Notifications/notification.action";
import useNotifications from "../../hooks/useNotifications";
import {
  getNotificationIcon,
  getNotificationColor,
  formatRelativeTime,
} from "../../utils/notificationUtils";

/**
 * NotificationsPanel Component - Modern UI with Theme Support
 *
 * Features:
 * - Real-time notifications via WebSocket
 * - Redux state management
 * - Dark/Light theme support
 * - Mark as read/unread
 * - Delete notifications
 * - Navigate to related items
 * - Modern, user-friendly design
 *
 * @param {boolean} isOpen - Whether the panel is open (controlled by parent)
 * @param {function} onClose - Callback to close the panel
 * @param {function} onNotificationRead - Callback with unread count when notifications change
 */
const NotificationsPanel = ({
  isOpen: isOpenProp,
  onClose,
  onNotificationRead,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { notifications, unreadCount, loading, error } = useSelector(
    (state) => state.notifications,
  );

  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === "dark";

  // Local state - use prop if provided, otherwise manage internally
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Determine if panel should be open
  const isOpen = isOpenProp !== undefined ? isOpenProp : internalIsOpen;

  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  // WebSocket hook for real-time notifications with callback
  const { isConnected } = useNotifications({
    userId: user?.id,
    autoConnect: true,
    onNewNotification: useCallback(
      (notification) => {
        // ✅ OPTIMIZED: Add single notification to Redux instead of fetching all
        console.log(
          "✅ WebSocket notification received - adding to Redux store:",
          notification,
        );
        dispatch(addNotification(notification));
        // No need to fetch all notifications or unread count - reducer handles it!
      },
      [dispatch],
    ),
  });

  // Fetch notifications on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, user]);

  // Notify parent of unread count changes
  useEffect(() => {
    if (onNotificationRead) {
      onNotificationRead(unreadCount);
    }
  }, [unreadCount, onNotificationRead]);

  // Handle single click - mark as read only
  const handleNotificationClick = useCallback(
    async (notification) => {
      // Mark as read on single click
      if (!notification.isRead) {
        await dispatch(markNotificationAsRead(notification.id));
      }
    },
    [dispatch],
  );

  // Handle double click - mark as read and navigate
  const handleNotificationDoubleClick = useCallback(
    async (notification) => {
      // Mark as read if not already
      if (!notification.isRead) {
        await dispatch(markNotificationAsRead(notification.id));
      }

      // Navigate based on notification type
      handleNotificationNavigation(notification);
    },
    [dispatch],
  );

  // Navigate to related content
  const handleNotificationNavigation = (notification) => {
    try {
      const metadata = notification.metadata
        ? JSON.parse(notification.metadata)
        : {};

      switch (notification.type) {
        case "FRIEND_REQUEST_RECEIVED":
          navigate("/friends", { state: { tab: "requests" } });
          break;
        case "FRIEND_REQUEST_ACCEPTED":
          navigate("/friends");
          break;
        case "EXPENSE_ADDED":
        case "EXPENSE_UPDATED":
        case "EXPENSE_DELETED":
          if (metadata.expenseId) {
            navigate(`/expenses/${metadata.expenseId}`);
          } else {
            navigate("/expenses");
          }
          break;
        case "BUDGET_EXCEEDED":
        case "BUDGET_WARNING":
        case "BUDGET_CREATED":
        case "BUDGET_UPDATED":
          if (metadata.budgetId) {
            navigate(`/budgets/${metadata.budgetId}`);
          } else {
            navigate("/budgets");
          }
          break;
        case "BILL_DUE_REMINDER":
        case "BILL_OVERDUE":
        case "BILL_PAID":
          if (metadata.billId) {
            navigate(`/bills/${metadata.billId}`);
          } else {
            navigate("/bills");
          }
          break;
        case "PAYMENT_METHOD_ADDED":
        case "PAYMENT_METHOD_UPDATED":
          navigate("/payment-methods");
          break;
        case "DATA_SHARED":
        case "dataShared":
          // Navigate to shared data view if URL is available
          if (metadata.shareUrl) {
            window.open(metadata.shareUrl, "_blank");
          } else if (metadata.shareToken) {
            navigate(`/shared/${metadata.shareToken}`);
          } else {
            navigate("/shares/received");
          }
          break;
        default:
          // Do nothing for unknown types
          break;
      }

      // Close panel after navigation
      handleClose();
    } catch (error) {
      console.error("Error navigating from notification:", error);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = useCallback(
    async (e, notificationId) => {
      e.stopPropagation(); // Prevent notification click
      try {
        await dispatch(deleteNotification(notificationId));
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },
    [dispatch],
  );

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await dispatch(markAllNotificationsAsRead());
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [dispatch]);

  // Handle clear all notifications
  const handleClearAll = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      try {
        await dispatch(deleteAllNotifications());
      } catch (error) {
        console.error("Error deleting all notifications:", error);
      }
    }
  }, [dispatch]);

  // Filter notifications - removed tabs, show all or filter by unread
  const filteredNotifications = notifications;

  // Don't render anything if not open
  if (!isOpen) return null;

  // Theme colors - Enhanced for better UI/UX
  const themeColors = {
    // Panel background with subtle gradient
    panelBg: isDark ? "#1a1a1a" : "#ffffff",
    // Header background
    headerBg: isDark ? "#101010" : "#f8f9fa",
    // Border color with better contrast
    borderColor: isDark ? "#2d2d2d" : "#e5e7eb",
    // Card background
    cardBg: isDark ? "#232323" : "#fafafa",
    cardBgHover: isDark ? "#2a2a2a" : "#f0f0f0",
    // Text colors with improved contrast
    primaryText: isDark ? "#f5f5f5" : "#111827",
    secondaryText: isDark ? "#9ca3af" : "#6b7280",
    mutedText: isDark ? "#6b7280" : "#9ca3af",
    // Accent colors
    accent: "#14b8a6",
    accentHover: "#0d9488",
    accentLight: isDark
      ? "rgba(20, 184, 166, 0.1)"
      : "rgba(20, 184, 166, 0.08)",
    accentBorder: isDark
      ? "rgba(20, 184, 166, 0.3)"
      : "rgba(20, 184, 166, 0.2)",
    // Unread state
    unreadBg: isDark ? "rgba(20, 184, 166, 0.08)" : "rgba(20, 184, 166, 0.05)",
    unreadBorder: isDark
      ? "rgba(20, 184, 166, 0.2)"
      : "rgba(20, 184, 166, 0.15)",
    // Icon background gradients
    iconBgGradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    iconBgMuted: isDark ? "#2d2d2d" : "#e5e7eb",
    // Status colors
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    // Shadows
    shadow: isDark
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    shadowHover: isDark
      ? "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)"
      : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  };

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style>{`
        .notification-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .notification-scroll::-webkit-scrollbar-track {
          background: ${isDark ? "#1a1a1a" : "#f8f9fa"};
          border-radius: 10px;
          margin: 8px 0;
        }
        .notification-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, ${themeColors.accent}, ${
            themeColors.accentHover
          });
          border-radius: 10px;
          border: 2px solid ${isDark ? "#1a1a1a" : "#f8f9fa"};
        }
        .notification-scroll::-webkit-scrollbar-thumb:hover {
          background: ${themeColors.accent};
          border-width: 1px;
        }
        .notification-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${themeColors.accent} ${
            isDark ? "#1a1a1a" : "#f8f9fa"
          };
        }
        
        /* Smooth animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .notification-scroll > div > div {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={handleClose} />

      {/* Notifications Panel */}
      <div
        className="absolute right-0 mt-2 w-[380px] rounded-xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col"
        style={{
          backgroundColor: themeColors.panelBg,
          border: `1px solid ${themeColors.borderColor}`,
        }}
      >
        {/* Header */}
        <div
          className="p-3 border-b"
          style={{
            backgroundColor: themeColors.headerBg,
            borderColor: themeColors.borderColor,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3
                className="text-lg font-bold"
                style={{ color: themeColors.primaryText }}
              >
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: themeColors.accent,
                    color: "#ffffff",
                  }}
                >
                  {unreadCount}
                </span>
              )}
              {isConnected && (
                <div
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: themeColors.accent }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Live
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Settings Button */}
              <button
                onClick={() => {
                  navigate("/settings/notifications");
                  handleClose();
                }}
                className="p-1.5 rounded-lg transition-all duration-200"
                style={{ color: themeColors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    themeColors.accentLight;
                  e.currentTarget.style.color = themeColors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = themeColors.secondaryText;
                }}
                title="Notification Settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: themeColors.secondaryText }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = themeColors.hoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                title="Close (X)"
                data-shortcut="notifications-close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Action Buttons - Enhanced design */}
          {notifications.length > 0 && (
            <div className="space-y-2 mt-3">
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    data-shortcut="notifications-mark-read"
                    title="Mark all read (R)"
                    style={{
                      backgroundColor: themeColors.accentLight,
                      color: themeColors.accent,
                      border: `1px solid ${themeColors.accentBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        themeColors.accent;
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = themeColors.shadow;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        themeColors.accentLight;
                      e.currentTarget.style.color = themeColors.accent;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Mark all read
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ml-auto transition-all duration-200"
                  data-shortcut="notifications-clear"
                  title="Clear all (C)"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(239, 68, 68, 0.08)",
                    color: themeColors.error,
                    border: `1px solid ${
                      isDark
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(239, 68, 68, 0.15)"
                    }`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeColors.error;
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = themeColors.shadow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(239, 68, 68, 0.08)";
                    e.currentTarget.style.color = themeColors.error;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear all
                </button>
              </div>
              <p
                className="text-[10px] italic text-center"
                style={{ color: themeColors.mutedText }}
              >
                💡 Click to mark read • Double-click to open
              </p>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div
          className="notification-scroll overflow-y-auto flex-1"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: `${themeColors.accent} ${
              isDark ? "#1b1b1b" : "#f5f5f5"
            }`,
          }}
        >
          {loading && notifications.length === 0 ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-10">
              <div
                className="animate-spin rounded-full h-8 w-8 border-3 border-t-transparent"
                style={{
                  borderColor: `${themeColors.accent} transparent transparent transparent`,
                }}
              ></div>
              <p
                className="mt-3 text-xs"
                style={{ color: themeColors.secondaryText }}
              >
                Loading notifications...
              </p>
            </div>
          ) : error ? (
            // Error State
            <div className="p-6 text-center">
              <svg
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: "#ef4444" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-500 text-xs font-medium mb-3">{error}</p>
              <button
                onClick={() => dispatch(fetchNotifications())}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: themeColors.accent }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    themeColors.accentHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = themeColors.accent)
                }
              >
                Retry
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            // Empty State - Enhanced design
            <div className="p-12 text-center">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.accentLight}, ${themeColors.accentLight})`,
                  border: `2px dashed ${themeColors.accentBorder}`,
                }}
              >
                <svg
                  className="w-10 h-10"
                  style={{ color: themeColors.accent }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h3
                className="text-base font-bold mb-2"
                style={{ color: themeColors.primaryText }}
              >
                No notifications yet
              </h3>
              <p
                className="text-sm leading-relaxed max-w-xs mx-auto"
                style={{ color: themeColors.secondaryText }}
              >
                You're all caught up! We'll notify you when something new
                happens.
              </p>
              <p
                className="text-xs mt-2 leading-relaxed max-w-xs mx-auto italic"
                style={{ color: themeColors.mutedText }}
              >
                💡 Tip: Click to mark as read, double-click to navigate
              </p>
              <div className="mt-4 flex justify-center">
                <span className="text-3xl">🎉</span>
              </div>
            </div>
          ) : (
            // Notifications List
            <div className="divide-y-0 space-y-2 p-2">
              {filteredNotifications.map((notification) => {
                const isUnread = !notification.isRead;

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    onDoubleClick={() =>
                      handleNotificationDoubleClick(notification)
                    }
                    className="group relative rounded-xl cursor-pointer transition-all duration-300 overflow-hidden"
                    style={{
                      backgroundColor: isUnread
                        ? themeColors.unreadBg
                        : themeColors.cardBg,
                      border: `1px solid ${
                        isUnread
                          ? themeColors.unreadBorder
                          : themeColors.borderColor
                      }`,
                      boxShadow: themeColors.shadow,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        themeColors.cardBgHover;
                      e.currentTarget.style.boxShadow = themeColors.shadowHover;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isUnread
                        ? themeColors.unreadBg
                        : themeColors.cardBg;
                      e.currentTarget.style.boxShadow = themeColors.shadow;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Unread indicator bar */}
                    {isUnread && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                        style={{
                          background: themeColors.iconBgGradient,
                        }}
                      />
                    )}

                    <div className="flex items-start gap-3 p-3">
                      {/* Icon with enhanced gradient and shadow */}
                      <div className="flex-shrink-0 relative">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                          style={{
                            background: themeColors.iconBgGradient,
                            boxShadow: `0 4px 14px 0 rgba(20, 184, 166, 0.39)`,
                          }}
                        >
                          <div className="text-white text-lg">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        {/* Animated pulse ring for unread */}
                        {isUnread && (
                          <div
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                            style={{
                              backgroundColor: themeColors.error,
                              boxShadow: `0 0 0 3px ${themeColors.cardBg}`,
                            }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className="text-sm font-bold leading-tight pr-2"
                            style={{
                              color: themeColors.primaryText,
                              lineHeight: "1.3",
                            }}
                          >
                            {notification.title}
                          </h4>
                        </div>

                        <p
                          className="text-xs mb-2 line-clamp-2 leading-relaxed"
                          style={{
                            color: themeColors.secondaryText,
                            lineHeight: "1.5",
                          }}
                        >
                          {notification.message}
                        </p>

                        {/* Footer with time and action buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Time badge */}
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
                              style={{
                                backgroundColor: themeColors.accentLight,
                                color: themeColors.accent,
                              }}
                            >
                              <svg
                                className="w-2.5 h-2.5 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {formatRelativeTime(notification.createdAt)}
                            </span>

                            {/* Type badge */}
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-medium uppercase tracking-wide"
                              style={{
                                backgroundColor: isDark
                                  ? "rgba(107, 114, 128, 0.1)"
                                  : "rgba(107, 114, 128, 0.08)",
                                color: themeColors.mutedText,
                              }}
                            >
                              {notification.type
                                .replace(/_/g, " ")
                                .toLowerCase()
                                .split(" ")
                                .map((word) => word.charAt(0))
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>

                          {/* Delete Button with enhanced styling */}
                          <button
                            onClick={(e) =>
                              handleDeleteNotification(e, notification.id)
                            }
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200"
                            style={{
                              color: themeColors.mutedText,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDark
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(239, 68, 68, 0.1)";
                              e.currentTarget.style.color = themeColors.error;
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color =
                                themeColors.mutedText;
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                            title="Delete notification"
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
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div
            className="p-2 border-t text-center"
            style={{
              backgroundColor: themeColors.headerBg,
              borderColor: themeColors.borderColor,
            }}
          >
            <button
              onClick={() => {
                navigate("/notifications");
                handleClose();
              }}
              className="text-xs font-semibold transition-colors"
              style={{ color: themeColors.accent }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = themeColors.accentHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = themeColors.accent)
              }
            >
              View all notifications →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPanel;
