import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { CHAT_WS_URL } from "../config/api";

const WS_URL = CHAT_WS_URL;

class ChatWebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
    this.connected = false;
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.messageHandlers = {};
    this.typingHandlers = {};
    this.presenceHandlers = {};
    this.readReceiptHandlers = {};
    this.reactionHandlers = {};
  }

  connect(userId, onConnected, onError) {
    if (this.connected && this.client) {
      if (onConnected) onConnected();
      return;
    }

    this.userId = userId;
    const token = localStorage.getItem("jwt") || "";
    // Include userId in URL for reliable handshake identification (SockJS headers unreliable)
    const wsUrlWithUserId = `${WS_URL}?userId=${userId}`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrlWithUserId),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        userId: String(userId),
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        // Register user session with backend
        this.client.publish({
          destination: "/app/connect",
          body: JSON.stringify({ userId: this.userId }),
        });
        this.setupDefaultSubscriptions();
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.error("Chat STOMP error:", frame.headers?.message);
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        this.connected = false;
        this.handleReconnect();
      },
      onWebSocketError: (error) => {
        console.error("Chat WebSocket error:", error);
      },
    });

    this.client.activate();
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (!this.connected && this.userId) {
          this.connect(this.userId);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  setupDefaultSubscriptions() {
    this.subscribeToUserMessages();
    this.subscribeToTypingIndicators();
    this.subscribeToPresence();
    this.subscribeToReadReceipts();
    this.subscribeToReactions();
  }

  subscribeToUserMessages() {
    const destination = `/user/queue/chats`;
    this.subscribe("userMessages", destination, (message) => {
      Object.values(this.messageHandlers).forEach((handler) =>
        handler(message),
      );
    });
  }

  subscribeToTypingIndicators() {
    const destination = `/user/queue/typing`;
    this.subscribe("typing", destination, (data) => {
      Object.values(this.typingHandlers).forEach((handler) => handler(data));
    });
  }

  subscribeToPresence() {
    const destination = `/topic/presence`;
    this.subscribe("presence", destination, (data) => {
      Object.values(this.presenceHandlers).forEach((handler) => handler(data));
    });
  }

  subscribeToReadReceipts() {
    const destination = `/user/queue/read-receipts`;
    this.subscribe("readReceipts", destination, (data) => {
      Object.values(this.readReceiptHandlers).forEach((handler) =>
        handler(data),
      );
    });
  }

  subscribeToReactions() {
    const destination = `/user/queue/reactions`;
    this.subscribe("reactions", destination, (data) => {
      Object.values(this.reactionHandlers).forEach((handler) => handler(data));
    });
  }

  subscribeToGroupMessages(groupId, callback) {
    const destination = `/topic/group/${groupId}`;
    const subscriptionKey = `group_${groupId}`;
    this.subscribe(subscriptionKey, destination, callback);
    return () => this.unsubscribe(subscriptionKey);
  }

  subscribeToGroupTyping(groupId, callback) {
    const destination = `/topic/group/${groupId}/typing`;
    const subscriptionKey = `groupTyping_${groupId}`;
    this.subscribe(subscriptionKey, destination, callback);
    return () => this.unsubscribe(subscriptionKey);
  }

  subscribe(key, destination, callback) {
    if (!this.client || !this.connected) return;

    if (this.subscriptions[key]) {
      this.unsubscribe(key);
    }

    this.subscriptions[key] = this.client.subscribe(destination, (message) => {
      try {
        const payload = message.body ? JSON.parse(message.body) : null;
        callback(payload, message);
      } catch (e) {
        callback(message.body, message);
      }
    });
  }

  unsubscribe(key) {
    if (this.subscriptions[key]) {
      this.subscriptions[key].unsubscribe();
      delete this.subscriptions[key];
    }
  }

  sendMessage(receiverId, content, replyToId = null, tempId = null) {
    if (!this.client || !this.connected) return;

    const payload = {
      recipientId: receiverId,
      content,
      timestamp: new Date().toISOString(),
    };

    if (replyToId) {
      payload.replyToMessageId = replyToId;
    }

    // Include tempId so backend can return it for optimistic update matching
    if (tempId) {
      payload.tempId = tempId;
    }

    this.client.publish({
      destination: "/app/send/one-to-one",
      body: JSON.stringify(payload),
    });
  }

  sendGroupMessage(groupId, content, replyToId = null) {
    if (!this.client || !this.connected) return;

    const payload = {
      groupId,
      content,
      timestamp: new Date().toISOString(),
    };

    if (replyToId) {
      payload.replyToId = replyToId;
    }

    this.client.publish({
      destination: "/app/send/group",
      body: JSON.stringify(payload),
    });
  }

  sendTypingStart(receiverId, conversationType = "user") {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/typing/start",
      body: JSON.stringify({
        recipientId: receiverId,
        conversationType,
      }),
    });
  }

  sendTypingStop(receiverId, conversationType = "user") {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/typing/stop",
      body: JSON.stringify({
        recipientId: receiverId,
        conversationType,
      }),
    });
  }

  sendReaction(messageId, reaction) {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/reaction",
      body: JSON.stringify({
        messageId,
        reaction,
      }),
    });
  }

  markAsRead(messageIds) {
    if (!this.client || !this.connected) return;

    const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
    const validIds = ids.filter((id) => id != null);

    if (validIds.length === 0) return;

    // Send all message IDs in a single batch request to avoid N+1 queries
    this.client.publish({
      destination: "/app/mark-read-batch",
      body: JSON.stringify({
        chatIds: validIds,
      }),
    });
  }

  markAsDelivered(messageIds) {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/mark-delivered",
      body: JSON.stringify({
        messageIds,
      }),
    });
  }

  forwardMessage(messageId, recipientIds) {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/forward",
      body: JSON.stringify({
        messageId,
        recipientIds,
      }),
    });
  }

  onMessage(id, handler) {
    this.messageHandlers[id] = handler;
    return () => delete this.messageHandlers[id];
  }

  onTyping(id, handler) {
    this.typingHandlers[id] = handler;
    return () => delete this.typingHandlers[id];
  }

  onPresenceChange(id, handler) {
    this.presenceHandlers[id] = handler;
    return () => delete this.presenceHandlers[id];
  }

  onReadReceipt(id, handler) {
    this.readReceiptHandlers[id] = handler;
    return () => delete this.readReceiptHandlers[id];
  }

  onReaction(id, handler) {
    this.reactionHandlers[id] = handler;
    return () => delete this.reactionHandlers[id];
  }

  disconnect() {
    if (this.client) {
      Object.keys(this.subscriptions).forEach((key) => this.unsubscribe(key));
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.userId = null;
    }
  }

  isConnected() {
    return this.connected;
  }
}

const chatWebSocket = new ChatWebSocketService();
export default chatWebSocket;
