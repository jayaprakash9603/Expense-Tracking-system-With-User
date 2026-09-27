import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * STOMP-over-SockJS realtime adapter.
 *
 * @param {{
 *   url: string,
 *   tokenPort?: { getToken: () => string|null },
 *   debug?: boolean,
 * }} options
 */
export const createStompRealtimeAdapter = ({
  url,
  tokenPort,
  debug = false,
} = {}) => {
  let client = null;
  let connected = false;

  const connect = () =>
    new Promise((resolve, reject) => {
      if (client?.active) {
        resolve();
        return;
      }

      const token = tokenPort?.getToken?.();
      client = new Client({
        webSocketFactory: () => new SockJS(url),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: debug ? (msg) => console.debug("[stomp]", msg) : () => {},
        reconnectDelay: 5000,
        onConnect: () => {
          connected = true;
          resolve();
        },
        onStompError: (frame) => {
          connected = false;
          reject(new Error(frame?.headers?.message || "STOMP error"));
        },
        onWebSocketClose: () => {
          connected = false;
        },
      });

      client.activate();
    });

  const disconnect = () => {
    if (client) {
      client.deactivate();
      client = null;
      connected = false;
    }
  };

  const subscribe = (destination, callback) => {
    if (!client) {
      throw new Error("RealtimePort: call connect() before subscribe()");
    }
    const sub = client.subscribe(destination, (message) => {
      let body = message.body;
      try {
        body = JSON.parse(message.body);
      } catch {
        /* keep raw */
      }
      callback(body, message);
    });
    return () => sub.unsubscribe();
  };

  const publish = (destination, body, headers = {}) => {
    if (!client) {
      throw new Error("RealtimePort: call connect() before publish()");
    }
    client.publish({
      destination,
      body: typeof body === "string" ? body : JSON.stringify(body ?? {}),
      headers,
    });
  };

  const isConnected = () => connected && Boolean(client?.connected);

  return Object.freeze({
    connect,
    disconnect,
    subscribe,
    publish,
    isConnected,
  });
};
