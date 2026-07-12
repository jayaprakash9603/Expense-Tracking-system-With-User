import React from "react";
import { useRealtimeNotifications } from "@/features/notifications/hooks/useRealtimeNotifications";

export function NotificationRealtimeBridge() {
  useRealtimeNotifications();
  return null;
}

export default NotificationRealtimeBridge;
