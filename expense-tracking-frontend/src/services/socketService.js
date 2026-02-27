/**
 * WebSocket Service for Testing Notification Reception
 * This service directly tests if notifications are being received from the backend
 * Use this to debug notification delivery issues
 */

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { NOTIFICATION_WS_URL } from "../config/api";

class SocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
  }

  /**
   * Connect to WebSocket and test notification reception
   * @param {number|string} userId - User ID to test
   */
  connectAndTest(userId) {
    const jwt = localStorage.getItem("jwt") || "";

    this.client = new Client({
      webSocketFactory: () => new SockJS(NOTIFICATION_WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${jwt}`,
      },
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        this.isConnected = true;
        this.subscribeToUserNotifications(userId);
        this.sendSubscriptionMessage(userId);
      },

      onStompError: () => {
        this.isConnected = false;
      },

      onWebSocketClose: () => {
        this.isConnected = false;
      },

      onWebSocketError: () => {},
    });

    this.client.activate();
  }

  /**
   * Subscribe to user notifications
   */
  subscribeToUserNotifications(userId) {
    const topic = `/topic/user/${userId}/notifications`;

    try {
      const subscription = this.client.subscribe(
        topic,
        () => {},
        {}
      );

      this.subscriptions.set(topic, subscription);
    } catch {
      // Subscription failed
    }
  }

  /**
   * Send subscription message to backend
   */
  sendSubscriptionMessage(userId) {
    try {
      this.client.publish({
        destination: "/app/notifications/subscribe",
        body: userId.toString(),
      });
    } catch {
      // Send failed
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasClient: !!this.client,
      subscriptionCount: this.subscriptions.size,
      subscriptions: Array.from(this.subscriptions.keys()),
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export for use in browser console and components
window.socketService = socketService;

export default socketService;

// Test function - call this from browser console
window.testNotifications = (userId) => {
  if (!userId) return;
  socketService.connectAndTest(userId);
};
