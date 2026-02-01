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
  wsConnected,
  wsDisconnected,
} from "../../../Redux/Stories/story.action";

const STORY_WS_URL = "http://localhost:6010/ws-stories";

const useStoryWebSocket = (userId) => {
  const dispatch = useDispatch();
  const clientRef = useRef(null);

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
      debug: function (str) {
        console.debug("STOMP:", str);
      },
    });

    client.onConnect = () => {
      console.log("Story WebSocket connected");
      dispatch(wsConnected());

      // Subscribe to global stories
      client.subscribe("/topic/stories/global", (message) => {
        try {
          const event = JSON.parse(message.body);
          handleStoryEvent(event);
        } catch (e) {
          console.error("Error parsing story event:", e);
        }
      });

      // Subscribe to user-specific stories
      if (userId) {
        client.subscribe(`/topic/stories/user/${userId}`, (message) => {
          try {
            const event = JSON.parse(message.body);
            handleStoryEvent(event);
          } catch (e) {
            console.error("Error parsing user story event:", e);
          }
        });
      }
    };

    client.onDisconnect = () => {
      console.log("Story WebSocket disconnected");
      dispatch(wsDisconnected());
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
      console.error("Details:", frame.body);
    };

    client.activate();
    clientRef.current = client;
  }, [userId, dispatch]);

  const handleStoryEvent = useCallback(
    (event) => {
      const { eventType, story, storyId } = event;

      switch (eventType) {
        case "STORY_CREATED":
          if (story) {
            dispatch(storyReceived(story));
          }
          break;

        case "STORY_UPDATED":
          if (story) {
            dispatch(storyUpdated(story));
          }
          break;

        case "STORY_DELETED":
          if (storyId) {
            dispatch(storyDeleted(storyId));
          }
          break;

        default:
          console.debug("Unknown story event type:", eventType);
      }
    },
    [dispatch],
  );

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, []);

  // Connect on mount, disconnect on unmount
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
