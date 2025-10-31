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
    (state) => state.notifications
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
          notification
        );
        dispatch(addNotification(notification));
        // No need to fetch all notifications or unread count - reducer handles it!
      },
      [dispatch]
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

  // Handle notification click
  const handleNotificationClick = useCallback(
    async (notification) => {
      // Mark as read
      if (!notification.isRead) {
        await dispatch(markNotificationAsRead(notification.id));
      }

      // Navigate based on notification type
      handleNotificationNavigation(notification);
    },
    [dispatch]
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
    [dispatch]
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

  // Theme colors
  const themeColors = {
    // Panel background
    panelBg: isDark ? "#1b1b1b" : "#ffffff",
    // Header background
    headerBg: isDark ? "#0b0b0b" : "#f5f5f5",
    // Border color
    borderColor: isDark ? "#333333" : "#e0e0e0",
    // Text colors
    primaryText: isDark ? "#ffffff" : "#1a1a1a",
    secondaryText: isDark ? "#666666" : "#737373",
    mutedText: isDark ? "#999999" : "#999999",
    // Accent color (brand teal)
    accent: "#14b8a6",
    accentHover: isDark ? "#00b8a9" : "#0d9488",
    // Unread background
    unreadBg: isDark ? "#28282a" : "#e0f7f5",
    // Hover states
    hoverBg: isDark ? "#28282a" : "#f0f0f0",
    // Empty state
    emptyIcon: isDark ? "#333333" : "#e0e0e0",
  };

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style>{`
        .notification-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .notification-scroll::-webkit-scrollbar-track {
          background: ${isDark ? "#1b1b1b" : "#f5f5f5"};
          border-radius: 10px;
        }
        .notification-scroll::-webkit-scrollbar-thumb {
          background: ${themeColors.accent};
          border-radius: 10px;
        }
        .notification-scroll::-webkit-scrollbar-thumb:hover {
          background: ${themeColors.accentHover};
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
            <button
              onClick={handleClose}
              className="p-0.5 rounded-lg transition-colors"
              style={{ color: themeColors.secondaryText }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = themeColors.hoverBg)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
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

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-2 mt-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium transition-colors"
                  style={{ color: themeColors.accent }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = themeColors.accentHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = themeColors.accent)
                  }
                >
                  ✓ Mark all as read
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="text-xs font-medium ml-auto transition-colors"
                style={{ color: "#ef4444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#ef4444")}
              >
                🗑 Clear all
              </button>
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
            // Empty State
            <div className="p-8 text-center">
              <svg
                className="w-14 h-14 mx-auto mb-3"
                style={{ color: themeColors.emptyIcon }}
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
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: themeColors.secondaryText }}
              >
                No notifications
              </p>
              <p className="text-xs" style={{ color: themeColors.mutedText }}>
                You're all caught up! 🎉
              </p>
            </div>
          ) : (
            // Notifications List
            <div
              className="divide-y"
              style={{ borderColor: themeColors.borderColor }}
            >
              {filteredNotifications.map((notification) => {
                const isUnread = !notification.isRead;

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="group p-2.5 cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: isUnread
                        ? themeColors.unreadBg
                        : themeColors.panelBg,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        themeColors.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isUnread
                        ? themeColors.unreadBg
                        : themeColors.panelBg;
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Icon with gradient background */}
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.accentHover})`,
                        }}
                      >
                        <div className="text-white text-base">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className="text-xs font-semibold mb-0.5 leading-tight"
                            style={{ color: themeColors.primaryText }}
                          >
                            {notification.title}
                          </h4>
                          {isUnread && (
                            <div
                              className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-0.5"
                              style={{ backgroundColor: themeColors.accent }}
                            />
                          )}
                        </div>

                        <p
                          className="text-xs mb-1 line-clamp-2 leading-snug"
                          style={{ color: themeColors.secondaryText }}
                        >
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: themeColors.mutedText }}
                          >
                            {formatRelativeTime(notification.createdAt)}
                          </span>

                          {/* Delete Button */}
                          <button
                            onClick={(e) =>
                              handleDeleteNotification(e, notification.id)
                            }
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all duration-200"
                            style={{ color: themeColors.secondaryText }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDark
                                ? "#333333"
                                : "#e0e0e0";
                              e.currentTarget.style.color = "#ef4444";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color =
                                themeColors.secondaryText;
                            }}
                            title="Delete notification"
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
