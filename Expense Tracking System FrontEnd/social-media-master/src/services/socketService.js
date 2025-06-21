import io from "socket.io-client";
import { getStore } from "../utils/store";
import { fetchFriendRequests } from "../Redux/Friends/friendsActions";

let socket;

export const initializeSocket = (userId) => {
  const token = localStorage.getItem("jwt");

  if (!token || !userId) {
    console.error("Missing token or userId for socket initialization");
    return null;
  }

  if (!socket) {
    socket = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:9999", {
      query: {
        userId: userId,
        token: token,
      },
      transports: ["websocket", "polling"], // Try websocket first, then fallback to polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    console.log("Socket initialized for user:", userId);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("newFriendRequest", (recipientId) => {
      console.log("New friend request for recipientId:", recipientId);
      // if (typeof recipientId !== "string" && typeof recipientId !== "number") {
      //   console.error("Invalid recipientId:", recipientId);
      //   return;
      // }
      getStore().dispatch(fetchFriendRequests());
    });

    socket.on("friendRequestResponse", (response) => {
      console.log("Friend request response received test :", response);
      // Dispatch Redux action to update the store
      // Example: store.dispatch(removeFriendRequest(response.friendshipId));
    });

    socket.on("friendStatusChange", (data) => {
      console.log("Friend status changed:", data);
      // Dispatch Redux action to update the store
      // Example: store.dispatch(updateFriendStatus(data));
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, reconnect manually
        socket.connect();
      }
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected");
  }
};
