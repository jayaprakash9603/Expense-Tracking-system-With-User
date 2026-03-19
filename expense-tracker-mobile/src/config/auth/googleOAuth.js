export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "214438901958-uigakv87vusc9veirq3l5ocfpfr1do3a.apps.googleusercontent.com";

export const GOOGLE_OAUTH_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  scope: "email profile",
  auto_select: false,
  cancel_on_tap_outside: true,
};
