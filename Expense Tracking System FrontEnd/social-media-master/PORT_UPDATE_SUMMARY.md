# Port Configuration Update - Notification Service

## ✅ Changes Made

The Notification-Service port has been corrected from **8092** to **6003** across all files.

### Files Updated:

#### 1. **Frontend WebSocket Service** ✅

- **File:** `src/services/notificationWebSocket.js`
- **Change:** `const NOTIFICATION_WS_URL = "http://localhost:8092/ws"` → `"http://localhost:6003/ws"`

#### 2. **System Documentation** ✅

- **File:** `NOTIFICATION_SYSTEM_DOCUMENTATION.md`
- **Changes:**
  - Configuration section updated to port 6003
  - Troubleshooting section updated to port 6003

#### 3. **Quick Start Guide** ✅

- **File:** `NOTIFICATION_QUICKSTART.md`
- **Changes:**
  - Prerequisites updated to port 6003
  - Configuration section updated to port 6003
  - Troubleshooting section updated to port 6003

### Backend Configuration (Verified)

**File:** `Notification-Service/src/main/resources/application.yaml`

```yaml
server:
  port: 6003 # ✅ Confirmed
```

## Connection Details

### WebSocket Endpoint

```
ws://localhost:6003/ws
```

### Health Check Endpoint

```
http://localhost:6003/actuator/health
```

### Service Registration

The service is registered with Eureka as `NOTIFICATION-SERVICE` on port 6003.

## Testing

To verify the connection:

1. **Check if service is running:**

   ```bash
   curl http://localhost:6003/actuator/health
   ```

2. **Test WebSocket connection:**

   - Open browser DevTools → Network tab → WS filter
   - Look for connection to `ws://localhost:6003/ws`
   - Should see "101 Switching Protocols" response

3. **Check console logs:**
   ```
   NotificationWebSocket: Connected successfully
   NotificationWebSocket Debug: Connected to ws://localhost:6003/ws
   ```

## Quick Verification Checklist

- [x] Backend running on port 6003
- [x] Frontend WebSocket URL updated to 6003
- [x] Documentation updated to reflect port 6003
- [x] No compilation errors
- [x] All files verified

## Next Steps

1. **Restart the frontend** (if running):

   ```bash
   npm start
   ```

2. **Test the connection:**

   - Login to the application
   - Check for 🟢 (green dot) in notifications panel
   - Send a friend request to test real-time notifications

3. **Monitor logs:**
   - Frontend: Browser console
   - Backend: Notification-Service logs

## Troubleshooting

If connection still fails:

1. **Verify port 6003 is not in use:**

   ```bash
   netstat -ano | findstr :6003
   ```

2. **Check CORS configuration** in Notification-Service:

   ```java
   @Configuration
   public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
       @Override
       public void registerStompEndpoints(StompEndpointRegistry registry) {
           registry.addEndpoint("/ws")
               .setAllowedOrigins("http://localhost:3000")  // Frontend URL
               .withSockJS();
       }
   }
   ```

3. **Verify JWT token** is valid:
   ```javascript
   console.log(localStorage.getItem("jwt"));
   ```

---

**Status:** ✅ All port references updated successfully to 6003
