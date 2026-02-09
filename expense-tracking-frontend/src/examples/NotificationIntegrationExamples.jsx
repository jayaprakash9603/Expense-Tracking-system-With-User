// Example: How to integrate NotificationsPanel in your App

import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import NotificationsPanelRedux from "./components/common/NotificationsPanelRedux";

/**
 * Main App Component with Notifications Integration
 *
 * This example shows how to add the NotificationsPanel to your app
 */
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="app">
          {/* Header/Navbar */}
          <header className="app-header">
            <div className="header-left">
              <h1>Expense Tracker</h1>
            </div>

            <div className="header-right">
              {/* Other header items */}
              <ProfileMenu />

              {/* ✅ Add NotificationsPanel here */}
              <NotificationsPanelRedux />
            </div>
          </header>

          {/* Main Content */}
          <main className="app-main">{/* Your routes and components */}</main>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

/**
 * Alternative: If you have a separate Navbar component
 */

// In your Navbar.jsx or HeaderBar.jsx:
import React from "react";
import NotificationsPanelRedux from "./NotificationsPanelRedux";

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Logo />
      </div>

      <div className="navbar-menu">
        <NavLinks />
      </div>

      <div className="navbar-end">
        {/* Profile dropdown */}
        <UserProfileDropdown />

        {/* ✅ Notifications */}
        <NotificationsPanelRedux />
      </div>
    </nav>
  );
};

/**
 * Usage Instructions:
 *
 * 1. Import the NotificationsPanelRedux component
 * 2. Add it to your header/navbar (usually on the right side)
 * 3. Make sure Redux store is configured (already done in store.js)
 * 4. The component handles everything:
 *    - WebSocket connection
 *    - Real-time notifications
 *    - Redux state management
 *    - API calls
 *    - UI rendering
 *
 * 5. User notifications will automatically appear when:
 *    - Friend request received
 *    - Friend request accepted/rejected
 *    - Budget exceeded
 *    - Bill due reminder
 *    - Expense added/updated
 *    - Payment method added
 */

/**
 * Example: Custom Notification Toast (Optional)
 *
 * If you want to show toast notifications in addition to the panel:
 */

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify"; // or your preferred toast library

export const NotificationToastProvider = () => {
  const { notifications } = useSelector((state) => state.notifications);

  useEffect(() => {
    // Show toast for latest unread notification
    const latestUnread = notifications.find((n) => !n.isRead);

    if (latestUnread) {
      toast.info(
        <div>
          <strong>{latestUnread.title}</strong>
          <p>{latestUnread.message}</p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );
    }
  }, [notifications]);

  return null; // This component doesn't render anything
};

// Add to your App.jsx:
// <NotificationToastProvider />

/**
 * Example: Programmatic Notification Fetching
 */

import { useDispatch } from "react-redux";
import {
  fetchNotifications,
  fetchUnreadCount,
} from "./Redux/Notifications/notification.action";

const MyComponent = () => {
  const dispatch = useDispatch();

  const refreshNotifications = () => {
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  };

  return <button onClick={refreshNotifications}>Refresh Notifications</button>;
};

/**
 * Example: Filtering Notifications by Type
 */

import { useSelector } from "react-redux";

const FriendRequestNotifications = () => {
  const allNotifications = useSelector(
    (state) => state.notifications.notifications
  );

  const friendRequests = allNotifications.filter(
    (n) =>
      n.type === "FRIEND_REQUEST_RECEIVED" ||
      n.type === "FRIEND_REQUEST_ACCEPTED" ||
      n.type === "FRIEND_REQUEST_REJECTED"
  );

  return (
    <div>
      <h3>Friend Request Notifications</h3>
      {friendRequests.map((notification) => (
        <div key={notification.id}>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * Example: Custom Notification Handler
 */

import { useDispatch } from "react-redux";
import { markNotificationAsRead } from "./Redux/Notifications/notification.action";
import { useNavigate } from "react-router-dom";

const CustomNotificationHandler = ({ notification }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = async () => {
    // Mark as read
    if (!notification.isRead) {
      await dispatch(markNotificationAsRead(notification.id));
    }

    // Custom navigation logic
    const metadata = JSON.parse(notification.metadata);

    switch (notification.type) {
      case "FRIEND_REQUEST_RECEIVED":
        // Navigate to friend requests page
        navigate(`/friends/requests/${metadata.friendshipId}`);
        break;

      case "EXPENSE_ADDED":
        // Navigate to expense detail
        navigate(`/expenses/${metadata.expenseId}`);
        break;

      case "BUDGET_EXCEEDED":
        // Navigate to budget page with alert
        navigate(`/budgets/${metadata.budgetId}`, {
          state: { showAlert: true },
        });
        break;

      default:
        // Do nothing
        break;
    }
  };

  return (
    <div onClick={handleClick} className="notification-item">
      <h4>{notification.title}</h4>
      <p>{notification.message}</p>
    </div>
  );
};
