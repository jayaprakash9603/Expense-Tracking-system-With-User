// ...existing code...
import React, { useEffect, useRef, useState } from "react";
import { createStompClient } from "../services/stomp";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const subRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const stomp = createStompClient({ debug: true });
    clientRef.current = stomp;

    stomp.activate(() => {
      // subscribe to user queue (one-to-one) or group topic as needed
      const groupId = 15; // or get from props/state
      const sub = stomp.subscribe(
        `/topic/group/${groupId}`, // subscribe to group topic instead of /user/queue/chats
        (frame) => {
          let payload;
          try {
            payload = frame.body ? JSON.parse(frame.body) : frame;
          } catch (e) {
            payload = frame.body;
          }
          console.log(`RECEIVED on /topic/group/${groupId}:`, payload);
          setMessages((m) => [...m, payload]);
        },
        { id: `sub-topic-group-${groupId}` }
      );

      subRef.current = sub;
      console.log("Subscribed object:", sub);
      console.log("Subscription id:", sub && sub.id);

      // send a test ping — body must be a string
      stomp.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ sender: "me", content: "ping" }),
      });
    });

    return () => {
      // cleanup: unsubscribe and deactivate
      try {
        if (subRef.current && subRef.current.unsubscribe)
          subRef.current.unsubscribe();
      } catch (e) {
        console.warn("unsubscribe error", e);
      }
      try {
        if (clientRef.current) clientRef.current.deactivate();
      } catch (e) {
        console.warn("deactivate error", e);
      }
    };
  }, []);

  return (
    <div>
      <h3>Chat</h3>
      <button
        onClick={() =>
          clientRef.current &&
          clientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({ sender: "me", content: "manual ping" }),
          })
        }
      >
        Send ping
      </button>
      <div>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.sender}</b>: {m.content}
          </div>
        ))}
      </div>
    </div>
  );
}
// ...existing code...
