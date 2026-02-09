import React, { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * OAuth Callback Page
 * This page handles the redirect from Google OAuth.
 * It extracts the access token from the URL hash and sends it to the parent window.
 */
const OAuthCallback = () => {
  useEffect(() => {
    // Parse the URL hash to get the access token
    // Google returns: #access_token=xxx&token_type=Bearer&expires_in=3599&scope=...
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    console.log("OAuth callback received");
    console.log("Access token present:", !!accessToken);
    console.log("Error:", error);

    if (accessToken) {
      // Send token to parent window (the opener)
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "GOOGLE_OAUTH_SUCCESS",
            accessToken: accessToken,
          },
          window.location.origin,
        );

        // Close this popup after a short delay
        setTimeout(() => {
          window.close();
        }, 500);
      } else {
        // If opened directly (not as popup), redirect to login with token
        // Store token temporarily and redirect
        sessionStorage.setItem("google_oauth_token", accessToken);
        window.location.href = "/login?oauth=google";
      }
    } else if (error) {
      // Handle error
      const errorMsg = errorDescription || error || "Authentication failed";
      console.error("OAuth error:", errorMsg);

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "GOOGLE_OAUTH_ERROR",
            error: errorMsg,
          },
          window.location.origin,
        );

        setTimeout(() => {
          window.close();
        }, 500);
      } else {
        window.location.href = `/login?error=${encodeURIComponent(errorMsg)}`;
      }
    } else {
      // No token and no error - might be initial load or invalid state
      console.log("No token or error found in URL hash");
    }
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        gap: 2,
      }}
    >
      <CircularProgress size={48} sx={{ color: "#4285F4" }} />
      <Typography variant="h6" color="textSecondary">
        Completing sign in...
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Please wait while we complete your Google sign-in.
      </Typography>
    </Box>
  );
};

export default OAuthCallback;
