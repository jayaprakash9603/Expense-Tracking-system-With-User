import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import chatWebSocket from "../services/chatWebSocket";
import {
  fetchConversationsList,
  fetchOneToOneChat,
  setActiveConversation,
  clearActiveConversation,
  receiveOneToOneMessage,
  receiveMessagesBatch,
  addOptimisticMessage,
  confirmOptimisticMessage,
  updateTypingStatus,
  clearTypingStatus,
  updateOnlineStatus,
  updateMessageReaction,
  updateMessageStatus,
  updateConversationLastMessage,
  incrementUnreadCount,
  resetUnreadCount,
  setWebSocketConnected,
  setWebSocketDisconnected,
  markMessagesRead,
  fetchFriendsPresence,
} from "../Redux/chats/chatActions";

export function useChat() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const {
    conversations,
    conversationsLoading,
    activeConversation,
    oneToOneMessages,
    typingUsers,
    onlineUsers,
    lastSeenMap,
    wsConnected,
    loading,
  } = useSelector((state) => state.chats);

  const typingTimeoutRef = useRef({});
  const messageBufferRef = useRef([]);
  const batchTimeoutRef = useRef(null);
  const BATCH_DELAY = 50; // ms to wait before dispatching batched messages

  // Flush message buffer and dispatch in batch
  const flushMessageBuffer = useCallback(() => {
    if (messageBufferRef.current.length === 0) return;

    const messages = [...messageBufferRef.current];
    messageBufferRef.current = [];

    if (messages.length === 1) {
      dispatch(receiveOneToOneMessage(messages[0].normalized));
    } else {
      dispatch(receiveMessagesBatch(messages.map((m) => m.normalized)));
    }

    // Update conversations and unread counts
    const conversationUpdates = {};
    const unreadUpdates = [];

    messages.forEach(({ normalized, senderId, otherUserId }) => {
      // Keep only the latest message per conversation
      conversationUpdates[otherUserId] = normalized;

      if (
        senderId !== user?.id &&
        activeConversation?.friendId !== otherUserId
      ) {
        unreadUpdates.push(otherUserId);
      }
    });

    // Dispatch conversation updates
    Object.entries(conversationUpdates).forEach(([friendId, msg]) => {
      dispatch(updateConversationLastMessage(parseInt(friendId), msg));
    });

    // Increment unread counts (deduplicated)
    [...new Set(unreadUpdates)].forEach((friendId) => {
      dispatch(incrementUnreadCount(friendId));
    });

    // Mark as read if active conversation
    const activeMessages = messages.filter(
      (m) =>
        m.senderId !== user?.id &&
        activeConversation?.friendId === m.otherUserId,
    );
    if (activeMessages.length > 0) {
      chatWebSocket.markAsRead(activeMessages.map((m) => m.normalized.id));
    }
  }, [dispatch, user?.id, activeConversation]);

  useEffect(() => {
    if (user?.id && !wsConnected) {
      chatWebSocket.connect(
        user.id,
        () => dispatch(setWebSocketConnected()),
        () => dispatch(setWebSocketDisconnected()),
      );
    }

    return () => {
      if (wsConnected) {
        chatWebSocket.disconnect();
        dispatch(setWebSocketDisconnected());
      }
    };
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (!wsConnected) return;

    const unsubscribeMessage = chatWebSocket.onMessage(
      "chatHook",
      (message) => {
        const senderId = message.sender?.id || message.senderId;
        const recipientId = message.recipient?.id || message.recipientId;
        const otherUserId = senderId === user?.id ? recipientId : senderId;
        const normalizedMessage = {
          ...message,
          conversationId: otherUserId,
        };

        // Add to buffer for batching
        messageBufferRef.current.push({
          normalized: normalizedMessage,
          senderId,
          otherUserId,
        });

        // Clear existing timeout and set new one
        if (batchTimeoutRef.current) {
          clearTimeout(batchTimeoutRef.current);
        }

        // Flush after short delay (batches rapid messages)
        batchTimeoutRef.current = setTimeout(() => {
          flushMessageBuffer();
        }, BATCH_DELAY);
      },
    );

    const unsubscribeTyping = chatWebSocket.onTyping("chatHook", (data) => {
      const userId = data.senderId || data.userId;
      const isTyping = data.isTyping;

      if (isTyping) {
        dispatch(updateTypingStatus(userId, true));

        if (typingTimeoutRef.current[userId]) {
          clearTimeout(typingTimeoutRef.current[userId]);
        }

        typingTimeoutRef.current[userId] = setTimeout(() => {
          dispatch(clearTypingStatus(userId));
        }, 3000);
      } else {
        dispatch(clearTypingStatus(userId));
        if (typingTimeoutRef.current[userId]) {
          clearTimeout(typingTimeoutRef.current[userId]);
        }
      }
    });

    const unsubscribePresence = chatWebSocket.onPresenceChange(
      "chatHook",
      (data) => {
        const { userId, online, lastSeen } = data;
        dispatch(updateOnlineStatus(userId, online, lastSeen));
      },
    );

    const unsubscribeReaction = chatWebSocket.onReaction("chatHook", (data) => {
      const { messageId, reactions } = data;
      dispatch(updateMessageReaction(messageId, reactions));
    });

    // Subscribe to read receipts for tick/double-tick/blue-tick updates
    const unsubscribeReadReceipt = chatWebSocket.onReadReceipt(
      "chatHook",
      (data) => {
        const {
          messageId,
          conversationId,
          isDelivered,
          isRead,
          deliveredAt,
          readAt,
        } = data;
        if (messageId && conversationId) {
          dispatch(
            updateMessageStatus(messageId, conversationId, {
              isDelivered,
              isRead,
              deliveredAt,
              readAt,
              status: isRead ? "READ" : isDelivered ? "DELIVERED" : "SENT",
            }),
          );
        }
      },
    );

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribePresence();
      unsubscribeReaction();
      unsubscribeReadReceipt();

      // Clear batch timeout and flush any remaining messages
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
        flushMessageBuffer();
      }

      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [wsConnected, activeConversation, dispatch, flushMessageBuffer]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchConversationsList());
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (conversations.length > 0) {
      const friendIds = conversations.map((c) => c.friendId);
      dispatch(fetchFriendsPresence(friendIds));
    }
  }, [conversations, dispatch]);

  const selectConversation = useCallback(
    (conversation) => {
      dispatch(setActiveConversation(conversation));
      dispatch(fetchOneToOneChat(conversation.friendId));
      dispatch(resetUnreadCount(conversation.friendId));

      const messages = oneToOneMessages[conversation.friendId] || [];
      const unreadMessageIds = messages
        .filter((m) => m.sender?.id !== user?.id && m.status !== "READ")
        .map((m) => m.id);

      if (unreadMessageIds.length > 0) {
        chatWebSocket.markAsRead(unreadMessageIds);
        dispatch(markMessagesRead(conversation.friendId));
      }
    },
    [dispatch, oneToOneMessages, user?.id],
  );

  const closeConversation = useCallback(() => {
    dispatch(clearActiveConversation());
  }, [dispatch]);

  const sendMessage = useCallback(
    (content, replyToId = null) => {
      if (!activeConversation) return;

      // Generate temp ID for optimistic update
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create optimistic message
      const optimisticMessage = {
        tempId,
        content,
        senderId: user?.id,
        recipientId: activeConversation.friendId,
        conversationId: activeConversation.friendId,
        timestamp: new Date().toISOString(),
        replyToMessageId: replyToId,
        pending: true,
        sender: {
          id: user?.id,
          firstName: user?.firstName,
          lastName: user?.lastName,
        },
      };

      // Add optimistic message immediately
      dispatch(
        addOptimisticMessage(optimisticMessage, activeConversation.friendId),
      );

      // Send via WebSocket with tempId for confirmation matching
      chatWebSocket.sendMessage(
        activeConversation.friendId,
        content,
        replyToId,
        tempId,
      );
    },
    [activeConversation, user, dispatch],
  );

  const startTyping = useCallback(() => {
    if (!activeConversation) return;
    chatWebSocket.sendTypingStart(activeConversation.friendId, "user");
  }, [activeConversation]);

  const stopTyping = useCallback(() => {
    if (!activeConversation) return;
    chatWebSocket.sendTypingStop(activeConversation.friendId, "user");
  }, [activeConversation]);

  const sendReaction = useCallback((messageId, reaction) => {
    chatWebSocket.sendReaction(messageId, reaction);
  }, []);

  const currentMessages = activeConversation
    ? oneToOneMessages[activeConversation.friendId] || []
    : [];

  const isConversationTyping = activeConversation
    ? typingUsers[activeConversation.friendId]
    : false;

  const isConversationOnline = activeConversation
    ? onlineUsers[activeConversation.friendId]
    : false;

  const conversationLastSeen = activeConversation
    ? lastSeenMap[activeConversation.friendId]
    : null;

  return {
    user,
    conversations,
    conversationsLoading,
    activeConversation,
    currentMessages,
    loading,
    wsConnected,
    typingUsers,
    onlineUsers,
    lastSeenMap,
    isConversationTyping,
    isConversationOnline,
    conversationLastSeen,
    selectConversation,
    closeConversation,
    sendMessage,
    startTyping,
    stopTyping,
    sendReaction,
  };
}

export default useChat;
