import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useTheme } from "../../hooks/useTheme";
import useNotifications from "../../hooks/useNotifications";
import { useSelector } from "react-redux";
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MoneyIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  EventNote as EventIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from "@mui/icons-material";

/**
 * NotificationsPanel Component
 * Displays real-time user notifications via WebSocket
 * Features:
 * - Real-time notification display via WebSocket
 * - Mark as read/unread
 * - Delete individual notifications
 * - Clear all notifications
 * - Filter by notification type
 * - Time-based grouping (Today, Yesterday, Earlier)
 * - Icon based on notification type
 * - Connection status indicator
 * - Responsive design
 *
 * @param {boolean} isOpen - Controls panel visibility
 * @param {function} onClose - Callback to close the panel
 * @param {function} onNotificationRead - Callback with unread count when notifications are read
 */
const MAX_PANEL_NOTIFICATIONS = 100;
const PANEL_PROCESSING_BATCH_SIZE = 20;
const PANEL_PROCESSING_DELAY_MS = 12;

const NotificationsPanel = ({ isOpen, onClose, onNotificationRead }) => {
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  // Get user ID from Redux store
  const user = useSelector((state) => state.auth?.user);
  const userId = user?.id || user?.userId;

  // Use notifications hook
  const {
    notifications: rawNotifications,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    requestNotificationPermission,
  } = useNotifications({
    userId,
    autoConnect: true,
    onNewNotification: (notification) => {
      console.log("New notification received:", notification);
      // Play notification sound (optional)
      // const audio = new Audio("/notification-sound.mp3");
      // audio.play().catch(console.error);
    },
  });

  const [filter, setFilter] = useState("all"); // all, unread, read
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const pendingPanelQueue = useRef([]);
  const panelProcessingTimerRef = useRef(null);
  const processedPanelIdsRef = useRef(new Set());
  const isPanelInitializedRef = useRef(false);

  const limitedNotifications = useMemo(() => {
    if (!rawNotifications || rawNotifications.length === 0) {
      return [];
    }
    if (rawNotifications.length <= MAX_PANEL_NOTIFICATIONS) {
      return rawNotifications;
    }
    return rawNotifications.slice(-MAX_PANEL_NOTIFICATIONS);
  }, [rawNotifications]);

  const clearPanelProcessingTimer = useCallback(() => {
    if (panelProcessingTimerRef.current) {
      clearTimeout(panelProcessingTimerRef.current);
      panelProcessingTimerRef.current = null;
    }
  }, []);

  const processPanelBatch = useCallback(() => {
    clearPanelProcessingTimer();

    if (pendingPanelQueue.current.length === 0) {
      return;
    }

    const batch = pendingPanelQueue.current.splice(
      0,
      PANEL_PROCESSING_BATCH_SIZE
    );

    setDisplayedNotifications((current) => {
      const merged = [...current, ...batch];
      const trimmed = merged.slice(-MAX_PANEL_NOTIFICATIONS);
      processedPanelIdsRef.current = new Set(
        trimmed.map((notification) => notification.id)
      );
      return trimmed;
    });

    if (pendingPanelQueue.current.length > 0) {
      panelProcessingTimerRef.current = setTimeout(
        processPanelBatch,
        PANEL_PROCESSING_DELAY_MS
      );
    }
  }, [clearPanelProcessingTimer]);

  const schedulePanelProcessing = useCallback(() => {
    if (
      panelProcessingTimerRef.current ||
      pendingPanelQueue.current.length === 0
    ) {
      return;
    }
    panelProcessingTimerRef.current = setTimeout(
      processPanelBatch,
      PANEL_PROCESSING_DELAY_MS
    );
  }, [processPanelBatch]);

  useEffect(() => {
    const latestById = new Map(
      limitedNotifications.map((notification) => [
        notification.id,
        notification,
      ])
    );

    setDisplayedNotifications((current) =>
      current
        .filter((notif) => latestById.has(notif.id))
        .map((notif) => latestById.get(notif.id))
    );

    processedPanelIdsRef.current = new Set(
      [...processedPanelIdsRef.current].filter((id) => latestById.has(id))
    );

    const newNotifications = limitedNotifications.filter(
      (notif) => !processedPanelIdsRef.current.has(notif.id)
    );

    if (!isPanelInitializedRef.current) {
      processedPanelIdsRef.current = new Set(
        limitedNotifications.map((notification) => notification.id)
      );
      setDisplayedNotifications(limitedNotifications);
      isPanelInitializedRef.current = true;
      return;
    }

    if (newNotifications.length > 0) {
      pendingPanelQueue.current.push(...newNotifications);
      schedulePanelProcessing();
    }
  }, [limitedNotifications, schedulePanelProcessing]);

  useEffect(
    () => () => {
      clearPanelProcessingTimer();
      pendingPanelQueue.current = [];
    },
    [clearPanelProcessingTimer]
  );

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Notify parent component of unread count changes
  useEffect(() => {
    if (onNotificationRead) {
      onNotificationRead(unreadCount);
    }
  }, [unreadCount, onNotificationRead]);

  // Get icon component based on notification type
  const getNotificationIcon = (iconType, category) => {
    const iconProps = {
      sx: { fontSize: "1.3rem" },
      className: "notification-icon",
    };

    const iconColor =
      category === "success"
        ? "#10b981"
        : category === "warning"
        ? "#f59e0b"
        : category === "error"
        ? "#ef4444"
        : colors.primary_accent;

    const style = { color: iconColor };

    switch (iconType) {
      case "success":
        return <CheckCircleIcon {...iconProps} style={style} />;
      case "warning":
        return <WarningIcon {...iconProps} style={style} />;
      case "error":
        return <ErrorIcon {...iconProps} style={style} />;
      case "person":
        return <PersonIcon {...iconProps} style={style} />;
      case "money":
        return <MoneyIcon {...iconProps} style={style} />;
      case "bill":
        return <ReceiptIcon {...iconProps} style={style} />;
      case "category":
        return <CategoryIcon {...iconProps} style={style} />;
      case "report":
        return <TrendingUpIcon {...iconProps} style={style} />;
      case "event":
        return <EventIcon {...iconProps} style={style} />;
      default:
        return <InfoIcon {...iconProps} style={style} />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Group notifications by time
  const groupNotifications = (notifs) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today - 86400000);

    const groups = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    notifs.forEach((notif) => {
      const notifDate =
        typeof notif.timestamp === "string"
          ? new Date(notif.timestamp)
          : notif.timestamp;
      const notifDay = new Date(
        notifDate.getFullYear(),
        notifDate.getMonth(),
        notifDate.getDate()
      );

      if (notifDay.getTime() === today.getTime()) {
        groups.Today.push(notif);
      } else if (notifDay.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(notif);
      } else {
        groups.Earlier.push(notif);
      }
    });

    return groups;
  };

  // Filter notifications
  const getFilteredNotifications = () => {
    if (filter === "unread") {
      return displayedNotifications.filter((n) => !n.read);
    } else if (filter === "read") {
      return displayedNotifications.filter((n) => n.read);
    }
    return displayedNotifications;
  };

  const filteredNotifications = getFilteredNotifications();
  const groupedNotifications = groupNotifications(filteredNotifications);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ backgroundColor: "transparent" }}
      />

      {/* Notifications Panel */}
      <div
        className="fixed right-4 top-16 z-50 w-full max-w-md rounded-lg shadow-2xl overflow-hidden"
        style={{
          backgroundColor: colors.secondary_bg,
          border: `1px solid ${colors.border_color}`,
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-4 py-3 border-b"
          style={{
            backgroundColor: colors.primary_bg,
            borderColor: colors.border_color,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <NotificationsIcon
                sx={{ fontSize: "1.5rem", color: colors.primary_accent }}
              />
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.primary_text }}
              >
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 text-xs font-bold rounded-full"
                  style={{
                    backgroundColor: colors.primary_accent,
                    color: "#ffffff",
                  }}
                >
                  {unreadCount}
                </span>
              )}
              {/* Connection Status Indicator */}
              <div
                className="flex items-center gap-1"
                title={isConnected ? "Connected" : "Disconnected"}
              >
                {isConnected ? (
                  <WifiIcon sx={{ fontSize: "1rem", color: "#10b981" }} />
                ) : (
                  <WifiOffIcon sx={{ fontSize: "1rem", color: "#ef4444" }} />
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{ color: colors.secondary_text }}
            >
              <CloseIcon sx={{ fontSize: "1.2rem" }} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {["all", "unread", "read"].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    filter === filterType
                      ? colors.primary_accent
                      : "transparent",
                  color:
                    filter === filterType ? "#ffffff" : colors.secondary_text,
                  border: `1px solid ${
                    filter === filterType
                      ? colors.primary_accent
                      : colors.border_color
                  }`,
                }}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {displayedNotifications.length > 0 && (
          <div
            className="px-4 py-2 border-b flex gap-2"
            style={{ borderColor: colors.border_color }}
          >
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: `${colors.primary_accent}20`,
                  color: colors.primary_accent,
                }}
              >
                <MarkEmailReadIcon sx={{ fontSize: "1rem" }} />
                Mark all read
              </button>
            )}
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: `${colors.primary_accent}20`,
                color: colors.primary_accent,
              }}
            >
              <DeleteSweepIcon sx={{ fontSize: "1rem" }} />
              Clear all
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 250px)" }}
        >
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <NotificationsIcon
                sx={{ fontSize: "4rem", opacity: 0.3 }}
                style={{ color: colors.secondary_text }}
              />
              <p
                className="mt-4 text-center font-medium"
                style={{ color: colors.secondary_text }}
              >
                No notifications
              </p>
              <p
                className="mt-1 text-sm text-center"
                style={{ color: colors.secondary_text, opacity: 0.7 }}
              >
                {filter === "unread"
                  ? "You're all caught up!"
                  : "You have no notifications"}
              </p>
            </div>
          ) : (
            <>
              {Object.entries(groupedNotifications).map(
                ([group, notifs]) =>
                  notifs.length > 0 && (
                    <div key={group}>
                      {/* Group Header */}
                      <div
                        className="sticky top-0 px-4 py-2 text-xs font-semibold"
                        style={{
                          backgroundColor: colors.secondary_bg,
                          color: colors.secondary_text,
                        }}
                      >
                        {group}
                      </div>

                      {/* Notifications */}
                      {notifs.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 border-b cursor-pointer transition-all hover:bg-opacity-50"
                          style={{
                            backgroundColor: notification.read
                              ? "transparent"
                              : `${colors.primary_accent}10`,
                            borderColor: colors.border_color,
                          }}
                          onClick={() =>
                            !notification.read && markAsRead(notification.id)
                          }
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(
                                notification.icon,
                                notification.category
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4
                                  className="text-sm font-semibold"
                                  style={{
                                    color: colors.primary_text,
                                  }}
                                >
                                  {notification.title}
                                  {!notification.read && (
                                    <span
                                      className="ml-2 inline-block w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor: colors.primary_accent,
                                      }}
                                    />
                                  )}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="p-1 rounded hover:bg-opacity-10 transition-colors"
                                  style={{ color: colors.secondary_text }}
                                >
                                  <DeleteIcon sx={{ fontSize: "1rem" }} />
                                </button>
                              </div>
                              <p
                                className="mt-1 text-sm"
                                style={{
                                  color: colors.secondary_text,
                                }}
                              >
                                {notification.message}
                              </p>
                              <p
                                className="mt-1 text-xs"
                                style={{
                                  color: colors.secondary_text,
                                  opacity: 0.7,
                                }}
                              >
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {displayedNotifications.length > 0 && (
          <div
            className="px-4 py-3 border-t text-center"
            style={{ borderColor: colors.border_color }}
          >
            <button
              className="text-sm font-medium hover:underline transition-all"
              style={{ color: colors.primary_accent }}
            >
              <SettingsIcon
                sx={{ fontSize: "1rem", marginRight: "4px", marginTop: "-2px" }}
              />
              Notification Settings
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPanel;
