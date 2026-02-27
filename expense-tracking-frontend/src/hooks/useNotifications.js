/**
 * useNotifications Hook
 * Custom React hook for managing real-time notifications
 * Handles WebSocket connection, subscriptions, and notification state
 */

import { useState, useEffect, useCallback, useRef } from "react";
import notificationWebSocketService from "../services/notificationWebSocket";
import { NOTIFICATION_WS_URL } from "../config/api";

/**
 * Custom hook for managing notifications
 * @param {Object} options - Hook options
 * @param {number|string} options.userId - User ID for subscriptions
 * @param {boolean} options.autoConnect - Auto-connect on mount (default: true)
 * @param {function} options.onNewNotification - Callback when new notification arrives
 * @returns {Object} Notification state and methods
 */
const useNotifications = ({
  userId,
  autoConnect = true,
  onNewNotification,
} = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const subscriptionsRef = useRef([]);

  /**
   * Add a new notification to the list
   */
  const addNotification = useCallback(
    (notification) => {
      console.log(
        "═══════════════════════════════════════════════════════════"
      );
      console.log("🔔 NOTIFICATION RECEIVED FROM WEBSOCKET");
      console.log(
        "═══════════════════════════════════════════════════════════"
      );
      console.log(
        "📦 Raw Notification:",
        JSON.stringify(notification, null, 2)
      );
      console.log("⏰ Received At:", new Date().toLocaleString());
      console.log(
        "═══════════════════════════════════════════════════════════"
      );

      const formattedNotification = {
        ...notification,
        id: notification.id || Date.now(),
        timestamp: notification.timestamp || new Date().toISOString(),
        read: notification.read || notification.isRead || false,
      };

      console.log("📝 Formatted Notification:", formattedNotification);

      setNotifications((prev) => [formattedNotification, ...prev]);

      // Update unread count
      if (!formattedNotification.read) {
        setUnreadCount((prev) => {
          console.log("🔢 Unread Count Updated:", prev, "→", prev + 1);
          return prev + 1;
        });
      }

      // Call callback if provided
      if (onNewNotification) {
        console.log("🔄 Triggering onNewNotification callback (Redux update)");
        onNewNotification(formattedNotification);
      } else {
        console.log("⚠️  No onNewNotification callback provided");
      }

      console.log("✅ Notification processing complete");
      console.log(
        "═══════════════════════════════════════════════════════════\n"
      );

      // Show browser notification if permitted
      if (Notification.permission === "granted") {
        new Notification(formattedNotification.title || "New Notification", {
          body: formattedNotification.message || "",
          icon: "/notification-icon.png",
          tag: `notification-${formattedNotification.id}`,
        });
      }
    },
    [onNewNotification]
  );

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId && !n.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
          return { ...n, read: true };
        }
        return n;
      })
    );
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback((notificationId) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!userId) {
      console.warn("⚠️  useNotifications: Cannot connect without userId");
      return;
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log("🔌 CONNECTING TO NOTIFICATION WEBSOCKET");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("👤 User ID:", userId);
    console.log(
      "🎫 Token:",
      localStorage.getItem("jwt") ? "Present ✅" : "Missing ❌"
    );
    console.log("🌐 WebSocket URL:", NOTIFICATION_WS_URL);
    console.log("═══════════════════════════════════════════════════════════");

    notificationWebSocketService.connect({
      token: localStorage.getItem("jwt"),
      onConnect: () => {
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        console.log("✅ WEBSOCKET CONNECTED SUCCESSFULLY");
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        console.log("⏰ Connected At:", new Date().toLocaleString());
        console.log("👤 User ID:", userId);
        console.log("🔌 Status: CONNECTED");
        console.log(
          "═══════════════════════════════════════════════════════════\n"
        );
        setIsConnected(true);
      },
      onError: (error) => {
        console.error(
          "═══════════════════════════════════════════════════════════"
        );
        console.error("❌ WEBSOCKET ERROR");
        console.error(
          "═══════════════════════════════════════════════════════════"
        );
        console.error("🚨 Error:", error);
        console.error("⏰ Error At:", new Date().toLocaleString());
        console.error(
          "═══════════════════════════════════════════════════════════\n"
        );
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        console.log("🔌 WEBSOCKET DISCONNECTED");
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        console.log("⏰ Disconnected At:", new Date().toLocaleString());
        console.log("🔄 Auto-reconnect: Enabled (will retry in 5s)");
        console.log(
          "═══════════════════════════════════════════════════════════\n"
        );
        setIsConnected(false);
      },
    });
  }, [userId]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    // Unsubscribe from all topics
    subscriptionsRef.current.forEach((subscription) => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
    subscriptionsRef.current = [];

    notificationWebSocketService.disconnect();
    setIsConnected(false);
  }, []);

  /**
   * Subscribe to all notification topics for the user
   */
  const subscribeToAllTopics = useCallback(() => {
    if (!userId || !isConnected) {
      console.warn(
        "❌ Cannot subscribe - userId:",
        userId,
        "isConnected:",
        isConnected
      );
      return;
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log("📡 SUBSCRIBING TO WEBSOCKET NOTIFICATIONS");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("👤 User ID:", userId);
    console.log("🔌 Connected:", isConnected);
    console.log("📍 Topic: /user/" + userId + "/queue/notifications");
    console.log("═══════════════════════════════════════════════════════════");

    // Subscribe to all user notifications (single subscription)
    const userNotifSub =
      notificationWebSocketService.subscribeToUserNotifications(
        userId,
        (notification) => {
          console.log(
            "═══════════════════════════════════════════════════════════"
          );
          console.log("📨 RAW MESSAGE FROM WEBSOCKET TOPIC");
          console.log(
            "═══════════════════════════════════════════════════════════"
          );
          console.log(
            "📦 Notification:",
            JSON.stringify(notification, null, 2)
          );
          console.log("📍 Topic: /user/" + userId + "/queue/notifications");
          console.log("⏰ Received At:", new Date().toLocaleString());
          console.log(
            "═══════════════════════════════════════════════════════════"
          );

          // Filter out system/control messages (like SUBSCRIPTION_CONFIRMED)
          if (
            notification &&
            (notification.type === "SUBSCRIPTION_CONFIRMED" ||
              notification.type === "SYSTEM_MESSAGE" ||
              notification.type === "CONNECTION_ACK")
          ) {
            console.log("🚫 Filtering out system message:", notification.type);
            console.log("   This is a control message, not a user notification");
            console.log(
              "═══════════════════════════════════════════════════════════\n"
            );
            return; // Don't add system messages to notifications
          }

          console.log("🔄 Passing to addNotification()...\n");

          addNotification(notification);
        }
      );

    // Store subscription (only one subscription needed now)
    subscriptionsRef.current = [userNotifSub].filter(Boolean);

    if (userNotifSub) {
      console.log("✅ Successfully subscribed to notifications");
      console.log(
        "🎧 Listening for messages on topic: /user/" +
          userId +
          "/queue/notifications"
      );
      console.log(
        "═══════════════════════════════════════════════════════════\n"
      );
    } else {
      console.error("❌ Failed to subscribe to notifications");
    }
  }, [userId, isConnected, addNotification]);

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }, []);

  /**
   * Effect: Auto-connect on mount
   */
  useEffect(() => {
    if (autoConnect && userId) {
      connect();
    }

    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, userId]); // Only run on mount/unmount or userId change

  /**
   * Effect: Subscribe to topics when connected
   */
  useEffect(() => {
    if (isConnected && userId) {
      subscribeToAllTopics();
    }
  }, [isConnected, userId, subscribeToAllTopics]);

  /**
   * Effect: Calculate unread count
   */
  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  return {
    // State
    notifications,
    isConnected,
    unreadCount,

    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    connect,
    disconnect,
    requestNotificationPermission,

    // Service reference (for advanced usage)
    service: notificationWebSocketService,
  };
};

export default useNotifications;
