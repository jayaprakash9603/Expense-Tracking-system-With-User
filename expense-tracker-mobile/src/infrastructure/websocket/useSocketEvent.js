import { useEffect, useRef } from "react";
import { onSocketEvent } from "./socketProvider";

export function useSocketEvent(event, callback) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (data) => savedCallback.current(data);
    const unsubscribe = onSocketEvent(event, handler);
    return unsubscribe;
  }, [event]);
}

export default useSocketEvent;
