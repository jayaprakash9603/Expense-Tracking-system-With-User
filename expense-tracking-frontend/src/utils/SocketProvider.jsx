// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   useRef,
// } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import io from "socket.io-client";
// import { fetchFriendRequests } from "../Redux/Friends/friendsActions";

// // Create Socket Context
// const SocketContext = createContext();

// // Custom hook to use socket context
// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error("useSocket must be used within a SocketProvider");
//   }
//   return context;
// };

// // Socket Provider Component
// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionError, setConnectionError] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState(new Set());

//   const dispatch = useDispatch();
//   const { user, isAuthenticated } = useSelector((state) => state.auth);

//   // Use ref to store event listeners to avoid stale closures
//   const eventListenersRef = useRef(new Map());

//   // Initialize socket connection
//   const initializeSocket = useCallback(
//     (userId) => {
//       const token = localStorage.getItem("jwt");

//       if (!token || !userId) {
//         console.error("Missing token or userId for socket initialization");
//         return;
//       }

//       // Disconnect existing socket if any
//       if (socket) {
//         socket.disconnect();
//       }

//       const newSocket = io(
//         process.env.REACT_APP_API_BASE_URL || "http://localhost:9999",
//         {
//           query: {
//             userId: userId,
//             token: token,
//           },
//           transports: ["websocket", "polling"],
//           reconnection: true,
//           reconnectionAttempts: 5,
//           reconnectionDelay: 1000,
//         }
//       );

//       // Core socket event handlers
//       newSocket.on("connect", () => {
//         console.log("Socket connected:", newSocket.id);
//         setIsConnected(true);
//         setConnectionError(null);
//       });

//       newSocket.on("connect_error", (error) => {
//         console.error("Socket connection error:", error);
//         setConnectionError(error.message);
//         setIsConnected(false);
//       });

//       newSocket.on("disconnect", (reason) => {
//         console.log("Socket disconnected:", reason);
//         setIsConnected(false);
//         if (reason === "io server disconnect") {
//           newSocket.connect();
//         }
//       });

//       // Application-specific event handlers
//       setupApplicationEvents(newSocket);

//       setSocket(newSocket);
//       console.log("Socket initialized for user:", userId);
//     },
//     [socket, dispatch]
//   );

//   // Setup application-specific socket events
//   const setupApplicationEvents = useCallback(
//     (socketInstance) => {
//       // Friend request events
//       socketInstance.on("newFriendRequest", (recipientId, senderId) => {
//         console.log("New friend request from:", senderId, "to:", recipientId);
//         dispatch(fetchFriendRequests());

//         // Trigger custom event listeners
//         triggerEventListeners("newFriendRequest", { recipientId, senderId });
//       });

//       socketInstance.on("friendRequestResponse", (response) => {
//         console.log("Friend request response received:", response);
//         dispatch(fetchFriendRequests());

//         triggerEventListeners("friendRequestResponse", response);
//       });

//       socketInstance.on("friendStatusChange", (data) => {
//         console.log("Friend status changed:", data);
//         triggerEventListeners("friendStatusChange", data);
//       });

//       // Expense-related events
//       socketInstance.on("expenseAdded", (expense) => {
//         console.log("New expense added:", expense);
//         triggerEventListeners("expenseAdded", expense);
//       });

//       socketInstance.on("expenseUpdated", (expense) => {
//         console.log("Expense updated:", expense);
//         triggerEventListeners("expenseUpdated", expense);
//       });

//       socketInstance.on("expenseDeleted", (expenseId) => {
//         console.log("Expense deleted:", expenseId);
//         triggerEventListeners("expenseDeleted", { expenseId });
//       });

//       socketInstance.on("dailySummaryUpdated", (summary) => {
//         console.log("Daily summary updated:", summary);
//         triggerEventListeners("dailySummaryUpdated", summary);
//       });

//       // User presence events
//       socketInstance.on("userOnline", (userData) => {
//         console.log("User came online:", userData);
//         setOnlineUsers((prev) => new Set([...prev, userData.userId]));
//         triggerEventListeners("userOnline", userData);
//       });

//       socketInstance.on("userOffline", (userId) => {
//         console.log("User went offline:", userId);
//         setOnlineUsers((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(userId);
//           return newSet;
//         });
//         triggerEventListeners("userOffline", { userId });
//       });

//       // Notification events
//       socketInstance.on("notification", (notification) => {
//         console.log("New notification:", notification);
//         triggerEventListeners("notification", notification);
//       });

//       // Real-time updates
//       socketInstance.on("dataUpdate", (updateData) => {
//         console.log("Data update received:", updateData);
//         triggerEventListeners("dataUpdate", updateData);
//       });
//     },
//     [dispatch]
//   );

//   // Trigger custom event listeners
//   const triggerEventListeners = useCallback((eventName, data) => {
//     const listeners = eventListenersRef.current.get(eventName);
//     if (listeners) {
//       listeners.forEach((listener) => {
//         try {
//           listener(data);
//         } catch (error) {
//           console.error(`Error in event listener for ${eventName}:`, error);
//         }
//       });
//     }
//   }, []);

//   // Add event listener
//   const addEventListener = useCallback((eventName, listener) => {
//     if (!eventListenersRef.current.has(eventName)) {
//       eventListenersRef.current.set(eventName, new Set());
//     }
//     eventListenersRef.current.get(eventName).add(listener);

//     console.log(`Event listener added for: ${eventName}`);

//     // Return cleanup function
//     return () => {
//       removeEventListener(eventName, listener);
//     };
//   }, []);

//   // Remove event listener
//   const removeEventListener = useCallback((eventName, listener) => {
//     const listeners = eventListenersRef.current.get(eventName);
//     if (listeners) {
//       listeners.delete(listener);
//       console.log(`Event listener removed for: ${eventName}`);
//     }
//   }, []);

//   // Emit socket event
//   const emitEvent = useCallback(
//     (eventName, data) => {
//       if (socket && socket.connected) {
//         socket.emit(eventName, data);
//         console.log(`Socket event emitted: ${eventName}`, data);
//         return true;
//       } else {
//         console.warn(`Cannot emit ${eventName}: Socket not connected`);
//         return false;
//       }
//     },
//     [socket]
//   );

//   // Disconnect socket
//   const disconnectSocket = useCallback(() => {
//     if (socket) {
//       socket.disconnect();
//       setSocket(null);
//       setIsConnected(false);
//       setConnectionError(null);
//       setOnlineUsers(new Set());
//       eventListenersRef.current.clear();
//       console.log("Socket disconnected and cleaned up");
//     }
//   }, [socket]);

//   useEffect(() => {
//     console.log("Auth state changed:", { isAuthenticated, userId: user?.id });

//     if (isAuthenticated && user?.id) {
//       console.log("Initializing socket for authenticated user:", user.id);
//       initializeSocket(user.id);
//     } else {
//       console.log("User not authenticated, disconnecting socket");
//       disconnectSocket();
//     }
//   }, [isAuthenticated, user?.id, initializeSocket, disconnectSocket]);
//   // Check if user is online
//   const isUserOnline = useCallback(
//     (userId) => {
//       return onlineUsers.has(userId);
//     },
//     [onlineUsers]
//   );

//   // Get connection status
//   const getConnectionStatus = useCallback(() => {
//     return {
//       isConnected,
//       connectionError,
//       socketId: socket?.id || null,
//     };
//   }, [isConnected, connectionError, socket]);

//   // Initialize socket when user is authenticated
//   useEffect(() => {
//     if (isAuthenticated && user?.id) {
//       initializeSocket(user.id);
//     } else {
//       disconnectSocket();
//     }
//   }, [isAuthenticated, user?.id, initializeSocket, disconnectSocket]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       disconnectSocket();
//     };
//   }, [disconnectSocket]);

//   // Context value
//   const contextValue = {
//     socket,
//     isConnected,
//     connectionError,
//     onlineUsers: Array.from(onlineUsers),
//     addEventListener,
//     removeEventListener,
//     emitEvent,
//     disconnectSocket,
//     isUserOnline,
//     getConnectionStatus,
//   };

//   return (
//     <SocketContext.Provider value={contextValue}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export default SocketProvider;
