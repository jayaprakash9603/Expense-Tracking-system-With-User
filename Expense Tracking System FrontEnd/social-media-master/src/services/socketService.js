import io from "socket.io-client";

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

    socket.on("newFriendRequest", (friendship) => {
      console.log("New friend request received:", friendship);
      // Dispatch Redux action to update the store
      // Example: store.dispatch(addNewFriendRequest(friendship));
    });

    socket.on("friendRequestResponse", (response) => {
      console.log("Friend request response received:", response);
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
