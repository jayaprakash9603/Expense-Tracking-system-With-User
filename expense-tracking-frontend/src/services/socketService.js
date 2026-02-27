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

    console.log("═══════════════════════════════════════════════════════════");
    console.log("🧪 WEBSOCKET TEST SERVICE - STARTING");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("👤 User ID:", userId);
    console.log("🎫 JWT Token:", jwt ? "Present ✅" : "Missing ❌");
    console.log("🌐 WebSocket URL:", NOTIFICATION_WS_URL);
    console.log("📍 Test Topic: /topic/user/" + userId + "/notifications");
    console.log("📚 Pattern: Broadcast Topic (like Chat service)");
    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );

    this.client = new Client({
      webSocketFactory: () => {
        console.log("🔌 Creating SockJS connection...");
        return new SockJS(NOTIFICATION_WS_URL);
      },
      connectHeaders: {
        Authorization: `Bearer ${jwt}`,
      },
      debug: (str) => {
        console.log("🔧 STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame) => {
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        console.log("✅ WEBSOCKET TEST - CONNECTED");
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        console.log("📡 STOMP Frame:", frame);
        console.log("⏰ Connected At:", new Date().toLocaleString());
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        this.isConnected = true;

        // Subscribe to user notifications
        this.subscribeToUserNotifications(userId);

        // Send subscription message to backend
        this.sendSubscriptionMessage(userId);
      },

      onStompError: (frame) => {
        console.error(
          "═══════════════════════════════════════════════════════════"
        );
        console.error("❌ WEBSOCKET TEST - STOMP ERROR");
        console.error(
          "═══════════════════════════════════════════════════════════"
        );
        console.error("🚨 Error Frame:", frame);
        console.error("📄 Error Headers:", frame.headers);
        console.error("📝 Error Body:", frame.body);
        console.error(
          "═══════════════════════════════════════════════════════════"
        );
        this.isConnected = false;
      },

      onWebSocketClose: (event) => {
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        console.log("🔌 WEBSOCKET TEST - CONNECTION CLOSED");
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        console.log("📊 Close Event:", event);
        console.log("🔢 Code:", event.code);
        console.log("📝 Reason:", event.reason);
        console.log("🔄 Was Clean:", event.wasClean);
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        this.isConnected = false;
      },

      onWebSocketError: (event) => {
        console.error(
          "═══════════════════════════════════════════════════════════"
        );
        console.error("❌ WEBSOCKET TEST - CONNECTION ERROR");
        console.error(
          "═══════════════════════════════════════════════════════════"
        );
        console.error("🚨 Error Event:", event);
        console.error(
          "═══════════════════════════════════════════════════════════"
        );
      },
    });

    console.log("🚀 Activating WebSocket client...");
    this.client.activate();
  }

  /**
   * Subscribe to user notifications and log everything
   */
  subscribeToUserNotifications(userId) {
    // Use BROADCAST TOPIC pattern like Chat service does with /topic/group/{groupId}
    // This pattern works without Principal - proven working in Groups/Chat
    const topic = `/topic/user/${userId}/notifications`;

    console.log("═══════════════════════════════════════════════════════════");
    console.log("📡 SUBSCRIBING TO TOPIC");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📍 Topic:", topic);
    console.log("👤 User ID:", userId);
    console.log("📚 Pattern: Broadcast Topic (like /topic/group/{groupId})");
    console.log("⏰ Subscribe At:", new Date().toLocaleString());
    console.log("═══════════════════════════════════════════════════════════");

    try {
      const subscription = this.client.subscribe(
        topic,
        (message) => {
          console.log("\n");
          console.log(
            "╔═══════════════════════════════════════════════════════════╗"
          );
          console.log(
            "║         🎉 NOTIFICATION RECEIVED FROM BACKEND!           ║"
          );
          console.log(
            "╚═══════════════════════════════════════════════════════════╝"
          );
          console.log(
            "═══════════════════════════════════════════════════════════"
          );
          console.log("📬 STOMP MESSAGE DETAILS");
          console.log(
            "═══════════════════════════════════════════════════════════"
          );
          console.log("📍 From Topic:", topic);
          console.log("⏰ Received At:", new Date().toLocaleString());
          console.log(
            "───────────────────────────────────────────────────────────"
          );
          console.log("📦 RAW MESSAGE OBJECT:");
          console.log(message);
          console.log(
            "───────────────────────────────────────────────────────────"
          );
          console.log("📄 Message Headers:");
          console.log(JSON.stringify(message.headers, null, 2));
          console.log(
            "───────────────────────────────────────────────────────────"
          );
          console.log("📝 RAW MESSAGE BODY:");
          console.log(message.body);
          console.log(
            "───────────────────────────────────────────────────────────"
          );

          try {
            const payload = JSON.parse(message.body);
            console.log("✅ PARSED NOTIFICATION PAYLOAD:");
            console.log(JSON.stringify(payload, null, 2));
            console.log(
              "───────────────────────────────────────────────────────────"
            );
            console.log("🆔 Notification ID:", payload.id);
            console.log("👤 User ID:", payload.userId);
            console.log("📌 Title:", payload.title);
            console.log("💬 Message:", payload.message);
            console.log("🏷️  Type:", payload.type);
            console.log("🎯 Priority:", payload.priority);
            console.log("✅ Is Read:", payload.isRead);
            console.log("📅 Created At:", payload.createdAt);
            console.log("📊 Metadata:", payload.metadata);
            console.log(
              "═══════════════════════════════════════════════════════════"
            );
            console.log("✅ NOTIFICATION TEST: SUCCESS!");
            console.log("   Backend is sending notifications correctly!");
            console.log(
              "═══════════════════════════════════════════════════════════\n"
            );
          } catch (parseError) {
            console.error("❌ ERROR PARSING JSON:");
            console.error(parseError);
            console.error("📦 Attempting to handle as plain text...");
            console.log(
              "═══════════════════════════════════════════════════════════\n"
            );
          }
        },
        {} // headers
      );

      this.subscriptions.set(topic, subscription);

      console.log("✅ Successfully subscribed to:", topic);
      console.log("🎧 Now listening for notifications...");
      console.log(
        "═══════════════════════════════════════════════════════════"
      );
      console.log("⏳ Waiting for notifications from backend...");
      console.log("   Trigger an event (create expense, etc.) to test");
      console.log(
        "═══════════════════════════════════════════════════════════\n"
      );
    } catch (error) {
      console.error(
        "═══════════════════════════════════════════════════════════"
      );
      console.error("❌ SUBSCRIPTION ERROR");
      console.error(
        "═══════════════════════════════════════════════════════════"
      );
      console.error("🚨 Error:", error);
      console.error("📍 Topic:", topic);
      console.error(
        "═══════════════════════════════════════════════════════════\n"
      );
    }
  }

  /**
   * Send subscription message to backend
   */
  sendSubscriptionMessage(userId) {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📤 SENDING SUBSCRIPTION MESSAGE TO BACKEND");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📍 Destination: /app/notifications/subscribe");
    console.log("👤 User ID:", userId);
    console.log("═══════════════════════════════════════════════════════════");

    try {
      this.client.publish({
        destination: "/app/notifications/subscribe",
        body: userId.toString(),
      });

      console.log("✅ Subscription message sent successfully");
      console.log("   Backend should acknowledge subscription");
      console.log("   Watch for SUBSCRIPTION_CONFIRMED message...");
      console.log(
        "═══════════════════════════════════════════════════════════\n"
      );
    } catch (error) {
      console.error("❌ Error sending subscription message:", error);
      console.error(
        "═══════════════════════════════════════════════════════════\n"
      );
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🔌 DISCONNECTING WEBSOCKET TEST SERVICE");
    console.log("═══════════════════════════════════════════════════════════");

    if (this.client) {
      this.subscriptions.forEach((subscription, topic) => {
        console.log("📍 Unsubscribing from:", topic);
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
      this.isConnected = false;

      console.log("✅ Disconnected successfully");
      console.log(
        "═══════════════════════════════════════════════════════════\n"
      );
    } else {
      console.log("⚠️  No active connection to disconnect");
      console.log(
        "═══════════════════════════════════════════════════════════\n"
      );
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    const status = {
      isConnected: this.isConnected,
      hasClient: !!this.client,
      subscriptionCount: this.subscriptions.size,
      subscriptions: Array.from(this.subscriptions.keys()),
    };

    console.log("═══════════════════════════════════════════════════════════");
    console.log("📊 CONNECTION STATUS");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🔌 Is Connected:", status.isConnected);
    console.log("📡 Has Client:", status.hasClient);
    console.log("📊 Active Subscriptions:", status.subscriptionCount);
    console.log("📍 Topics:", status.subscriptions);
    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );

    return status;
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export for use in browser console and components
window.socketService = socketService;

export default socketService;

// Test function - call this from browser console
window.testNotifications = (userId) => {
  console.log("\n\n");
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║           🧪 STARTING NOTIFICATION TEST                  ║");
  console.log(
    "╚═══════════════════════════════════════════════════════════╝\n"
  );

  if (!userId) {
    console.error("❌ ERROR: Please provide a user ID");
    console.log("📝 Usage: testNotifications(2)");
    return;
  }

  socketService.connectAndTest(userId);

  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("📋 TESTING INSTRUCTIONS");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("1. Wait for 'WEBSOCKET TEST - CONNECTED' message");
  console.log("2. Wait for 'Successfully subscribed' message");
  console.log("3. Trigger a backend event (create expense, etc.)");
  console.log("4. Watch console for notification arrival");
  console.log("5. Look for '🎉 NOTIFICATION RECEIVED FROM BACKEND!' message");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\n");
  console.log(
    "To check connection status: socketService.getConnectionStatus()"
  );
  console.log("To disconnect: socketService.disconnect()");
  console.log("\n");
};

console.log("═══════════════════════════════════════════════════════════");
console.log("✅ WebSocket Test Service Loaded");
console.log("═══════════════════════════════════════════════════════════");
console.log("📝 To test notifications, open browser console and run:");
console.log("   testNotifications(YOUR_USER_ID)");
console.log("   Example: testNotifications(2)");
console.log("═══════════════════════════════════════════════════════════\n");
