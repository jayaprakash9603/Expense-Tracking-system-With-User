import { getAppConfig } from "@/config/runtime/parseAppConfig";

let socketInstance = null;
const listeners = new Map();

function resolveWebSocketBaseUrl() {
  return getAppConfig().apiBaseUrl.replace(/^http/, "ws");
}

export function connectSocket(token) {
  if (getAppConfig().isDemo) return null;
  if (socketInstance?.readyState === WebSocket.OPEN) return socketInstance;

  const url = `${resolveWebSocketBaseUrl()}/ws?token=${encodeURIComponent(token)}`;
  socketInstance = new WebSocket(url);

  socketInstance.onopen = () => {
    listeners.forEach((cbs, event) => {
      if (event === "open") cbs.forEach((cb) => cb());
    });
  };

  socketInstance.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const type = data.type || "message";
      const typeCbs = listeners.get(type) || [];
      typeCbs.forEach((cb) => cb(data));
      const allCbs = listeners.get("message") || [];
      allCbs.forEach((cb) => cb(data));
    } catch {
      /* non-JSON message */
    }
  };

  socketInstance.onclose = () => {
    socketInstance = null;
    const cbs = listeners.get("close") || [];
    cbs.forEach((cb) => cb());
  };

  socketInstance.onerror = (err) => {
    const cbs = listeners.get("error") || [];
    cbs.forEach((cb) => cb(err));
  };

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.close();
    socketInstance = null;
  }
}

export function onSocketEvent(event, callback) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(callback);
  return () => {
    const cbs = listeners.get(event);
    if (cbs) {
      const idx = cbs.indexOf(callback);
      if (idx > -1) cbs.splice(idx, 1);
    }
  };
}

export function sendSocketMessage(data) {
  if (socketInstance?.readyState === WebSocket.OPEN) {
    socketInstance.send(JSON.stringify(data));
  }
}

export function getSocketState() {
  if (!socketInstance) return "CLOSED";
  const states = { 0: "CONNECTING", 1: "OPEN", 2: "CLOSING", 3: "CLOSED" };
  return states[socketInstance.readyState] || "UNKNOWN";
}
