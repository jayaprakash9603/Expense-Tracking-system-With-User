import React from "react";
import { useFeatureFlag } from "@/shared/hooks/useFeatureFlag";
import { NotificationRealtimeBridge } from "./NotificationRealtimeBridge";

export function NotificationRealtimeGate() {
  const enabled = useFeatureFlag("notifications");
  if (!enabled) return null;
  return <NotificationRealtimeBridge />;
}

export default NotificationRealtimeGate;
