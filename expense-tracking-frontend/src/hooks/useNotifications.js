/**
 * useNotifications Hook
 * Custom React hook for managing real-time notifications
 * Handles WebSocket connection, subscriptions, and notification state
 */

import { useState, useEffect, useCallback, useRef } from "react";
import notificationWebSocketService from "../services/notificationWebSocket";

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
      const formattedNotification = {
        ...notification,
        id: notification.id || Date.now(),
        timestamp: notification.timestamp || new Date().toISOString(),
        read: notification.read || notification.isRead || false,
      };

      setNotifications((prev) => [formattedNotification, ...prev]);

      if (!formattedNotification.read) {
        setUnreadCount((prev) => prev + 1);
      }

      if (onNewNotification) {
        onNewNotification(formattedNotification);
      }

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
    if (!userId) return;

    notificationWebSocketService.connect({
      token: localStorage.getItem("jwt"),
      onConnect: () => setIsConnected(true),
      onError: () => setIsConnected(false),
      onDisconnect: () => setIsConnected(false),
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
    if (!userId || !isConnected) return;

    const userNotifSub =
      notificationWebSocketService.subscribeToUserNotifications(
        userId,
        (notification) => {
          if (
            notification &&
            (notification.type === "SUBSCRIPTION_CONFIRMED" ||
              notification.type === "SYSTEM_MESSAGE" ||
              notification.type === "CONNECTION_ACK")
          ) {
            return;
          }
          addNotification(notification);
        }
      );

    subscriptionsRef.current = [userNotifSub].filter(Boolean);
  }, [userId, isConnected, addNotification]);

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;

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
