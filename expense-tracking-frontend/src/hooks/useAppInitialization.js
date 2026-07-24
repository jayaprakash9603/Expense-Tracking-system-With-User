import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfileAction } from "../Redux/Auth/auth.action";
import { fetchOrCreateUserSettings } from "../Redux/UserSettings/userSettings.action";
import { fetchFeatureFlags } from "../Redux/FeatureFlags";
import { setTheme } from "../Redux/Theme/theme.actions";
import { preloadUserPreferences } from "../services/userPreferencesService";

export const useAppInitialization = (jwt, auth) => {
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);

    const initializeApp = async () => {
      try {
        const flags = await dispatch(fetchFeatureFlags());

        // When theme customization is dormant, lock the app to dark mode and
        // normalize any persisted/light preference so direct state.theme readers
        // (tables, dropdowns, overlays) render dark too.
        const themeLocked =
          flags?.dormancyEnabled === true &&
          flags?.modules?.themeCustomization === false;
        if (themeLocked) {
          dispatch(setTheme("dark"));
        }

        if (!jwt) {
          return;
        }

        await Promise.all([
          preloadUserPreferences(dispatch, themeLocked),
          dispatch(getProfileAction(jwt)),
        ]);

        const settings = dispatch(fetchOrCreateUserSettings());

        if (settings?.themeMode) {
          dispatch(setTheme(themeLocked ? "dark" : settings.themeMode));
        }

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
