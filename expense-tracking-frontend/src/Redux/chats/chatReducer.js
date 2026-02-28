import {
  SEND_GROUP_CHAT,
  SEND_GROUP_CHAT_SUCCESS,
  SEND_GROUP_CHAT_FAILURE,
  FETCH_GROUP_CHAT,
  FETCH_GROUP_CHAT_SUCCESS,
  FETCH_GROUP_CHAT_FAILURE,
  FETCH_GROUP_CHAT_HISTORY,
  FETCH_GROUP_CHAT_HISTORY_SUCCESS,
  FETCH_GROUP_CHAT_HISTORY_FAILURE,
  DELETE_CHAT_MESSAGE,
  DELETE_CHAT_MESSAGE_SUCCESS,
  DELETE_CHAT_MESSAGE_FAILURE,
  EDIT_CHAT_MESSAGE,
  EDIT_CHAT_MESSAGE_SUCCESS,
  EDIT_CHAT_MESSAGE_FAILURE,
  BULK_DELETE_CHAT_MESSAGES,
  BULK_DELETE_CHAT_MESSAGES_SUCCESS,
  BULK_DELETE_CHAT_MESSAGES_FAILURE,
  FETCH_UNREAD_GROUP_CHAT,
  FETCH_UNREAD_GROUP_CHAT_SUCCESS,
  FETCH_UNREAD_GROUP_CHAT_FAILURE,
  REPLY_CHAT,
  REPLY_CHAT_SUCCESS,
  REPLY_CHAT_FAILURE,
  FETCH_CONVERSATIONS_LIST,
  FETCH_CONVERSATIONS_LIST_SUCCESS,
  FETCH_CONVERSATIONS_LIST_FAILURE,
  FETCH_ONE_TO_ONE_CHAT,
  FETCH_ONE_TO_ONE_CHAT_SUCCESS,
  FETCH_ONE_TO_ONE_CHAT_FAILURE,
  SEND_ONE_TO_ONE_MESSAGE,
  SEND_ONE_TO_ONE_MESSAGE_SUCCESS,
  SEND_ONE_TO_ONE_MESSAGE_FAILURE,
  RECEIVE_ONE_TO_ONE_MESSAGE,
  RECEIVE_MESSAGES_BATCH,
  ADD_OPTIMISTIC_MESSAGE,
  CONFIRM_OPTIMISTIC_MESSAGE,
  SET_ACTIVE_CONVERSATION,
  CLEAR_ACTIVE_CONVERSATION,
  UPDATE_TYPING_STATUS,
  CLEAR_TYPING_STATUS,
  UPDATE_ONLINE_STATUS,
  UPDATE_ONLINE_STATUS_BATCH,
  ADD_REACTION,
  ADD_REACTION_SUCCESS,
  ADD_REACTION_FAILURE,
  REMOVE_REACTION,
  REMOVE_REACTION_SUCCESS,
  REMOVE_REACTION_FAILURE,
  UPDATE_MESSAGE_REACTION,
  UPDATE_MESSAGE_STATUS,
  MARK_MESSAGES_READ,
  MARK_MESSAGES_READ_SUCCESS,
  UPDATE_READ_RECEIPT,
  FETCH_FRIENDS_PRESENCE,
  FETCH_FRIENDS_PRESENCE_SUCCESS,
  FETCH_FRIENDS_PRESENCE_FAILURE,
  UPDATE_LAST_SEEN,
  UPDATE_CONVERSATION_LAST_MESSAGE,
  INCREMENT_UNREAD_COUNT,
  RESET_UNREAD_COUNT,
  SET_WEBSOCKET_CONNECTED,
  SET_WEBSOCKET_DISCONNECTED,
} from "./chatActionTypes";

const initialState = {
  loading: false,
  error: null,
  chat: null,
  groupChat: [],
  groupChatHistory: [],
  unreadGroupChat: [],
  conversations: [],
  conversationsLoading: false,
  activeConversation: null,
  oneToOneMessages: {},
  typingUsers: {},
  onlineUsers: {},
  lastSeenMap: {},
  wsConnected: false,
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case SEND_GROUP_CHAT:
      return { ...state, loading: true, error: null };
    case SEND_GROUP_CHAT_SUCCESS:
      return {
        ...state,
        loading: false,
        groupChat: Array.isArray(state.groupChat)
          ? [...state.groupChat, action.payload]
          : [action.payload],
      };
    case SEND_GROUP_CHAT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_GROUP_CHAT:
      return { ...state, loading: true, error: null };
    case FETCH_GROUP_CHAT_SUCCESS:
      return { ...state, loading: false, groupChat: action.payload };
    case FETCH_GROUP_CHAT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_GROUP_CHAT_HISTORY:
      return { ...state, loading: true, error: null };
    case FETCH_GROUP_CHAT_HISTORY_SUCCESS:
      return { ...state, loading: false, groupChatHistory: action.payload };
    case FETCH_GROUP_CHAT_HISTORY_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case DELETE_CHAT_MESSAGE:
      return { ...state, loading: true, error: null };
    case DELETE_CHAT_MESSAGE_SUCCESS:
      return { ...state, loading: false };
    case DELETE_CHAT_MESSAGE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case EDIT_CHAT_MESSAGE:
      return { ...state, loading: true, error: null };
    case EDIT_CHAT_MESSAGE_SUCCESS:
      return { ...state, loading: false };
    case EDIT_CHAT_MESSAGE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case BULK_DELETE_CHAT_MESSAGES:
      return { ...state, loading: true, error: null };
    case BULK_DELETE_CHAT_MESSAGES_SUCCESS:
      return { ...state, loading: false };
    case BULK_DELETE_CHAT_MESSAGES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_UNREAD_GROUP_CHAT:
      return { ...state, loading: true, error: null };
    case FETCH_UNREAD_GROUP_CHAT_SUCCESS:
      return { ...state, loading: false, unreadGroupChat: action.payload };
    case FETCH_UNREAD_GROUP_CHAT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case REPLY_CHAT:
      return { ...state, loading: true, error: null };
    case REPLY_CHAT_SUCCESS:
      return {
        ...state,
        loading: false,
        groupChat: Array.isArray(state.groupChat)
          ? [...state.groupChat, action.payload]
          : state.groupChat,
      };
    case REPLY_CHAT_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case FETCH_CONVERSATIONS_LIST:
      return { ...state, conversationsLoading: true, error: null };
    case FETCH_CONVERSATIONS_LIST_SUCCESS: {
      // Map backend response to frontend expected format
      const mappedConversations = (action.payload || []).map((conv) => ({
        ...conv,
        lastMessageTime: conv.timestamp || conv.lastMessageTime,
        friendImage: conv.friendImage || null,
      }));
      return {
        ...state,
        conversationsLoading: false,
        conversations: mappedConversations,
      };
    }
    case FETCH_CONVERSATIONS_LIST_FAILURE:
      return { ...state, conversationsLoading: false, error: action.payload };

    case FETCH_ONE_TO_ONE_CHAT:
      return { ...state, loading: true, error: null };
    case FETCH_ONE_TO_ONE_CHAT_SUCCESS:
      return {
        ...state,
        loading: false,
        oneToOneMessages: {
          ...state.oneToOneMessages,
          [action.payload.friendId]: action.payload.messages,
        },
      };
    case FETCH_ONE_TO_ONE_CHAT_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case SEND_ONE_TO_ONE_MESSAGE:
      return { ...state, loading: true, error: null };
    case SEND_ONE_TO_ONE_MESSAGE_SUCCESS: {
      const message = action.payload;
      const friendId = message.receiver?.id || message.receiverId;
      const existingMessages = state.oneToOneMessages[friendId] || [];
      return {
        ...state,
        loading: false,
        oneToOneMessages: {
          ...state.oneToOneMessages,
          [friendId]: [...existingMessages, message],
        },
      };
    }
    case SEND_ONE_TO_ONE_MESSAGE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case RECEIVE_ONE_TO_ONE_MESSAGE: {
      const message = action.payload;
      const conversationId =
        message.conversationId || message.sender?.id || message.senderId;
      const existingMessages = state.oneToOneMessages[conversationId] || [];

      // Check by id first (for status updates on existing messages)
      const existingById = existingMessages.find((m) => m.id === message.id);
      if (existingById) {
        // Update existing message with new status (delivered/read)
        return {
          ...state,
          oneToOneMessages: {
            ...state.oneToOneMessages,
            [conversationId]: existingMessages.map((m) =>
              m.id === message.id ? { ...m, ...message, pending: false } : m,
            ),
          },
        };
      }

      // Check for optimistic message by tempId
      if (message.tempId) {
        const existingByTempId = existingMessages.find(
          (m) => m.tempId === message.tempId,
        );
        if (existingByTempId) {
          return {
            ...state,
            oneToOneMessages: {
              ...state.oneToOneMessages,
              [conversationId]: existingMessages.map((m) =>
                m.tempId === message.tempId
                  ? { ...message, confirmed: true, pending: false }
                  : m,
              ),
            },
          };
        }
      }

      // Match optimistic message by content+timestamp (sender confirmation)
      // This handles when server returns message without tempId
      const pendingMatch = existingMessages.find((m) => {
        if (!m.pending && !m.tempId) return false;
        // Match by content and approximate timestamp (within 10 seconds)
        const sameContent = m.content === message.content;
        const timeDiff = Math.abs(
          new Date(m.timestamp).getTime() -
            new Date(message.timestamp).getTime(),
        );
        return sameContent && timeDiff < 10000;
      });

      if (pendingMatch) {
        // Replace pending/optimistic message with confirmed one
        return {
          ...state,
          oneToOneMessages: {
            ...state.oneToOneMessages,
            [conversationId]: existingMessages.map((m) =>
              (m.tempId && m.tempId === pendingMatch.tempId) ||
              (m.pending && m.content === pendingMatch.content)
                ? { ...message, confirmed: true, pending: false }
                : m,
            ),
          },
        };
      }

      // New message from other user - add it
      return {
        ...state,
        oneToOneMessages: {
          ...state.oneToOneMessages,
          [conversationId]: [...existingMessages, message],
        },
      };
    }

    // Batch receive multiple messages in one update (optimized for rapid messaging)
    case RECEIVE_MESSAGES_BATCH: {
      const messages = action.payload;
      const newMessages = { ...state.oneToOneMessages };

      messages.forEach((message) => {
        const conversationId =
          message.conversationId || message.sender?.id || message.senderId;
        const existing = newMessages[conversationId] || [];

        // Check by ID first (status update on existing message)
        const existingById = existing.find((m) => m.id === message.id);
        if (existingById) {
          newMessages[conversationId] = existing.map((m) =>
            m.id === message.id ? { ...m, ...message, pending: false } : m,
          );
          return;
        }

        // Check by tempId (optimistic confirmation)
        if (message.tempId) {
          const existingByTempId = existing.find(
            (m) => m.tempId === message.tempId,
          );
          if (existingByTempId) {
            newMessages[conversationId] = existing.map((m) =>
              m.tempId === message.tempId
                ? { ...message, confirmed: true, pending: false }
                : m,
            );
            return;
          }
        }

        // Match by content+timestamp for sender confirmation
        const pendingMatch = existing.find((m) => {
          if (!m.pending && !m.tempId) return false;
          const sameContent = m.content === message.content;
          const timeDiff = Math.abs(
            new Date(m.timestamp).getTime() -
              new Date(message.timestamp).getTime(),
          );
          return sameContent && timeDiff < 10000;
        });

        if (pendingMatch) {
          newMessages[conversationId] = existing.map((m) =>
            (m.tempId && m.tempId === pendingMatch.tempId) ||
            (m.pending && m.content === pendingMatch.content)
              ? { ...message, confirmed: true, pending: false }
              : m,
          );
          return;
        }

        // New message - add it
        newMessages[conversationId] = [...existing, message];
      });

      return {
        ...state,
        oneToOneMessages: newMessages,
      };
    }

    // Add optimistic message immediately before server confirmation
    case ADD_OPTIMISTIC_MESSAGE: {
      const { message, conversationId } = action.payload;
      const existingMessages = state.oneToOneMessages[conversationId] || [];
      return {
        ...state,
        oneToOneMessages: {
          ...state.oneToOneMessages,
          [conversationId]: [
            ...existingMessages,
            { ...message, pending: true },
          ],
        },
      };
    }

    // Confirm optimistic message after server response
    case CONFIRM_OPTIMISTIC_MESSAGE: {
      const { tempId, confirmedMessage, conversationId } = action.payload;
      const existingMessages = state.oneToOneMessages[conversationId] || [];
      return {
        ...state,
        oneToOneMessages: {
          ...state.oneToOneMessages,
          [conversationId]: existingMessages.map((m) =>
            m.tempId === tempId
              ? { ...confirmedMessage, confirmed: true, pending: false }
              : m,
          ),
        },
      };
    }

    case SET_ACTIVE_CONVERSATION:
      return { ...state, activeConversation: action.payload };
    case CLEAR_ACTIVE_CONVERSATION:
      return { ...state, activeConversation: null };

    case UPDATE_TYPING_STATUS:
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.userId]: action.payload.isTyping,
        },
      };
    case CLEAR_TYPING_STATUS: {
      const newTypingUsers = { ...state.typingUsers };
      delete newTypingUsers[action.payload];
      return { ...state, typingUsers: newTypingUsers };
    }

    case UPDATE_ONLINE_STATUS:
      return {
        ...state,
        onlineUsers: {
          ...state.onlineUsers,
          [action.payload.userId]: action.payload.isOnline,
        },
        lastSeenMap: action.payload.lastSeen
          ? {
              ...state.lastSeenMap,
              [action.payload.userId]: action.payload.lastSeen,
            }
          : state.lastSeenMap,
      };
    case UPDATE_ONLINE_STATUS_BATCH:
      return {
        ...state,
        onlineUsers: {
          ...state.onlineUsers,
          ...action.payload.onlineStatus,
        },
        lastSeenMap: {
          ...state.lastSeenMap,
          ...action.payload.lastSeenMap,
        },
      };

    case ADD_REACTION:
    case REMOVE_REACTION:
      return { ...state, loading: true };
    case ADD_REACTION_SUCCESS:
    case REMOVE_REACTION_SUCCESS:
    case ADD_REACTION_FAILURE:
    case REMOVE_REACTION_FAILURE:
      return { ...state, loading: false };

    case UPDATE_MESSAGE_REACTION: {
      const { messageId, reactions } = action.payload;
      const updatedOneToOneMessages = { ...state.oneToOneMessages };
      Object.keys(updatedOneToOneMessages).forEach((friendId) => {
        updatedOneToOneMessages[friendId] = updatedOneToOneMessages[
          friendId
        ].map((msg) => (msg.id === messageId ? { ...msg, reactions } : msg));
      });
      return { ...state, oneToOneMessages: updatedOneToOneMessages };
    }

    // Update message delivery/read status (tick -> double tick -> blue tick)
    case UPDATE_MESSAGE_STATUS: {
      const { messageId, conversationId, status } = action.payload;
      const messages = state.oneToOneMessages[conversationId];
      if (!messages) return state;

      return {
        ...state,
        oneToOneMessages: {
          ...state.oneToOneMessages,
          [conversationId]: messages.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  isDelivered: status.isDelivered ?? msg.isDelivered,
                  isRead: status.isRead ?? msg.isRead,
                  deliveredAt: status.deliveredAt ?? msg.deliveredAt,
                  readAt: status.readAt ?? msg.readAt,
                  status: status.status ?? msg.status,
                }
              : msg,
          ),
        },
      };
    }

    case MARK_MESSAGES_READ:
      return state;
    case MARK_MESSAGES_READ_SUCCESS:
      return state;

    case UPDATE_READ_RECEIPT: {
      const { messageId, readBy } = action.payload;
      const updatedMessages = { ...state.oneToOneMessages };
      Object.keys(updatedMessages).forEach((friendId) => {
        updatedMessages[friendId] = updatedMessages[friendId].map((msg) =>
          msg.id === messageId
            ? { ...msg, readBy: [...(msg.readBy || []), readBy] }
            : msg,
        );
      });
      return { ...state, oneToOneMessages: updatedMessages };
    }

    case FETCH_FRIENDS_PRESENCE:
      return state;
    case FETCH_FRIENDS_PRESENCE_SUCCESS:
      return {
        ...state,
        onlineUsers: action.payload.onlineStatus || {},
        lastSeenMap: action.payload.lastSeenMap || {},
      };
    case FETCH_FRIENDS_PRESENCE_FAILURE:
      return state;

    case UPDATE_LAST_SEEN:
      return {
        ...state,
        lastSeenMap: {
          ...state.lastSeenMap,
          [action.payload.userId]: action.payload.lastSeen,
        },
      };

    case UPDATE_CONVERSATION_LAST_MESSAGE: {
      const { conversationId, message } = action.payload;
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === conversationId || conv.friendId === conversationId
          ? {
              ...conv,
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
            }
          : conv,
      );
      return { ...state, conversations: updatedConversations };
    }

    case INCREMENT_UNREAD_COUNT: {
      const conversationId = action.payload;
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === conversationId || conv.friendId === conversationId
          ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
          : conv,
      );
      return { ...state, conversations: updatedConversations };
    }

    case RESET_UNREAD_COUNT: {
      const conversationId = action.payload;
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === conversationId || conv.friendId === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv,
      );
      return { ...state, conversations: updatedConversations };
    }

    case SET_WEBSOCKET_CONNECTED:
      return { ...state, wsConnected: true };
    case SET_WEBSOCKET_DISCONNECTED:
      return { ...state, wsConnected: false };

    default:
      return state;
  }
};

export default chatReducer;
