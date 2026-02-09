// ...existing code...
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = "http://localhost:7001/chat";

export function createStompClient({ token } = {}) {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {
      Authorization: "Bearer " + (token || localStorage.getItem("jwt") || ""),
    },
    onStompError: (frame) => {
      console.error("STOMP error", frame);
    },
  });

  return {
    client,

    // activate with connection logging and safe onConnect invocation
    activate: (onConnect) => {
      client.onConnect = (frame) => {
        try {
          console.log("STOMP connected to", WS_URL);
          console.log(
            "Connected frame headers:",
            frame && frame.headers ? frame.headers : frame
          );
        } catch (e) {
          console.log("STOMP connected (unable to serialize frame)", e);
        }
        if (typeof onConnect === "function") {
          try {
            onConnect(frame);
          } catch (e) {
            console.error("onConnect callback error", e);
          }
        }
      };

      client.onWebSocketClose = (event) => {
        console.warn("STOMP websocket closed", event);
      };

      client.onWebSocketError = (event) => {
        console.error("STOMP websocket error", event);
      };

      client.activate();
    },

    deactivate: () => client.deactivate(),

    publish: ({ destination, body, headers = {} }) =>
      client.publish({
        destination,
        headers,
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),

    subscribe: (destination, callback, headers = {}) =>
      client.subscribe(
        destination,
        (msg) => {
          try {
            const payload = msg.body ? JSON.parse(msg.body) : undefined;
            callback(payload, msg);
          } catch (e) {
            // fallback to raw body if JSON parse fails
            callback(msg.body, msg);
          }
        },
        headers
      ),
  };
}
// ...existing
