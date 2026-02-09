# Notification Settings - Quick Reference Guide

## 🚀 Quick Start

### For Developers

**Backend Location:** `Notification-Service/src/main/java/com/jaya/`
**Frontend Location:** `Expense Tracking System FrontEnd/social-media-master/src/`

---

## 📁 File Locations

### Backend Files

```
Notification-Service/
├── src/main/java/com/jaya/
│   ├── modal/
│   │   └── NotificationPreferences.java         (Entity - 220 lines)
│   ├── repository/
│   │   └── NotificationPreferencesRepository.java (Interface - 30 lines)
│   ├── dto/
│   │   ├── NotificationPreferencesResponseDTO.java (Response - 75 lines)
│   │   └── UpdateNotificationPreferencesRequest.java (Request - 70 lines)
│   ├── service/
│   │   ├── NotificationPreferencesService.java  (Interface - 60 lines)
│   │   └── impl/
│   │       └── NotificationPreferencesServiceImpl.java (Impl - 320 lines)
│   └── controller/
│       └── NotificationPreferencesController.java (REST API - 120 lines)
└── Documentation/
    ├── NOTIFICATION_PREFERENCES_API_DOCUMENTATION.md
    ├── BACKEND_IMPLEMENTATION_SUMMARY.md
    └── FRONTEND_BACKEND_INTEGRATION_GUIDE.md
```

### Frontend Files

```
src/
├── config/
│   └── notificationConfig.js                    (Configuration - 280 lines)
├── hooks/
│   └── useNotificationSettings.js               (Hook - 180 lines)
├── pages/Landingpage/
│   ├── NotificationSettings.jsx                 (Main Page - 250 lines)
│   └── Settings/
│       ├── NotificationServiceCard.jsx          (Service Card - 150 lines)
│       ├── NotificationItem.jsx                 (Item - 200 lines)
│       ├── SettingsHeader.jsx                   (Header - 100 lines)
│       └── SettingItem.jsx                      (Item - 120 lines)
└── Documentation/
    └── NOTIFICATION_SETTINGS_DOCUMENTATION.md
```

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:8080/api/notification-preferences
```

### Endpoints

| Method | Path                                    | Description        |
| ------ | --------------------------------------- | ------------------ |
| GET    | `/api/notification-preferences`         | Get preferences    |
| PUT    | `/api/notification-preferences`         | Update preferences |
| POST   | `/api/notification-preferences/reset`   | Reset to defaults  |
| DELETE | `/api/notification-preferences`         | Delete preferences |
| GET    | `/api/notification-preferences/exists`  | Check existence    |
| POST   | `/api/notification-preferences/default` | Create defaults    |

---

## 💻 Code Snippets

### Backend: Get Preferences

```java
// In Controller
@GetMapping
public ResponseEntity<NotificationPreferencesResponseDTO> getPreferences(
        @RequestHeader("X-User-Id") Integer userId) {
    NotificationPreferencesResponseDTO preferences = service.getPreferences(userId);
    return ResponseEntity.ok(preferences);
}
```

### Backend: Update Preferences

```java
// In Controller
@PutMapping
public ResponseEntity<NotificationPreferencesResponseDTO> updatePreferences(
        @RequestHeader("X-User-Id") Integer userId,
        @RequestBody UpdateNotificationPreferencesRequest request) {
    NotificationPreferencesResponseDTO updated = service.updatePreferences(userId, request);
    return ResponseEntity.ok(updated);
}
```

### Frontend: Fetch Preferences (Redux Action)

```javascript
export const fetchNotificationPreferences =
  () => async (dispatch, getState) => {
    try {
      dispatch({ type: FETCH_PREFERENCES_REQUEST });
      const { auth } = getState();
      const preferences = await getNotificationPreferences(
        auth.user.id,
        auth.token
      );
      dispatch({ type: FETCH_PREFERENCES_SUCCESS, payload: preferences });
      return preferences;
    } catch (error) {
      dispatch({ type: FETCH_PREFERENCES_FAILURE, payload: error.message });
      throw error;
    }
  };
```

### Frontend: Update Preference (Redux Action)

```javascript
export const updatePreference = (updates) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_PREFERENCE_REQUEST });
    const { auth } = getState();
    const updated = await updateNotificationPreferences(
      auth.user.id,
      auth.token,
      updates
    );
    dispatch({ type: UPDATE_PREFERENCE_SUCCESS, payload: updated });
    return updated;
  } catch (error) {
    dispatch({ type: UPDATE_PREFERENCE_FAILURE, payload: error.message });
    throw error;
  }
};
```

---

## 🧪 Testing Commands

### cURL Examples

**Get Preferences:**

```bash
curl -X GET "http://localhost:8080/api/notification-preferences" \
  -H "X-User-Id: 1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Master Toggle:**

```bash
curl -X PUT "http://localhost:8080/api/notification-preferences" \
  -H "X-User-Id: 1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"masterEnabled": false}'
```

**Reset to Defaults:**

```bash
curl -X POST "http://localhost:8080/api/notification-preferences/reset" \
  -H "X-User-Id: 1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🗄️ Database

### Table Name

```
notification_preferences
```

### Key Columns

- `id` - Primary key (SERIAL)
- `user_id` - User reference (INTEGER, UNIQUE, NOT NULL)
- 40+ preference columns (BOOLEAN)
- `notification_preferences_json` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

### Migration Script Location

```
Notification-Service/src/main/resources/db/migration/
V2__add_notification_preferences_fields.sql
```

---

## 🎨 Frontend Configuration

### Add New Notification Type

**1. Backend Entity:**

```java
@Column(name = "new_notification_enabled")
private Boolean newNotificationEnabled;
```

**2. Backend Service (Defaults):**

```java
.newNotificationEnabled(true)
```

**3. Frontend Config:**

```javascript
// In notificationConfig.js
{
  id: 'newNotification',
  type: 'NEW_NOTIFICATION',
  title: 'New Notification',
  description: 'Description here',
  icon: 'NotificationImportant',
  priority: 'medium',
  defaultEnabled: true,
  methods: ['inApp', 'email']
}
```

---

## ⚙️ Environment Setup

### Backend (.env or application.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/expense_db
    username: your_username
    password: your_password
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:8080
```

---

## 🔧 Common Tasks

### Start Backend Service

```bash
cd Notification-Service
mvn spring-boot:run
```

### Start Frontend

```bash
cd "Expense Tracking System FrontEnd/social-media-master"
npm start
```

### Build Backend

```bash
cd Notification-Service
mvn clean package
```

### Build Frontend

```bash
cd "Expense Tracking System FrontEnd/social-media-master"
npm run build
```

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check if port 8080 is available
netstat -ano | findstr :8080

# Check database connection
psql -U your_username -d expense_db -c "SELECT 1;"
```

### Frontend Not Connecting

```bash
# Check .env file
cat .env

# Check API URL in browser console
console.log(process.env.REACT_APP_API_URL)
```

### CORS Issues

Add to backend `application.yml`:

```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3000"
      allowed-methods: "*"
```

---

## 📊 Monitoring

### Check Logs

**Backend:**

```bash
tail -f logs/notification-service.log
```

**Frontend:**
Open browser console (F12) → Console tab

---

## 🚦 Status Indicators

### Backend Health Check

```bash
curl http://localhost:8080/actuator/health
```

### Database Connection

```bash
psql -U postgres -c "SELECT COUNT(*) FROM notification_preferences;"
```

---

## 📝 Documentation Quick Links

| Document          | Purpose                      | Location                                        |
| ----------------- | ---------------------------- | ----------------------------------------------- |
| API Documentation | Complete API reference       | `NOTIFICATION_PREFERENCES_API_DOCUMENTATION.md` |
| Backend Summary   | Backend architecture         | `BACKEND_IMPLEMENTATION_SUMMARY.md`             |
| Integration Guide | Frontend-Backend integration | `FRONTEND_BACKEND_INTEGRATION_GUIDE.md`         |
| Frontend Docs     | Component documentation      | `NOTIFICATION_SETTINGS_DOCUMENTATION.md`        |
| Complete Summary  | Overall project summary      | `NOTIFICATION_SETTINGS_COMPLETE_SUMMARY.md`     |

---

## 🎯 Key Features

### Multi-Level Control

- ✅ Master toggle (all notifications)
- ✅ Service-level toggles (7 services)
- ✅ Individual notification toggles (25+ types)

### Advanced Settings

- ✅ Do Not Disturb mode
- ✅ Notification sound
- ✅ Browser notifications
- ✅ Delivery methods (In-App, Email, Push, SMS)
- ✅ Frequency settings (Instant, Hourly, Daily, Weekly)
- ✅ Quiet hours

### Services Covered

1. **Expense Service** (4 notification types)
2. **Budget Service** (5 notification types)
3. **Bill Service** (3 notification types)
4. **Payment Method Service** (3 notification types)
5. **Friend Service** (3 notification types)
6. **Analytics Service** (3 notification types)
7. **System Notifications** (3 notification types)

---

## 🔐 Security Notes

- JWT authentication required for all endpoints
- User-specific data isolation via `user_id`
- CORS configured for allowed origins only
- SQL injection prevention via JPA
- Input validation on all endpoints

---

## 📈 Performance

- Database indexed on `user_id`
- Partial updates reduce payload
- Optimistic UI updates
- Auto-caching in Redux

---

## ✅ Checklist for Deployment

### Pre-Deployment

- [ ] All tests passing
- [ ] Database migration script ready
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] API Gateway routing configured (if applicable)

### Deployment

- [ ] Deploy backend service
- [ ] Run database migration
- [ ] Deploy frontend
- [ ] Verify health endpoints
- [ ] Test all API endpoints

### Post-Deployment

- [ ] Monitor logs for errors
- [ ] Check performance metrics
- [ ] Verify user preferences are saving
- [ ] Test notification delivery

---

## 🆘 Support

### Get Help

1. Check documentation files (listed above)
2. Review code comments (comprehensive JavaDoc)
3. Check logs for error messages
4. Test API endpoints with Postman
5. Contact development team

### Report Issues

Include:

- Error message
- Steps to reproduce
- Expected vs actual behavior
- Environment (dev/staging/prod)
- User ID (if applicable)

---

## 📦 Package Structure

### Backend Packages

```
com.jaya
├── modal          (Entities)
├── repository     (Data access)
├── dto            (Data transfer objects)
├── service        (Business logic)
│   └── impl       (Implementations)
└── controller     (REST endpoints)
```

### Frontend Structure

```
src
├── config         (Configuration)
├── hooks          (Custom hooks)
├── pages          (Page components)
│   └── Settings   (Settings components)
├── Redux          (State management)
└── services       (API services)
```

---

## 🎓 Learning Resources

- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **React Docs:** https://react.dev/
- **Redux Docs:** https://redux.js.org/
- **Material-UI:** https://mui.com/
- **Lombok:** https://projectlombok.org/

---

**Last Updated:** Current session  
**Version:** 1.0.0  
**Status:** ✅ Backend Complete, ⏳ Integration Pending
