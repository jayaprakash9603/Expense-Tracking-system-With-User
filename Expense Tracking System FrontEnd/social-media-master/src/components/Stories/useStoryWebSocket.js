/**
 * useStoryWebSocket Hook
 * Manages WebSocket connection for real-time story updates
 */
import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  storyReceived,
  storyUpdated,
  storyDeleted,
  refreshStories,
  wsConnected,
  wsDisconnected,
} from "../../Redux/Stories/story.action";

const STORY_WS_URL = "http://localhost:6010/ws-stories";

const useStoryWebSocket = (userId) => {
  const dispatch = useDispatch();
  const clientRef = useRef(null);
  const dispatchRef = useRef(dispatch);

  // Keep dispatch ref updated
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  // Handle story events - defined inside hook to use dispatchRef
  const handleStoryEvent = useCallback((event) => {
    const eventType = event.type || event.eventType;
    const { story, storyId } = event;

    switch (eventType) {
      case "STORY_CREATED":
        if (story) {
          dispatchRef.current(storyReceived(story));
        }
        break;

      case "STORY_UPDATED":
        if (story) {
          dispatchRef.current(storyUpdated(story));
        }
        break;

      case "STORY_DELETED":
        if (storyId) {
          dispatchRef.current(storyDeleted(storyId));
        }
        break;

      case "STORY_EXPIRED":
        if (storyId) {
          dispatchRef.current(storyDeleted(storyId));
        }
        break;

      case "REFRESH_STORIES":
        // Signal components to refetch all stories
        dispatchRef.current(refreshStories());
        break;

      default:
        break;
    }
  }, []);

  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      return;
    }

    const socket = new SockJS(STORY_WS_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      dispatchRef.current(wsConnected());

      // Subscribe to global stories
      client.subscribe("/topic/stories/global", (message) => {
        try {
          const event = JSON.parse(message.body);
          handleStoryEvent(event);
        } catch (e) {
          console.error("Failed to parse global story event:", e);
        }
      });

      // Subscribe to user-specific stories
      if (userId) {
        client.subscribe(`/topic/stories/user/${userId}`, (message) => {
          try {
            const event = JSON.parse(message.body);
            handleStoryEvent(event);
          } catch (e) {
            console.error("Failed to parse user story event:", e);
          }
        });
      }
    };

    client.onDisconnect = () => {
      dispatchRef.current(wsDisconnected());
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
    };

    client.activate();
    clientRef.current = client;
  }, [userId, handleStoryEvent]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: clientRef.current?.connected || false,
  };
};

export default useStoryWebSocket;
