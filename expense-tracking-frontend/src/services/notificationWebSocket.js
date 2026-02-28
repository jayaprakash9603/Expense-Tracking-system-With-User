/**
 * Notification WebSocket Service
 * Handles real-time notifications via STOMP over WebSocket
 * Modular, reusable, and follows DRY principles
 */

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { NOTIFICATION_WS_URL } from "../config/api";

// Configuration
const RECONNECT_DELAY = 5000; // 5 seconds

// Notification topic patterns
const NOTIFICATION_TOPICS = {
  // User-specific notifications using BROADCAST pattern /topic/user/{userId}/notifications
  // This works WITHOUT authentication/Principal (proven working in subscription confirmation)
  // Backend uses: messagingTemplate.convertAndSend("/topic/user/" + userId + "/notifications", notification)
  USER_NOTIFICATIONS: (userId) => `/topic/user/${userId}/notifications`,

  // Broadcast topics
  SYSTEM_NOTIFICATIONS: "/topic/notifications",

  // All specific notification types come through the main user topic
  FRIEND_REQUESTS: (userId) => `/topic/user/${userId}/notifications`,
  BUDGET_ALERTS: (userId) => `/topic/user/${userId}/notifications`,
  BILL_REMINDERS: (userId) => `/topic/user/${userId}/notifications`,
  EXPENSE_UPDATES: (userId) => `/topic/user/${userId}/notifications`,
};

/**
 * NotificationWebSocketService Class
 * Singleton service for managing WebSocket connections for notifications
 */
class NotificationWebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.isConnected = false;
    this.reconnectTimeout = null;
    this.listeners = new Map(); // Store all listeners by topic
  }

  /**
   * Initialize and connect to WebSocket
   * @param {Object} options - Connection options
   * @param {string} options.token - JWT authentication token
   * @param {function} options.onConnect - Callback when connected
   * @param {function} options.onError - Callback on error
   * @param {function} options.onDisconnect - Callback on disconnect
   */
  connect({ token, onConnect, onError, onDisconnect } = {}) {
    if (this.client && this.isConnected) return;

    const jwt = token || localStorage.getItem("jwt") || "";

    this.client = new Client({
      webSocketFactory: () => new SockJS(NOTIFICATION_WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${jwt}`,
      },
      debug: () => {},
      reconnectDelay: RECONNECT_DELAY,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (connectFrame) => {
        this.isConnected = true;

        // Resubscribe to all previous subscriptions
        this.resubscribeAll();

        if (onConnect) {
          onConnect(connectFrame);
        }
      },

      onStompError: (errorFrame) => {
        this.isConnected = false;

        if (onError) {
          onError(errorFrame);
        }
      },

      onWebSocketClose: (closeEvent) => {
        this.isConnected = false;

        if (onDisconnect) {
          onDisconnect(closeEvent);
        }
      },

      onWebSocketError: (event) => {
        if (onError) onError(event);
      },
    });

    this.client.activate();
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.subscriptions.clear();
      this.listeners.clear();
      this.isConnected = false;
      this.client = null;
    }
  }

  /**
   * Subscribe to a notification topic
   * @param {string} topic - Topic to subscribe to
   * @param {function} callback - Callback function to handle messages
   * @param {Object} headers - Additional headers (optional)
   * @returns {Object} Subscription object with unsubscribe method
   */
  subscribe(topic, callback, headers = {}) {
    if (!this.client || !this.isConnected) {
      // Store the listener for later subscription
      if (!this.listeners.has(topic)) {
        this.listeners.set(topic, []);
      }
      this.listeners.get(topic).push({ callback, headers });
      return null;
    }

    try {
      const subscription = this.client.subscribe(
        topic,
        (message) => {
          try {
            const payload = message.body ? JSON.parse(message.body) : null;
            callback(payload, message);
          } catch {
            callback(message.body, message);
          }
        },
        headers
      );

      // Store subscription
      this.subscriptions.set(topic, subscription);

      // Store listener for reconnection
      if (!this.listeners.has(topic)) {
        this.listeners.set(topic, []);
      }
      this.listeners.get(topic).push({ callback, headers });

      return {
        unsubscribe: () => {
          this.unsubscribe(topic);
        },
      };
    } catch {
      return null;
    }
  }

  /**
   * Unsubscribe from a topic
   * @param {string} topic - Topic to unsubscribe from
   */
  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      this.listeners.delete(topic);
    }
  }

  /**
   * Resubscribe to all stored topics (used after reconnection)
   */
  resubscribeAll() {
    const topicsToResubscribe = Array.from(this.listeners.entries());
    this.listeners.clear();
    this.subscriptions.clear();

    topicsToResubscribe.forEach(([topic, callbacks]) => {
      callbacks.forEach(({ callback, headers }) => {
        this.subscribe(topic, callback, headers);
      });
    });
  }

  /**
   * Subscribe to user-specific notifications
   * @param {number|string} userId - User ID
   * @param {function} callback - Callback to handle notifications
   * @returns {Object} Subscription object
   */
  subscribeToUserNotifications(userId, callback) {
    const topic = NOTIFICATION_TOPICS.USER_NOTIFICATIONS(userId);
    const subscription = this.subscribe(topic, callback);

    // Send subscription message to backend
    if (this.isConnected) {
      this.send("/app/notifications/subscribe", userId.toString());
    }

    return subscription;
  }

  /**
   * Subscribe to friend request notifications
   * @param {number|string} userId - User ID
   * @param {function} callback - Callback to handle friend request notifications
   * @returns {Object} Subscription object
   */
  subscribeToFriendRequests(userId, callback) {
    // All notifications come through the same user queue
    return this.subscribeToUserNotifications(userId, (notification) => {
      // Filter for friend request notifications
      if (
        notification &&
        (notification.type === "FRIEND_REQUEST_RECEIVED" ||
          notification.type === "FRIEND_REQUEST_ACCEPTED" ||
          notification.type === "FRIEND_REQUEST_REJECTED")
      ) {
        callback(notification);
      }
    });
  }

  /**
   * Subscribe to budget alert notifications
   * @param {number|string} userId - User ID
   * @param {function} callback - Callback to handle budget alerts
   * @returns {Object} Subscription object
   */
  subscribeToBudgetAlerts(userId, callback) {
    // All notifications come through the same user queue
    return this.subscribeToUserNotifications(userId, (notification) => {
      // Filter for budget notifications
      if (
        notification &&
        (notification.type === "BUDGET_EXCEEDED" ||
          notification.type === "BUDGET_WARNING" ||
          notification.type === "BUDGET_LIMIT_APPROACHING")
      ) {
        callback(notification);
      }
    });
  }

  /**
   * Subscribe to bill reminder notifications
   * @param {number|string} userId - User ID
   * @param {function} callback - Callback to handle bill reminders
   * @returns {Object} Subscription object
   */
  subscribeToBillReminders(userId, callback) {
    // All notifications come through the same user queue
    return this.subscribeToUserNotifications(userId, (notification) => {
      // Filter for bill notifications
      if (
        notification &&
        (notification.type === "BILL_DUE_REMINDER" ||
          notification.type === "BILL_OVERDUE" ||
          notification.type === "BILL_PAID")
      ) {
        callback(notification);
      }
    });
  }

  /**
   * Subscribe to expense update notifications
   * @param {number|string} userId - User ID
   * @param {function} callback - Callback to handle expense updates
   * @returns {Object} Subscription object
   */
  subscribeToExpenseUpdates(userId, callback) {
    // All notifications come through the same user queue
    return this.subscribeToUserNotifications(userId, (notification) => {
      // Filter for expense notifications
      if (
        notification &&
        (notification.type === "EXPENSE_ADDED" ||
          notification.type === "EXPENSE_UPDATED" ||
          notification.type === "EXPENSE_DELETED")
      ) {
        callback(notification);
      }
    });
  }

  /**
   * Send a message to the server (if needed)
   * @param {string} destination - Destination endpoint
   * @param {Object} body - Message body
   * @param {Object} headers - Additional headers
   */
  send(destination, body, headers = {}) {
    if (!this.client || !this.isConnected) return;

    try {
      this.client.publish({
        destination,
        body: typeof body === "string" ? body : JSON.stringify(body),
        headers,
      });
    } catch {
      // Send failed - not connected
    }
  }

  /**
   * Check if connected
   * @returns {boolean} Connection status
   */
  isWebSocketConnected() {
    return this.isConnected && this.client && this.client.connected;
  }
}

// Create singleton instance
const notificationWebSocketService = new NotificationWebSocketService();

// Export singleton instance and class
export default notificationWebSocketService;
export { NotificationWebSocketService, NOTIFICATION_TOPICS };
