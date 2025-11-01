# Quick Start: Testing Notification Display

## Prerequisites

- ✅ Backend services running (Eureka, Gateway, User-Service, Notification-Service)
- ✅ Frontend running (`npm start`)
- ✅ Valid JWT token for authentication

## Step 1: Get Your JWT Token

1. Login to the application
2. Open Browser DevTools (F12)
3. Go to Application → Local Storage
4. Find your JWT token (usually stored as `token` or similar)
5. Copy the token value

## Step 2: Test API Endpoint

Open PowerShell and run:

```powershell
$token = "YOUR_JWT_TOKEN_HERE"

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/notifications" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  }

$response | ConvertTo-Json -Depth 10
```

**Expected Result:** Array of notification objects (like the one you showed me)

## Step 3: Open Notification Panel in UI

1. Look for the notification bell icon in the HeaderBar (top-right)
2. Click the bell icon
3. Notification panel should slide open

**Expected UI:**

- Panel shows on the right side
- Header says "Notifications" with unread count badge
- Filter tabs: All, Unread, Friends, Expenses, Budgets
- Each notification shows:
  - Icon (based on type)
  - Title in bold
  - Message text
  - Relative time ("5m ago", "2h ago")
  - Blue background if unread
  - Delete button (trash icon)

## Step 4: Test User Actions

### Test 1: Mark as Read

1. Click on any unread notification (blue background)
2. **Expected:** Blue background disappears, unread count decreases

### Test 2: Delete Notification

1. Click the trash icon on any notification
2. **Expected:** Notification disappears from list

### Test 3: Mark All as Read

1. Click "Mark all as read" button at top
2. **Expected:** All blue backgrounds disappear, unread count becomes 0

### Test 4: Clear All

1. Click "Clear all" button at top
2. **Expected:** All notifications disappear, shows "No notifications" message

### Test 5: Filter Notifications

1. Click "Unread" tab
2. **Expected:** Only shows unread notifications
3. Click "All" tab
4. **Expected:** Shows all notifications again

### Test 6: Navigation

1. Click on a notification (e.g., "Payment Method Added")
2. **Expected:**
   - Panel closes
   - User navigated to relevant page (e.g., `/payment-methods`)

## Step 5: Test Real-time Updates

### Option A: Using Two Browser Windows

1. Open application in two browser windows (side by side)
2. Login to same account in both
3. In window 1: Perform an action that creates notification (add expense, send friend request, etc.)
4. In window 2: **Expected:** Notification appears automatically

### Option B: Using API Call

Open PowerShell and trigger a test notification:

```powershell
$token = "YOUR_JWT_TOKEN_HERE"

Invoke-RestMethod -Uri "http://localhost:8080/api/notifications" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body (@{
    message = "This is a test notification from PowerShell"
    alertType = "CUSTOM_ALERT"
  } | ConvertTo-Json)
```

**Expected:** Notification appears in UI within 1-2 seconds

## Step 6: Check WebSocket Connection

1. Open notification panel
2. Look for connection indicator (WiFi icon) next to "Notifications" title
3. **Green WiFi icon** = Connected ✅
4. **Red WiFi icon** = Disconnected ❌

**If Disconnected:**

- Check if Notification-Service is running
- Check browser console for WebSocket errors
- Verify STOMP endpoint is accessible

## Troubleshooting

### Issue: Panel Not Opening

**Solution:**

- Check browser console for JavaScript errors
- Verify NotificationsPanelRedux is imported in HeaderBar
- Check Redux store has notifications reducer

### Issue: No Notifications Showing

**Solution:**

1. Check API response:
   ```powershell
   # Run the API test from Step 2
   ```
2. Check Redux DevTools:
   - Install Redux DevTools extension
   - Open DevTools → Redux tab
   - Look at `state.notifications.notifications` array
3. Check if user has any notifications in database

### Issue: Icons Not Showing

**Solution:**

- Check `notificationUtils.js` has `getNotificationIcon` function
- Verify notification `type` is in `NOTIFICATION_TYPE_CONFIG`
- Check browser console for icon rendering errors

### Issue: Wrong Colors

**Solution:**

- Check notification `type` mapping in `NOTIFICATION_TYPE_CONFIG`
- Verify `category` field is correct (success/error/warning/info)
- Check `getNotificationColor` function

### Issue: Click Actions Not Working

**Solution:**

- Check Redux actions are dispatched (Redux DevTools)
- Verify API endpoints return success status
- Check authorization token is valid

## Expected Notification Types

Based on your API response, you should see:

### Payment Method Notifications

- **Type:** `PAYMENT_METHOD_ADDED`
- **Icon:** 💰 (Money icon)
- **Color:** Green (Success)
- **Title:** "Payment Method Added"
- **Message:** "New payment method 'X' has been added for expense/income"
- **Action:** Clicking navigates to `/payment-methods`

### Friend Request Notifications

- **Type:** `FRIEND_REQUEST_RECEIVED` / `FRIEND_REQUEST_ACCEPTED`
- **Icon:** 👤 (Person icon)
- **Color:** Blue (Info) / Green (Success)
- **Action:** Clicking navigates to `/friends`

### Budget Notifications

- **Type:** `BUDGET_EXCEEDED` / `BUDGET_WARNING`
- **Icon:** ⚠️ (Warning icon)
- **Color:** Red (Error) / Yellow (Warning)
- **Action:** Clicking navigates to `/budgets`

## Success Criteria

✅ **All notifications display correctly**
✅ **Icons match notification types**
✅ **Colors are appropriate for categories**
✅ **Unread count is accurate**
✅ **Click actions work (read, delete, navigate)**
✅ **Filters work properly**
✅ **Real-time updates appear**
✅ **WebSocket shows connected status**

## Next Actions

Once basic testing is complete:

1. **Load Test:**

   - Create many notifications (50+)
   - Verify scrolling works
   - Check performance

2. **Edge Cases:**

   - Test with no notifications
   - Test with all notifications read
   - Test with very long messages

3. **Browser Compatibility:**

   - Test in Chrome
   - Test in Firefox
   - Test in Edge

4. **Mobile Responsiveness:**
   - Test on mobile viewport
   - Check panel width adjusts
   - Verify touch interactions work

## Support

If you encounter issues:

1. **Check Backend Logs:**

   ```
   Notification-Service logs (port 6003)
   User-Service logs (port 6001)
   Gateway logs (port 8080)
   ```

2. **Check Frontend Console:**

   - F12 → Console tab
   - Look for Redux action logs
   - Check for API errors

3. **Check Redux State:**

   - Redux DevTools
   - Inspect `state.notifications`
   - Verify actions are dispatched

4. **Check Network:**
   - F12 → Network tab
   - Filter by "notifications"
   - Check request/response details

---

## Quick Commands

### Start Backend Services

```powershell
# In Eureka directory
mvnw spring-boot:run

# In Gateway directory
mvnw spring-boot:run

# In User-Service directory
mvnw spring-boot:run

# In Notification-Service directory
mvnw spring-boot:run
```

### Start Frontend

```powershell
cd "Expense Tracking System FrontEnd\social-media-master"
npm start
```

### Test API

```powershell
curl --location 'http://localhost:8080/api/notifications' `
--header "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

Happy Testing! 🎉
