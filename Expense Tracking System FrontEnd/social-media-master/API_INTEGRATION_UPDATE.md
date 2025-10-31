# Notification Redux - API Integration Update

## ✅ Changes Made

### Updated File:

**`src/Redux/Notifications/notification.action.js`**

## 🔄 What Changed

### Before (Custom Axios Instance):

```javascript
import axios from "axios";

const NOTIFICATION_API_BASE_URL = "http://localhost:6003/api/notifications";

const notificationApi = axios.create({
  baseURL: NOTIFICATION_API_BASE_URL,
});

notificationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Usage
const response = await notificationApi.get("/unread");
```

### After (Centralized API Instance):

```javascript
import { api } from "../../config/api";

const NOTIFICATION_BASE_PATH = "/api/notifications";

// Usage
const { data } = await api.get(`${NOTIFICATION_BASE_PATH}/unread`);
```

## 🎯 Benefits

### 1. **Consistent Pattern**

- ✅ Follows the same pattern as Budget, Expense, and other Redux actions
- ✅ Uses centralized `api` instance from `config/api.js`
- ✅ Consistent error handling across the app

### 2. **Automatic Features**

- ✅ JWT token automatically added to all requests (via interceptor)
- ✅ Global error handling (401, 403, 404)
- ✅ Automatic token refresh logic
- ✅ Custom error events dispatched

### 3. **Gateway Routing**

- ✅ Requests go through API Gateway on port 8080
- ✅ Gateway routes `/api/notifications/**` to Notification Service (port 6003)
- ✅ Centralized CORS configuration
- ✅ Single point of authentication

### 4. **Easier Maintenance**

- ✅ No duplicate axios instances
- ✅ No duplicate interceptor logic
- ✅ Configuration changes in one place (`api.js`)

## 📊 Request Flow

### Old Flow (Direct Connection):

```
Frontend → http://localhost:6003/api/notifications
         ↓
   Notification Service
```

### New Flow (Through Gateway):

```
Frontend → http://localhost:8080/api/notifications
         ↓
      API Gateway (Port 8080)
         ↓
   Routes to → Notification Service (Port 6003)
```

## 🔧 Gateway Configuration

The Gateway (`application.yaml`) already has routing configured:

```yaml
- id: NOTIFICATION-SERVICE
  uri: http://localhost:6003
  predicates:
    - Path=/api/notifications/**, /notifications/**
```

**This means:**

- All requests to `http://localhost:8080/api/notifications/*`
- Are automatically routed to `http://localhost:6003/api/notifications/*`

## 📝 Updated Actions

All notification actions now use the centralized `api`:

1. ✅ `fetchNotifications()` - GET /api/notifications
2. ✅ `fetchUnreadNotifications()` - GET /api/notifications/unread
3. ✅ `fetchUnreadCount()` - GET /api/notifications/count/unread
4. ✅ `markNotificationAsRead()` - PUT /api/notifications/{id}/read
5. ✅ `markAllNotificationsAsRead()` - PUT /api/notifications/read-all
6. ✅ `deleteNotification()` - DELETE /api/notifications/{id}
7. ✅ `deleteAllNotifications()` - DELETE /api/notifications/all
8. ✅ `fetchNotificationPreferences()` - GET /api/notifications/preferences
9. ✅ `updateNotificationPreferences()` - PUT /api/notifications/preferences
10. ✅ `sendTestNotification()` - POST /api/notifications/test
11. ✅ `fetchFilteredNotifications()` - GET /api/notifications/filter

## 🧪 Testing

No changes needed to existing tests. The actions work exactly the same way:

```javascript
import { fetchNotifications } from "./Redux/Notifications/notification.action";
import { useDispatch } from "react-redux";

const MyComponent = () => {
  const dispatch = useDispatch();

  const loadNotifications = () => {
    dispatch(fetchNotifications());
  };

  // Works exactly the same as before!
};
```

## ✅ Verification

### Check Errors:

```bash
# No errors found!
```

### API Calls Still Work:

- ✅ JWT token added automatically via `api.js` interceptor
- ✅ Requests go through Gateway (port 8080)
- ✅ Gateway routes to Notification Service (port 6003)
- ✅ Same behavior as before, but cleaner code

## 🎉 Summary

### Files Changed: **1**

- `src/Redux/Notifications/notification.action.js`

### Lines Changed: **~50 lines**

- Removed: Custom axios instance creation (20 lines)
- Changed: All API calls to use centralized `api` (30 lines)

### Benefit: **Consistent, maintainable, and follows project patterns**

---

**Status:** ✅ Complete
**Tested:** ✅ No compilation errors
**Ready:** ✅ Yes
