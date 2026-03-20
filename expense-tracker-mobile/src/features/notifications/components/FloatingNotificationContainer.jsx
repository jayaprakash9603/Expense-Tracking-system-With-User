import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissFloatingNotificationAction } from "@/redux/notifications/notifications.actions";
import { FloatingNotificationItem } from "@/features/notifications/components/FloatingNotificationItem";

/**
 * Shows capped floating notification stack with auto-dismiss.
 */
export function FloatingNotificationContainer() {
  const dispatch = useDispatch();
  const floatingQueue = useSelector((state) => state.notifications?.floatingQueue || []);

  useEffect(() => {
    if (!floatingQueue.length) return undefined;

    const timers = floatingQueue.map((item) =>
      setTimeout(() => {
        dispatch(dismissFloatingNotificationAction(item.id));
      }, 4500),
    );

    return () => timers.forEach((timerId) => clearTimeout(timerId));
  }, [dispatch, floatingQueue]);

  if (!floatingQueue.length) return null;

  return (
    <div className="pointer-events-none fixed right-3 top-16 z-[120] flex w-auto flex-col gap-2">
      {floatingQueue.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <FloatingNotificationItem
            item={item}
            onDismiss={(id) => dispatch(dismissFloatingNotificationAction(id))}
          />
        </div>
      ))}
    </div>
  );
}

export default FloatingNotificationContainer;
