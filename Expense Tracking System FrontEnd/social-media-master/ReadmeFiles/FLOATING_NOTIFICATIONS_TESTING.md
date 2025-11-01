# Floating Notifications - Testing Guide

## Quick Test Steps

### 1. Database Migration Test

```sql
-- Check if migration is ready
SELECT version, description, success
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 5;

-- After service restart, verify column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'notification_preferences'
  AND column_name = 'floating_notifications';
```

### 2. API Test - Get Preferences

```bash
# Replace <token> with actual JWT token
curl -X GET "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" | jq .
```

**Expected Response**:

```json
{
  "userId": 1,
  "masterEnabled": true,
  "doNotDisturb": false,
  "notificationSound": true,
  "browserNotifications": true,
  "floatingNotifications": true,
  ...
}
```

### 3. API Test - Update Floating Notifications

```bash
# Enable floating notifications
curl -X PUT "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"floatingNotifications": true}' | jq .

# Disable floating notifications
curl -X PUT "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"floatingNotifications": false}' | jq .
```

### 4. API Test - Reset to Defaults

```bash
curl -X POST "http://localhost:8080/api/notifications/preferences/reset" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" | jq .
```

**Expected**: `floatingNotifications` should be `true`

### 5. Frontend UI Test

#### Steps:

1. Start frontend: `npm start`
2. Login to application
3. Navigate to Settings → Notification Settings
4. Locate "Global Settings" section
5. Find "Floating Notifications" toggle (after Browser Notifications)
6. Toggle ON/OFF and verify:
   - API call is made (check Network tab)
   - Setting persists after page refresh
   - Master toggle disables this setting when OFF

### 6. Integration Test - Display Logic

#### Test Case 1: Floating Notifications Enabled

```javascript
// preferences.floatingNotifications = true
// Expected: Show floating popup when notification arrives
```

#### Test Case 2: Floating Notifications Disabled

```javascript
// preferences.floatingNotifications = false
// Expected: Add to notification center only, no popup
```

#### Test Case 3: Master Toggle OFF

```javascript
// preferences.masterEnabled = false
// Expected: No floating notifications regardless of floatingNotifications setting
```

## Manual Test Checklist

### Backend Tests

- [ ] Service starts without errors
- [ ] Database migration runs successfully
- [ ] GET preferences returns floatingNotifications field
- [ ] PUT preferences updates floatingNotifications
- [ ] POST reset sets floatingNotifications to true
- [ ] New users get floatingNotifications = true by default
- [ ] Existing users get floatingNotifications = true after migration

### Frontend Tests

- [ ] Floating Notifications toggle appears in Global Settings
- [ ] Toggle is positioned after Browser Notifications
- [ ] Toggle works (ON/OFF)
- [ ] API call is made on toggle change
- [ ] Setting persists after page refresh
- [ ] Master toggle disables this setting
- [ ] Visual feedback is correct (colors, animations)

### Integration Tests

- [ ] Floating popup shows when enabled
- [ ] Floating popup does NOT show when disabled
- [ ] Notifications still saved to database when disabled
- [ ] Master toggle overrides floating notifications setting
- [ ] Do Not Disturb mode respected (if implemented)

## Common Test Scenarios

### Scenario 1: New User

1. Create new user account
2. Get notification preferences
3. Verify floatingNotifications = true
4. Send test notification
5. Verify floating popup appears

### Scenario 2: Existing User

1. Login as existing user
2. Get notification preferences
3. Verify floatingNotifications = true (from migration)
4. Disable floating notifications
5. Send test notification
6. Verify NO floating popup, but notification in center

### Scenario 3: Reset to Defaults

1. Login as user
2. Disable floating notifications
3. Verify floatingNotifications = false
4. Click "Reset to Defaults" button
5. Verify floatingNotifications = true
6. Send test notification
7. Verify floating popup appears

### Scenario 4: Master Toggle Interaction

1. Enable all settings including floating notifications
2. Disable master toggle
3. Send test notification
4. Verify NO notifications appear (floating or otherwise)
5. Enable master toggle
6. Send test notification
7. Verify floating popup appears

## Performance Tests

### Database Query Performance

```sql
-- Should use index for faster queries
EXPLAIN ANALYZE
SELECT * FROM notification_preferences
WHERE floating_notifications = true;
```

### API Response Time

```bash
# Should respond within 200ms
time curl -X GET "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer <token>"
```

## Error Scenarios

### Test 1: Invalid Value

```bash
# Try to set invalid value
curl -X PUT "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"floatingNotifications": "invalid"}'
```

**Expected**: 400 Bad Request

### Test 2: Missing Authentication

```bash
# No auth token
curl -X GET "http://localhost:8080/api/notifications/preferences"
```

**Expected**: 401 Unauthorized

### Test 3: Non-existent User

```bash
# Invalid/expired token
curl -X GET "http://localhost:8080/api/notifications/preferences" \
  -H "Authorization: Bearer invalid_token"
```

**Expected**: 401 Unauthorized

## Rollback Testing

### If Rollback Needed:

```sql
-- Remove column (data will be lost)
ALTER TABLE notification_preferences
DROP COLUMN IF EXISTS floating_notifications;

-- Verify column removed
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'notification_preferences'
  AND column_name = 'floating_notifications';
```

## Test Data Setup

### Create Test User with Preferences

```sql
INSERT INTO notification_preferences (
  user_id,
  master_enabled,
  floating_notifications,
  notification_sound,
  browser_notifications,
  do_not_disturb
) VALUES (
  999,
  true,
  true,
  true,
  false,
  false
);
```

### Update Test User Preference

```sql
UPDATE notification_preferences
SET floating_notifications = false
WHERE user_id = 999;
```

### Verify Update

```sql
SELECT user_id, floating_notifications
FROM notification_preferences
WHERE user_id = 999;
```

## Success Criteria

All tests pass when:

- ✅ Database migration runs successfully
- ✅ API endpoints work correctly
- ✅ Frontend UI displays and functions properly
- ✅ Setting persists across sessions
- ✅ Master toggle interaction works
- ✅ Floating notifications respect the setting
- ✅ No console errors
- ✅ No backend errors in logs
- ✅ Performance is acceptable (<200ms response)

## Reporting Issues

If you find issues:

1. Note which test failed
2. Check browser console for errors
3. Check backend logs for stack traces
4. Verify database state
5. Note API request/response payloads
6. Document steps to reproduce
7. Report to development team with details

## Tools Needed

- **curl** or **Postman** for API testing
- **jq** for JSON formatting (optional)
- **psql** or **pgAdmin** for database queries
- **Browser DevTools** for frontend debugging
- **Postman/Insomnia** for API testing (alternative to curl)

## Next Steps After Testing

1. ✅ All tests pass → Ready for staging deployment
2. ❌ Tests fail → Review errors, fix issues, retest
3. ⚠️ Some tests fail → Document known issues, create tickets

---

**Test Date**: ****\_\_\_****  
**Tester Name**: ****\_\_\_****  
**Environment**: Development / Staging / Production  
**Result**: ✅ Pass / ❌ Fail / ⚠️ Partial
