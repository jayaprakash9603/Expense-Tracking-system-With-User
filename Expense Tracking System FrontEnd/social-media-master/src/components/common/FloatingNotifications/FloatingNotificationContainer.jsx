/**
 * FloatingNotificationContainer Component
 *
 * Global container for floating notifications:
 * - Manages multiple notifications with stacking
 * - Limits max visible notifications
 * - Queue system for overflow
 * - Position control (top-right by default)
 * - Redux integration
 * - User preference checks
 * - Sound notifications
 * - Accessibility support
 *
 * Best Practices:
 * - Performance optimized with React.memo
 * - Respects user notification preferences
 * - Graceful degradation
 * - Mobile responsive
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";
import FloatingNotificationItem from "./FloatingNotificationItem";
import { getNotificationConfig } from "./constants/notificationTypes";
import { fetchNotificationPreferences as fetchNotificationPreferenceSettings } from "../../../Redux/NotificationPreferences/notificationPreferences.action";

/**
 * Configuration Constants
 */
const MAX_VISIBLE_NOTIFICATIONS = 5; // Max notifications visible at once
const NOTIFICATION_POSITION = {
  top: "24px",
  right: "24px",
  bottom: "auto",
  left: "auto",
};

const MOBILE_NOTIFICATION_POSITION = {
  top: "16px",
  right: "16px",
  left: "16px",
  bottom: "auto",
};

/**
 * Main Container Component
 */
const FloatingNotificationContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Redux state
  const notifications = useSelector(
    (state) => state.notifications?.notifications || []
  );
  const legacyPreferences = useSelector(
    (state) => state.notifications?.preferences || null
  );
  const { preferences: managedPreferences, loading: preferencesLoading } =
    useSelector((state) => state.notificationPreferences || {});
  const preferences = managedPreferences || legacyPreferences;

  // Local state for displayed notifications
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [queue, setQueue] = useState([]);
  const processedIds = useRef(new Set());
  const audioRef = useRef(null);
  const isInitialLoad = useRef(true); // Track if it's the first load
  const preferencesFetchAttempted = useRef(false);

  // Fetch preferences once so floating notifications honor saved settings globally
  useEffect(() => {
    if (
      !preferences &&
      !preferencesLoading &&
      !preferencesFetchAttempted.current
    ) {
      preferencesFetchAttempted.current = true;
      dispatch(fetchNotificationPreferenceSettings()).catch(() => {
        // Allow retry if the request failed
        preferencesFetchAttempted.current = false;
      });
    }
  }, [dispatch, preferences, preferencesLoading]);

  /**
   * Check if floating notifications are enabled
   */
  const floatingNotificationsEnabled = useMemo(() => {
    if (!preferences) return false; // Wait until preferences load

    // Check master toggle
    if (preferences.masterEnabled === false) return false;

    // Check floating notifications specific toggle
    if (preferences.floatingNotifications === false) return false;

    // Respect in-app notification preference (disables floating as well)

    // Check do not disturb mode
    if (preferences.doNotDisturb === true) return false;

    return true;
  }, [preferences]);
  {
    console.log(
      "Floating Notifications Enabled:",
      floatingNotificationsEnabled
    );
  }

  // Clear any displayed/queued notifications when the setting is off
  useEffect(() => {
    if (!floatingNotificationsEnabled) {
      setDisplayedNotifications([]);
      setQueue([]);
    }
  }, [floatingNotificationsEnabled]);

  /**
   * Check if notification sound is enabled
   */
  const soundEnabled = useMemo(() => {
    if (!preferences) return false;
    return (
      preferences.notificationSound === true &&
      preferences.masterEnabled !== false
    );
  }, [preferences]);

  /**
   * Check if specific notification type is enabled
   */
  const isNotificationTypeEnabled = useCallback(
    (notification) => {
      if (!preferences || !preferences.notificationPreferencesJson) {
        return true; // Default enabled
      }

      try {
        const prefs = JSON.parse(preferences.notificationPreferencesJson);
        const deliveryMethods =
          prefs.deliveryMethods?.[notification.type] || [];

        // Check if in_app delivery is enabled for this type
        return deliveryMethods.includes("in_app");
      } catch (e) {
        console.error("Error parsing notification preferences:", e);
        return true;
      }
    },
    [preferences]
  );

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio("/notification-sound.mp3");
        audioRef.current.volume = 0.5;
      }

      // Reset and play
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Could not play notification sound:", err);
      });
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }, [soundEnabled]);

  /**
   * Process new notifications from Redux
   * Only process real-time notifications, not initial load from API
   */
  useEffect(() => {
    if (!floatingNotificationsEnabled) return;
    if (!notifications || notifications.length === 0) return;

    // Skip processing on initial load/page reload
    // Only show notifications that arrive in real-time via WebSocket
    if (isInitialLoad.current) {
      console.log(
        "🚫 Initial load - marking existing notifications as processed, not displaying"
      );
      // Mark all existing notifications as processed so they don't show up
      notifications.forEach((n) => {
        if (!n.isRead) {
          processedIds.current.add(n.id);
        }
      });
      isInitialLoad.current = false;
      return;
    }

    // Get unread notifications that haven't been processed yet
    const newNotifications = notifications
      .filter((n) => !n.isRead && !processedIds.current.has(n.id))
      .filter((n) => isNotificationTypeEnabled(n))
      .slice(0, 10); // Limit to prevent spam

    if (newNotifications.length === 0) return;

    console.log("🎯 New real-time notifications to display:", newNotifications);

    newNotifications.forEach((notification) => {
      processedIds.current.add(notification.id);

      // Check if we can display immediately
      setDisplayedNotifications((current) => {
        if (current.length < MAX_VISIBLE_NOTIFICATIONS) {
          // Play sound for priority notifications
          const config = getNotificationConfig(notification.type);
          if (config.sound) {
            playNotificationSound();
          }
          return [...current, notification];
        } else {
          // Add to queue
          setQueue((q) => [...q, notification]);
          return current;
        }
      });
    });
  }, [
    notifications,
    floatingNotificationsEnabled,
    isNotificationTypeEnabled,
    playNotificationSound,
  ]);

  /**
   * Process queue when space becomes available
   */
  useEffect(() => {
    if (!floatingNotificationsEnabled) return;

    if (
      queue.length > 0 &&
      displayedNotifications.length < MAX_VISIBLE_NOTIFICATIONS
    ) {
      const [nextNotification, ...remainingQueue] = queue;
      setQueue(remainingQueue);
      setDisplayedNotifications((current) => [...current, nextNotification]);

      // Play sound for queued notification
      const config = getNotificationConfig(nextNotification.type);
      if (config.sound) {
        playNotificationSound();
      }
    }
  }, [
    queue,
    displayedNotifications.length,
    floatingNotificationsEnabled,
    playNotificationSound,
  ]);

  /**
   * Handle notification close
   */
  const handleClose = useCallback((notificationId) => {
    setDisplayedNotifications((current) =>
      current.filter((n) => n.id !== notificationId)
    );
  }, []);

  /**
   * Handle notification click - navigate to related content
   */
  const handleClick = useCallback(
    (notification) => {
      console.log("🖱️ Notification clicked:", notification);

      try {
        // Close the notification
        handleClose(notification.id);

        // Navigate based on notification type
        switch (notification.type) {
          case "FRIEND_REQUEST_RECEIVED":
          case "FRIEND_REQUEST_ACCEPTED":
          case "FRIEND_REQUEST_REJECTED":
            navigate("/friends");
            break;

          case "EXPENSE_ADDED":
          case "EXPENSE_UPDATED":
          case "EXPENSE_SHARED":
            if (notification.expenseId) {
              navigate(`/expenses/${notification.expenseId}`);
            } else {
              navigate("/expenses");
            }
            break;

          case "BUDGET_THRESHOLD_WARNING":
          case "BUDGET_EXCEEDED":
          case "BUDGET_CREATED":
          case "BUDGET_UPDATED":
            if (notification.budgetId) {
              navigate(`/budget/${notification.budgetId}`);
            } else {
              navigate("/budget");
            }
            break;

          case "BILL_DUE_SOON":
          case "BILL_OVERDUE":
          case "BILL_PAID":
          case "BILL_REMINDER":
            if (notification.billId) {
              navigate(`/bills/${notification.billId}`);
            } else {
              navigate("/bills");
            }
            break;

          case "NEW_MESSAGE":
            if (notification.chatId) {
              navigate(`/chat/${notification.chatId}`);
            } else {
              navigate("/chat");
            }
            break;

          default:
            // Default: go to notifications page
            navigate("/notifications");
        }
      } catch (error) {
        console.error("Error handling notification click:", error);
      }
    },
    [navigate, handleClose]
  );

  /**
   * Handle clear all floating notifications
   */
  const handleClearAll = useCallback(() => {
    setDisplayedNotifications([]);
    setQueue([]);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      // Keep only recent 100 IDs
      if (processedIds.current.size > 100) {
        const idsArray = Array.from(processedIds.current);
        processedIds.current = new Set(idsArray.slice(-100));
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  // Don't render if disabled
  if (!floatingNotificationsEnabled) {
    return null;
  }

  // Don't render if no notifications
  if (displayedNotifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Container */}
      <Box
        sx={{
          position: "fixed",
          ...(isMobile ? MOBILE_NOTIFICATION_POSITION : NOTIFICATION_POSITION),
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          pointerEvents: "none",
          maxHeight: "calc(100vh - 48px)",
          overflow: "visible",
        }}
      >
        {/* Clear All Button - show if there are notifications */}
        {(displayedNotifications.length > 0 || queue.length > 0) && (
          <Box
            onClick={handleClearAll}
            sx={{
              mb: 1,
              mr: 1,
              px: 2,
              py: 0.75,
              borderRadius: "20px",
              backgroundColor: isDark
                ? "rgba(26, 26, 26, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              boxShadow: isDark
                ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                : "0 4px 12px rgba(0, 0, 0, 0.1)",
              color: isDark ? "#ef4444" : "#dc2626",
              fontSize: "11px",
              fontWeight: 600,
              pointerEvents: "auto",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(220, 38, 38, 0.1)",
                transform: "translateY(-2px)",
                boxShadow: isDark
                  ? "0 6px 16px rgba(0, 0, 0, 0.4)"
                  : "0 6px 16px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <span style={{ fontSize: "12px" }}>✕</span>
            Clear All
          </Box>
        )}

        {/* Notification Items */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            pointerEvents: "auto",
            maxHeight: "100%",
            overflow: "visible",
          }}
        >
          {displayedNotifications.map((notification, index) => (
            <FloatingNotificationItem
              key={notification.id}
              notification={notification}
              onClose={handleClose}
              onClick={handleClick}
              colors={colors}
              isDark={isDark}
              index={index}
              pauseOnHover={true}
            />
          ))}
        </Box>

        {/* Queue Counter - show if there are queued notifications */}
        {queue.length > 0 && (
          <Box
            sx={{
              mt: 1,
              mr: 1,
              px: 2,
              py: 0.75,
              borderRadius: "20px",
              backgroundColor: isDark
                ? "rgba(26, 26, 26, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              boxShadow: isDark
                ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                : "0 4px 12px rgba(0, 0, 0, 0.1)",
              color: isDark ? colors.text_primary : colors.text_secondary,
              fontSize: "11px",
              fontWeight: 600,
              pointerEvents: "auto",
              animation: "fadeIn 0.3s ease",
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "translateY(-10px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            +{queue.length} more notification{queue.length > 1 ? "s" : ""}
          </Box>
        )}
      </Box>

      {/* Audio element for notification sounds */}
      <audio ref={audioRef} preload="auto" style={{ display: "none" }}>
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>
    </>
  );
};

export default React.memo(FloatingNotificationContainer);
