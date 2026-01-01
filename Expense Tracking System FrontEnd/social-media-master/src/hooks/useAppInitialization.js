import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfileAction } from "../Redux/Auth/auth.action";
import { fetchOrCreateUserSettings } from "../Redux/UserSettings/userSettings.action";
import { setTheme } from "../Redux/Theme/theme.actions";
import { preloadUserPreferences } from "../services/userPreferencesService";

/**
 * Custom hook to handle app initialization logic
 * Responsible for:
 * - Loading user preferences (dashboard layout, theme)
 * - Fetching user profile
 * - Handling initial navigation
 */
export const useAppInitialization = (jwt, auth) => {
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!jwt) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const initializeApp = async () => {
      try {
        // Preload user preferences and profile in parallel
        await Promise.all([
          preloadUserPreferences(dispatch),
          dispatch(getProfileAction(jwt)),
        ]);

        // Fetch or create user settings
        const settings = dispatch(fetchOrCreateUserSettings());

        // Sync theme from user settings if available
        if (settings?.themeMode) {
          dispatch(setTheme(settings.themeMode));
        }

        // Handle initial navigation
        handleInitialNavigation(auth, location, isInitialLoad, navigate);
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error initializing app:", error);
        setIsInitialLoad(false);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [jwt, dispatch]);

  return { loading };
};

/**
 * Handles navigation logic based on user authentication state
 */
const handleInitialNavigation = (auth, location, isInitialLoad, navigate) => {
  const isAuthRoute =
    location.pathname === "/" ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  if (isInitialLoad && isAuthRoute) {
    const currentMode = auth?.currentMode;
    const targetRoute =
      currentMode === "ADMIN" ? "/admin/dashboard" : "/dashboard";
    navigate(targetRoute);
  }
};
