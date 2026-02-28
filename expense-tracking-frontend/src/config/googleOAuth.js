/**
 * Google OAuth Configuration
 *
 * To set up Google OAuth:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project or select existing one
 * 3. Navigate to "APIs & Services" > "Credentials"
 * 4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
 * 5. Select "Web application"
 * 6. Add authorized JavaScript origins:
 *    - http://localhost:3000 (development)
 *    - Your production domain
 * 7. Copy the Client ID and paste it below
 *
 * IMPORTANT: Never commit the actual Client ID to version control.
 * Use environment variables in production.
 */

// Google OAuth Client ID
// Replace with your actual Google OAuth Client ID from Google Cloud Console
// For production, use: process.env.REACT_APP_GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "214438901958-uigakv87vusc9veirq3l5ocfpfr1do3a.apps.googleusercontent.com";

// OAuth Configuration
export const GOOGLE_OAUTH_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  // Scopes requested from Google
  scope: "email profile",
  // Auto select the account if only one is logged in
  auto_select: false,
  // Cancel on tap outside
  cancel_on_tap_outside: true,
};
