# Frontend-Backend Integration Guide

## Notification Preferences System

This guide walks through integrating the frontend notification settings with the backend API.

---

## Overview

The notification preferences system is now fully implemented:

- ✅ **Frontend:** React components, Redux hooks, configuration
- ✅ **Backend:** REST API with full CRUD operations
- ⏳ **Integration:** Connect frontend to backend (this guide)

---

## Architecture Flow

```
User Action (Toggle Switch)
    ↓
React Component (NotificationSettings.jsx)
    ↓
Custom Hook (useNotificationSettings.js)
    ↓
Redux Action (to be created)
    ↓
API Service (to be created)
    ↓
Backend API (NotificationPreferencesController)
    ↓
Database (notification_preferences table)
```

---

## Step 1: Create API Service

### File: `src/services/notificationPreferencesApi.js`

```javascript
import axios from "axios";

// Base URL - adjust according to your environment
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const PREFERENCES_URL = `${BASE_URL}/api/notification-preferences`;

/**
 * Get user's notification preferences
 * Auto-creates defaults if none exist
 */
export const getNotificationPreferences = async (userId, token) => {
  try {
    const response = await axios.get(PREFERENCES_URL, {
      headers: {
        "X-User-Id": userId,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw error;
  }
};

/**
 * Update notification preferences (partial update)
 * Only sends fields that need to be updated
 */
export const updateNotificationPreferences = async (userId, token, updates) => {
  try {
    const response = await axios.put(PREFERENCES_URL, updates, {
      headers: {
        "X-User-Id": userId,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw error;
  }
};

/**
 * Reset preferences to default values
 */
export const resetNotificationPreferences = async (userId, token) => {
  try {
    const response = await axios.post(`${PREFERENCES_URL}/reset`, null, {
      headers: {
        "X-User-Id": userId,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting notification preferences:", error);
    throw error;
  }
};

/**
 * Delete notification preferences
 */
export const deleteNotificationPreferences = async (userId, token) => {
  try {
    await axios.delete(PREFERENCES_URL, {
      headers: {
        "X-User-Id": userId,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error deleting notification preferences:", error);
    throw error;
  }
};

/**
 * Check if preferences exist
 */
export const checkPreferencesExist = async (userId, token) => {
  try {
    const response = await axios.get(`${PREFERENCES_URL}/exists`, {
      headers: {
        "X-User-Id": userId,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking preferences existence:", error);
    throw error;
  }
};
```

---

## Step 2: Create Redux Actions

### File: `src/Redux/notificationPreferencesActions.js`

```javascript
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
} from "../services/notificationPreferencesApi";

// Action Types
export const FETCH_PREFERENCES_REQUEST = "FETCH_PREFERENCES_REQUEST";
export const FETCH_PREFERENCES_SUCCESS = "FETCH_PREFERENCES_SUCCESS";
export const FETCH_PREFERENCES_FAILURE = "FETCH_PREFERENCES_FAILURE";

export const UPDATE_PREFERENCE_REQUEST = "UPDATE_PREFERENCE_REQUEST";
export const UPDATE_PREFERENCE_SUCCESS = "UPDATE_PREFERENCE_SUCCESS";
export const UPDATE_PREFERENCE_FAILURE = "UPDATE_PREFERENCE_FAILURE";

export const RESET_PREFERENCES_REQUEST = "RESET_PREFERENCES_REQUEST";
export const RESET_PREFERENCES_SUCCESS = "RESET_PREFERENCES_SUCCESS";
export const RESET_PREFERENCES_FAILURE = "RESET_PREFERENCES_FAILURE";

/**
 * Fetch notification preferences
 * Auto-creates defaults if none exist
 */
export const fetchNotificationPreferences =
  () => async (dispatch, getState) => {
    try {
      dispatch({ type: FETCH_PREFERENCES_REQUEST });

      const { auth } = getState();
      const userId = auth.user?.id;
      const token = auth.token || localStorage.getItem("token");

      if (!userId || !token) {
        throw new Error("User not authenticated");
      }

      const preferences = await getNotificationPreferences(userId, token);

      dispatch({
        type: FETCH_PREFERENCES_SUCCESS,
        payload: preferences,
      });

      return preferences;
    } catch (error) {
      dispatch({
        type: FETCH_PREFERENCES_FAILURE,
        payload: error.message,
      });
      throw error;
    }
  };

/**
 * Update notification preference (partial update)
 * Supports single field or multiple fields
 */
export const updatePreference = (updates) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_PREFERENCE_REQUEST });

    const { auth } = getState();
    const userId = auth.user?.id;
    const token = auth.token || localStorage.getItem("token");

    if (!userId || !token) {
      throw new Error("User not authenticated");
    }

    const updatedPreferences = await updateNotificationPreferences(
      userId,
      token,
      updates
    );

    dispatch({
      type: UPDATE_PREFERENCE_SUCCESS,
      payload: updatedPreferences,
    });

    return updatedPreferences;
  } catch (error) {
    dispatch({
      type: UPDATE_PREFERENCE_FAILURE,
      payload: error.message,
    });
    throw error;
  }
};

/**
 * Reset all preferences to defaults
 */
export const resetPreferences = () => async (dispatch, getState) => {
  try {
    dispatch({ type: RESET_PREFERENCES_REQUEST });

    const { auth } = getState();
    const userId = auth.user?.id;
    const token = auth.token || localStorage.getItem("token");

    if (!userId || !token) {
      throw new Error("User not authenticated");
    }

    const defaultPreferences = await resetNotificationPreferences(
      userId,
      token
    );

    dispatch({
      type: RESET_PREFERENCES_SUCCESS,
      payload: defaultPreferences,
    });

    return defaultPreferences;
  } catch (error) {
    dispatch({
      type: RESET_PREFERENCES_FAILURE,
      payload: error.message,
    });
    throw error;
  }
};
```

---

## Step 3: Create Redux Reducer

### File: `src/Redux/notificationPreferencesReducer.js`

```javascript
import {
  FETCH_PREFERENCES_REQUEST,
  FETCH_PREFERENCES_SUCCESS,
  FETCH_PREFERENCES_FAILURE,
  UPDATE_PREFERENCE_REQUEST,
  UPDATE_PREFERENCE_SUCCESS,
  UPDATE_PREFERENCE_FAILURE,
  RESET_PREFERENCES_REQUEST,
  RESET_PREFERENCES_SUCCESS,
  RESET_PREFERENCES_FAILURE,
} from "./notificationPreferencesActions";

const initialState = {
  preferences: null,
  loading: false,
  error: null,
  updating: false,
};

const notificationPreferencesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PREFERENCES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_PREFERENCES_SUCCESS:
      return {
        ...state,
        preferences: action.payload,
        loading: false,
        error: null,
      };

    case FETCH_PREFERENCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_PREFERENCE_REQUEST:
      return {
        ...state,
        updating: true,
        error: null,
      };

    case UPDATE_PREFERENCE_SUCCESS:
      return {
        ...state,
        preferences: action.payload,
        updating: false,
        error: null,
      };

    case UPDATE_PREFERENCE_FAILURE:
      return {
        ...state,
        updating: false,
        error: action.payload,
      };

    case RESET_PREFERENCES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case RESET_PREFERENCES_SUCCESS:
      return {
        ...state,
        preferences: action.payload,
        loading: false,
        error: null,
      };

    case RESET_PREFERENCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default notificationPreferencesReducer;
```

---

## Step 4: Register Reducer in Store

### File: `src/Redux/store.js` (or wherever your store is configured)

```javascript
import { configureStore } from "@reduxjs/toolkit";
import notificationPreferencesReducer from "./notificationPreferencesReducer";
// ... other imports

const store = configureStore({
  reducer: {
    // ... other reducers
    notificationPreferences: notificationPreferencesReducer,
    // ... other reducers
  },
  // ... other configuration
});

export default store;
```

---

## Step 5: Update useNotificationSettings Hook

### File: `src/hooks/useNotificationSettings.js`

Replace the mock implementation with Redux integration:

```javascript
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotificationPreferences,
  updatePreference,
  resetPreferences,
} from "../Redux/notificationPreferencesActions";
import { useSnackbar } from "./useSnackbar";
import {
  NOTIFICATION_SERVICES,
  GLOBAL_NOTIFICATION_SETTINGS,
} from "../config/notificationConfig";

export const useNotificationSettings = () => {
  const dispatch = useDispatch();
  const { showSnackbar } = useSnackbar();

  // Get preferences from Redux store
  const { preferences, loading, error, updating } = useSelector(
    (state) => state.notificationPreferences
  );

  const [localPreferences, setLocalPreferences] = useState(null);

  // Fetch preferences on mount
  useEffect(() => {
    if (!preferences) {
      dispatch(fetchNotificationPreferences()).catch((err) => {
        showSnackbar("Failed to load notification preferences", "error");
      });
    }
  }, [dispatch, preferences, showSnackbar]);

  // Sync local state with Redux
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  /**
   * Update master toggle
   */
  const updateMasterToggle = useCallback(
    async (enabled) => {
      try {
        // Optimistic update
        setLocalPreferences((prev) => ({ ...prev, masterEnabled: enabled }));

        await dispatch(updatePreference({ masterEnabled: enabled }));
        showSnackbar(
          enabled ? "Notifications enabled" : "Notifications disabled",
          "success"
        );
      } catch (error) {
        // Rollback on error
        setLocalPreferences(preferences);
        showSnackbar("Failed to update master toggle", "error");
      }
    },
    [dispatch, preferences, showSnackbar]
  );

  /**
   * Update global setting
   */
  const updateGlobalSetting = useCallback(
    async (key, value) => {
      try {
        // Optimistic update
        setLocalPreferences((prev) => ({ ...prev, [key]: value }));

        await dispatch(updatePreference({ [key]: value }));
        showSnackbar("Setting updated successfully", "success");
      } catch (error) {
        // Rollback on error
        setLocalPreferences(preferences);
        showSnackbar("Failed to update setting", "error");
      }
    },
    [dispatch, preferences, showSnackbar]
  );

  /**
   * Update service toggle
   */
  const updateServiceToggle = useCallback(
    async (serviceId, enabled) => {
      try {
        const key = `${serviceId}ServiceEnabled`;

        // Optimistic update
        setLocalPreferences((prev) => ({ ...prev, [key]: enabled }));

        await dispatch(updatePreference({ [key]: enabled }));
        showSnackbar(
          `${serviceId} notifications ${enabled ? "enabled" : "disabled"}`,
          "success"
        );
      } catch (error) {
        // Rollback on error
        setLocalPreferences(preferences);
        showSnackbar("Failed to update service toggle", "error");
      }
    },
    [dispatch, preferences, showSnackbar]
  );

  /**
   * Update notification toggle
   */
  const updateNotificationToggle = useCallback(
    async (notificationId, enabled) => {
      try {
        const key = `${notificationId}Enabled`;

        // Optimistic update
        setLocalPreferences((prev) => ({ ...prev, [key]: enabled }));

        await dispatch(updatePreference({ [key]: enabled }));
        showSnackbar("Notification preference updated", "success");
      } catch (error) {
        // Rollback on error
        setLocalPreferences(preferences);
        showSnackbar("Failed to update notification", "error");
      }
    },
    [dispatch, preferences, showSnackbar]
  );

  /**
   * Reset to defaults
   */
  const handleResetToDefaults = useCallback(async () => {
    try {
      await dispatch(resetPreferences());
      showSnackbar("Preferences reset to defaults", "success");
    } catch (error) {
      showSnackbar("Failed to reset preferences", "error");
    }
  }, [dispatch, showSnackbar]);

  return {
    preferences: localPreferences,
    loading,
    updating,
    error,
    updateMasterToggle,
    updateGlobalSetting,
    updateServiceToggle,
    updateNotificationToggle,
    resetToDefaults: handleResetToDefaults,
  };
};
```

---

## Step 6: Environment Configuration

### File: `.env` (create if doesn't exist)

```env
# Development
REACT_APP_API_URL=http://localhost:8080

# Production (example)
# REACT_APP_API_URL=https://api.yourapp.com
```

---

## Step 7: Test Integration

### Testing Checklist

1. **Load Preferences**

   - Open notification settings page
   - Should auto-fetch preferences
   - Should display loading state

2. **Toggle Master Switch**

   - Click master toggle
   - Should update UI immediately (optimistic)
   - Should persist to backend
   - Should show success toast

3. **Toggle Service**

   - Toggle any service switch
   - Should update UI
   - Should persist to backend
   - Should show success message

4. **Toggle Individual Notification**

   - Toggle specific notification
   - Should update UI
   - Should persist to backend

5. **Reset to Defaults**

   - Click reset button
   - Confirm dialog
   - Should reset all settings
   - Should show success message

6. **Error Handling**
   - Disconnect backend
   - Try toggling switch
   - Should show error message
   - Should rollback UI changes

---

## Step 8: Backend Configuration

### Update CORS Configuration (if needed)

If you encounter CORS errors, update the backend configuration:

**File:** `application.properties` or `application.yml`

```yaml
# application.yml
spring:
  # CORS configuration
  web:
    cors:
      allowed-origins:
        - http://localhost:3000
        - http://localhost:3001
      allowed-methods:
        - GET
        - POST
        - PUT
        - DELETE
        - OPTIONS
      allowed-headers: "*"
      allow-credentials: true
```

Or create a CORS configuration class:

```java
@Configuration
public class CorsConfiguration {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:3000", "http://localhost:3001")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

---

## Step 9: API Gateway Configuration (if using)

If your backend uses an API Gateway, ensure routing is configured:

**File:** `Gateway/application.yml`

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: notification-preferences
          uri: lb://NOTIFICATION-SERVICE
          predicates:
            - Path=/api/notification-preferences/**
          filters:
            - RewritePath=/api/notification-preferences/(?<segment>.*), /api/notification-preferences/$\{segment}
```

---

## Step 10: Database Migration

### Create Migration Script

**File:** `Notification-Service/src/main/resources/db/migration/V2__add_notification_preferences_fields.sql`

```sql
-- Add new columns to notification_preferences table
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS master_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS do_not_disturb BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sound BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS browser_notifications BOOLEAN DEFAULT TRUE,

-- Service level toggles
ADD COLUMN IF NOT EXISTS expense_service_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS budget_service_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS bill_service_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS payment_method_service_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS friend_service_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS analytics_service_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS system_notifications_enabled BOOLEAN DEFAULT TRUE,

-- Expense notifications
ADD COLUMN IF NOT EXISTS expense_added_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS expense_updated_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS expense_deleted_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS large_expense_alert_enabled BOOLEAN DEFAULT TRUE,

-- Budget notifications
ADD COLUMN IF NOT EXISTS budget_exceeded_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS budget_warning_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS budget_limit_approaching_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS budget_created_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS budget_updated_enabled BOOLEAN DEFAULT FALSE,

-- Bill notifications
ADD COLUMN IF NOT EXISTS bill_due_reminder_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS bill_overdue_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS bill_paid_enabled BOOLEAN DEFAULT TRUE,

-- Payment method notifications
ADD COLUMN IF NOT EXISTS payment_method_added_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_method_updated_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_method_removed_enabled BOOLEAN DEFAULT TRUE,

-- Friend notifications
ADD COLUMN IF NOT EXISTS friend_request_received_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS friend_request_accepted_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS friend_request_rejected_enabled BOOLEAN DEFAULT FALSE,

-- Analytics notifications
ADD COLUMN IF NOT EXISTS weekly_summary_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS monthly_report_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS spending_trend_alert_enabled BOOLEAN DEFAULT TRUE,

-- System notifications
ADD COLUMN IF NOT EXISTS security_alert_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS app_update_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS maintenance_notice_enabled BOOLEAN DEFAULT TRUE,

-- JSON configuration
ADD COLUMN IF NOT EXISTS notification_preferences_json TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON notification_preferences(user_id);

-- Add unique constraint if not exists
ALTER TABLE notification_preferences
ADD CONSTRAINT unique_user_id UNIQUE (user_id);
```

---

## Troubleshooting

### Issue: "Network Error" or CORS Error

**Solution:**

- Check backend is running on correct port
- Verify CORS configuration in backend
- Check API URL in `.env` file
- Ensure API Gateway routing is correct

### Issue: "401 Unauthorized"

**Solution:**

- Verify JWT token is valid
- Check `X-User-Id` header is being sent
- Ensure authentication middleware is working

### Issue: Preferences Not Saving

**Solution:**

- Check browser console for errors
- Verify API calls are reaching backend
- Check backend logs for errors
- Ensure database connection is active

### Issue: UI Not Updating

**Solution:**

- Check Redux state in React DevTools
- Verify reducer is registered in store
- Check action dispatching
- Ensure optimistic updates are working

---

## Testing Commands

### Test Backend Endpoints

```bash
# Get preferences (should auto-create)
curl -X GET "http://localhost:8080/api/notification-preferences" \
  -H "X-User-Id: 1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update preference
curl -X PUT "http://localhost:8080/api/notification-preferences" \
  -H "X-User-Id: 1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"masterEnabled": false}'

# Reset to defaults
curl -X POST "http://localhost:8080/api/notification-preferences/reset" \
  -H "X-User-Id: 1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Next Steps

1. ✅ Create API service (`notificationPreferencesApi.js`)
2. ✅ Create Redux actions (`notificationPreferencesActions.js`)
3. ✅ Create Redux reducer (`notificationPreferencesReducer.js`)
4. ✅ Register reducer in store
5. ✅ Update `useNotificationSettings` hook
6. ⏳ Run database migration
7. ⏳ Test integration end-to-end
8. ⏳ Deploy to staging/production

---

## Summary

This integration connects the frontend notification settings UI with the backend REST API. Key features:

- ✅ Redux-based state management
- ✅ Optimistic UI updates with rollback
- ✅ Automatic preference creation
- ✅ Partial update support
- ✅ Error handling and user feedback
- ✅ CORS configuration
- ✅ Database migration script

**Status:** Ready for integration testing
