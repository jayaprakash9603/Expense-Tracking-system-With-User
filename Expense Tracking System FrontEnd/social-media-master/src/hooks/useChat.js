import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import chatWebSocket from "../services/chatWebSocket";
import {
  fetchConversationsList,
  fetchOneToOneChat,
  setActiveConversation,
  clearActiveConversation,
  receiveOneToOneMessage,
  updateTypingStatus,
  clearTypingStatus,
  updateOnlineStatus,
  updateMessageReaction,
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

        dispatch(receiveOneToOneMessage(normalizedMessage));
        dispatch(updateConversationLastMessage(otherUserId, normalizedMessage));

        if (senderId !== user?.id) {
          if (activeConversation?.friendId !== otherUserId) {
            dispatch(incrementUnreadCount(otherUserId));
          } else {
            chatWebSocket.markAsRead([message.id]);
          }
        }
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

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribePresence();
      unsubscribeReaction();

      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [wsConnected, activeConversation, dispatch]);

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

      chatWebSocket.sendMessage(
        activeConversation.friendId,
        content,
        replyToId,
      );
    },
    [activeConversation],
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
