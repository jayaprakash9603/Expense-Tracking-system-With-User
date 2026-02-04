# Google OAuth Integration Setup Guide

This document explains how to set up Google OAuth for the Expense Tracking System.

## Prerequisites

1. A Google Cloud Platform account
2. A project in Google Cloud Console

## Setup Steps

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. If prompted, configure the OAuth consent screen:
   - Choose "External" for user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: `Expense Tracker Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - Your production domain (e.g., `https://your-domain.com`)
   - Authorized redirect URIs: (not needed for frontend-only flow)
7. Copy the **Client ID**

### 2. Backend Configuration

Set the Google Client ID as an environment variable:

```bash
# Linux/Mac
export GOOGLE_OAUTH_CLIENT_ID=your-client-id-here

# Windows PowerShell
$env:GOOGLE_OAUTH_CLIENT_ID="your-client-id-here"

# Or add to application.yaml directly (not recommended for production)
```

Or update `user-service/src/main/resources/application.yaml`:

```yaml
google:
  oauth2:
    client-id: your-client-id-here
```

### 3. Frontend Configuration

Create a `.env` file in the frontend directory:

```bash
cd "Expense Tracking System FrontEnd/social-media-master"
cp .env.example .env
```

Edit `.env`:

```
REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here
```

### 4. Database Migration

The User entity has been updated with new OAuth fields. On next startup with `ddl-auto: update`, these columns will be added automatically:

- `auth_provider` - Values: "LOCAL" or "GOOGLE"
- `provider_id` - Google's unique user ID (sub claim)
- `oauth_profile_image` - Profile picture from Google

### 5. Testing the Integration

1. Start the backend services:

   ```bash
   cd Expense-tracking-System-backend/Expense-tracking-backend-main
   ./start-all-services.ps1
   ```

2. Start the frontend:

   ```bash
   cd "Expense Tracking System FrontEnd/social-media-master"
   npm start
   ```

3. Navigate to `http://localhost:3000/login` or `/register`
4. Click "Sign in with Google" or "Sign up with Google"
5. Complete the Google authentication flow

## Architecture

### Authentication Flow

```
┌──────────────┐    1. Click "Sign in with Google"    ┌──────────────┐
│   Frontend   │ ───────────────────────────────────▶ │   Google     │
│   (React)    │                                      │   OAuth      │
└──────────────┘                                      └──────────────┘
       │                                                     │
       │                        2. User authenticates        │
       │                                                     │
       │              3. Return ID Token (credential)        │
       │◀────────────────────────────────────────────────────┘
       │
       │  4. POST /auth/oauth2/google
       │     { credential: "eyJ..." }
       ▼
┌──────────────┐    5. Verify token with Google    ┌──────────────┐
│   Backend    │ ─────────────────────────────────▶│   Google     │
│ (user-service│                                   │   API        │
└──────────────┘                                   └──────────────┘
       │
       │  6. Find or create user
       │  7. Generate JWT
       │
       ▼
┌──────────────┐
│   Return     │
│   JWT Token  │
└──────────────┘
```

### Key Components

**Backend:**

- `OAuth2Controller` - Handles `/auth/oauth2/google` endpoint
- `OAuth2Service` - Verifies Google tokens, manages user creation/linking
- `GoogleUserInfo` - DTO for Google user data
- `GoogleAuthRequest` - Request DTO for credential

**Frontend:**

- `GoogleLoginButton` - Reusable Google sign-in button component
- `googleLoginAction` - Redux action for Google authentication
- `googleOAuth.js` - Configuration for Google Client ID

## Account Linking Behavior

| Scenario                                 | Behavior                                                        |
| ---------------------------------------- | --------------------------------------------------------------- |
| New Google user                          | Creates new account with `authProvider=GOOGLE`                  |
| Existing LOCAL user signs in with Google | Links Google to existing account, updates `authProvider=GOOGLE` |
| Existing GOOGLE user signs in            | Authenticates normally                                          |

## Security Considerations

1. **Never commit Client IDs** to version control - use environment variables
2. **Token Verification** - All Google tokens are verified server-side using Google's official library
3. **Email Verification** - Only verified Google emails are accepted
4. **HTTPS Required** - In production, ensure all origins use HTTPS

## Troubleshooting

### "Invalid Google token" error

- Ensure the Client ID matches between frontend and backend
- Check that the authorized JavaScript origin includes your frontend URL
- Verify the token hasn't expired

### "Google Sign-In popup blocked"

- Ensure popups aren't blocked for localhost
- Try using a different browser

### User created but profile incomplete

- Check Google account privacy settings
- Ensure requested scopes include `email` and `profile`

## Testing Checklist

- [ ] New user can sign up with Google
- [ ] Existing user can sign in with Google
- [ ] LOCAL user can link Google account
- [ ] Profile picture is fetched from Google
- [ ] JWT token is valid after Google auth
- [ ] Navigation works correctly (USER → /dashboard, ADMIN → /admin/dashboard)
- [ ] Logout works for Google-authenticated users
- [ ] Error messages display correctly on auth failure
