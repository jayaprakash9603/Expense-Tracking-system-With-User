import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, CircularProgress } from "@mui/material";
import { api, updateAuthHeader } from "../../config/api";
import {
  LOGIN_SUCCESS,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE,
} from "../../Redux/Auth/auth.actionType";
import { GOOGLE_CLIENT_ID } from "../../config/googleOAuth";

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * Google Sign-In/Sign-Up button component.
 * Uses manual OAuth 2.0 popup flow (doesn't rely on GSI client script).
 * This approach works even when Google's GSI script is blocked by network.
 */
const GoogleLoginButton = ({
  mode = "signin",
  onSuccess,
  onError,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Handle the OAuth callback
  const handleOAuthCallback = useCallback(
    async (accessToken) => {
      setIsLoading(true);
      console.log("Processing Google OAuth callback...");

      try {
        // Get user info from Google using access token
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (!userInfoResponse.ok) {
          throw new Error("Failed to get user info from Google");
        }

        const userInfo = await userInfoResponse.json();
        console.log("Google user info received:", userInfo.email);

        // Send to our backend for authentication
        const response = await api.post(
          "/auth/oauth2/google",
          {
            credential: accessToken,
            email: userInfo.email,
            name: userInfo.name,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
            picture: userInfo.picture,
            sub: userInfo.sub,
          },
          { skipAuth: true },
        );

        if (response.data?.jwt) {
          // Store JWT and update Redux state
          localStorage.setItem("jwt", response.data.jwt);
          dispatch({ type: LOGIN_SUCCESS, payload: response.data.jwt });
          updateAuthHeader();

          // Fetch user profile
          dispatch({ type: GET_PROFILE_REQUEST });
          try {
            const profileResponse = await api.get("/api/user/profile", {
              headers: { Authorization: `Bearer ${response.data.jwt}` },
            });
            dispatch({
              type: GET_PROFILE_SUCCESS,
              payload: profileResponse.data,
            });

            const userProfile = profileResponse.data;
            onSuccess?.({ success: true, user: userProfile });

            // Navigate based on user role
            if (
              userProfile?.currentMode === "ADMIN" ||
              userProfile?.role === "ADMIN"
            ) {
              navigate("/admin/dashboard");
            } else {
              navigate("/dashboard");
            }
          } catch (profileError) {
            dispatch({
              type: GET_PROFILE_FAILURE,
              payload: profileError.message,
            });
            navigate("/dashboard");
          }
        } else {
          onError?.(response.data?.message || "Authentication failed");
        }
      } catch (error) {
        console.error("Google login error:", error);
        onError?.(
          error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, navigate, onSuccess, onError],
  );

  // Listen for OAuth callback message from popup
  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;

      if (
        event.data?.type === "GOOGLE_OAUTH_SUCCESS" &&
        event.data?.accessToken
      ) {
        console.log("Received OAuth token from popup");
        handleOAuthCallback(event.data.accessToken);
      } else if (event.data?.type === "GOOGLE_OAUTH_ERROR") {
        console.error("OAuth error from popup:", event.data.error);
        setIsLoading(false);
        onError?.(event.data.error || "Google Sign-In failed");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleOAuthCallback, onError]);

  const handleClick = () => {
    console.log("Google Sign-In button clicked");

    // Check if Client ID is properly configured
    if (
      !GOOGLE_CLIENT_ID ||
      GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE"
    ) {
      onError?.(
        "Google Client ID is not configured. Please set up OAuth credentials.",
      );
      return;
    }

    setIsLoading(true);

    // Build Google OAuth URL manually
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const scope = "openid email profile";
    const responseType = "token"; // Implicit flow returns token directly

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", responseType);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("prompt", "select_account");

    console.log("Opening Google OAuth popup...");
    console.log("Redirect URI:", redirectUri);

    // Open popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl.toString(),
      "Google Sign-In",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
    );

    if (!popup) {
      setIsLoading(false);
      onError?.(
        "Popup was blocked. Please allow popups for this site and try again.",
      );
      return;
    }

    // Check if popup was closed without completing auth
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        // Only reset loading if we haven't received a success message
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    }, 500);
  };

  const buttonText =
    mode === "signup" ? "Continue with Google" : "Sign in with Google";

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      variant="outlined"
      fullWidth
      startIcon={
        isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <GoogleIcon />
        )
      }
      sx={{
        backgroundColor: "#ffffff",
        color: "#3c4043",
        borderColor: "#dadce0",
        padding: "10px 16px",
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 500,
        fontSize: "14px",
        fontFamily: "'Roboto', 'Arial', sans-serif",
        "&:hover": {
          backgroundColor: "#f8f9fa",
          borderColor: "#dadce0",
          boxShadow:
            "0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)",
        },
        "&:disabled": {
          backgroundColor: "#f5f5f5",
          color: "#9e9e9e",
        },
      }}
    >
      {buttonText}
    </Button>
  );
};

export default GoogleLoginButton;
