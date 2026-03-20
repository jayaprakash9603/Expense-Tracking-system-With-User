import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket } from "@/infrastructure/websocket/socketProvider";
import { useSocketEvent } from "@/infrastructure/websocket/useSocketEvent";
import {
  addRealtimeNotificationAction,
  dismissFloatingNotificationAction,
} from "@/redux/notifications/notifications.actions";

/**
 * Handles websocket lifecycle and notification events.
 */
export function useRealtimeNotifications() {
  const dispatch = useDispatch();
  const jwt = useSelector((state) => state.auth?.jwt);

  useEffect(() => {
    if (!jwt) return undefined;

    connectSocket(jwt);
    return () => disconnectSocket();
  }, [jwt]);

  useSocketEvent("notification", (payload) => {
    dispatch(addRealtimeNotificationAction(payload));
  });

  useSocketEvent("message", (payload) => {
    if (payload?.type === "notification") {
      dispatch(addRealtimeNotificationAction(payload));
    }
  });

  return {
    dismissFloating: (id) => dispatch(dismissFloatingNotificationAction(id)),
  };
}

export default useRealtimeNotifications;
