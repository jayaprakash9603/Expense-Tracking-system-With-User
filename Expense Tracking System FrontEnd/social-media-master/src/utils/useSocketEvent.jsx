import { useEffect, useCallback } from "react";
import { useSocket } from "./SocketProvider";

// Hook for single event
export const useSocketEvent = (eventName, handler, dependencies = []) => {
  const { addEventListener } = useSocket();

  const memoizedHandler = useCallback(handler, dependencies);

  useEffect(() => {
    const cleanup = addEventListener(eventName, memoizedHandler);
    return cleanup;
  }, [eventName, memoizedHandler, addEventListener]);
};

// Hook for multiple events
export const useSocketEvents = (eventHandlers, dependencies = []) => {
  const { addEventListener } = useSocket();

  const memoizedHandlers = useCallback(() => eventHandlers, dependencies);

  useEffect(() => {
    const handlers = memoizedHandlers();
    const cleanupFunctions = [];

    // Add all event listeners
    Object.entries(handlers).forEach(([eventName, handler]) => {
      const cleanup = addEventListener(eventName, handler);
      cleanupFunctions.push(cleanup);
    });

    // Return cleanup function
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [memoizedHandlers, addEventListener]);
};

// Hook for socket connection status
export const useSocketConnection = () => {
  const { isConnected, connectionError, getConnectionStatus } = useSocket();

  return {
    isConnected,
    connectionError,
    ...getConnectionStatus(),
  };
};

// Hook for online users
export const useOnlineUsers = () => {
  const { onlineUsers, isUserOnline } = useSocket();

  return {
    onlineUsers,
    isUserOnline,
    onlineCount: onlineUsers.length,
  };
};
