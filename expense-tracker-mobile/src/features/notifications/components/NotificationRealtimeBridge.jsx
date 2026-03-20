import React from "react";
import { useRealtimeNotifications } from "@/features/notifications/hooks/useRealtimeNotifications";

/**
 * Side-effect component to bootstrap realtime notification flow.
 */
export function NotificationRealtimeBridge() {
  useRealtimeNotifications();
  return null;
}

export default NotificationRealtimeBridge;
