import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfileAction } from "../Redux/Auth/auth.action";
import { fetchOrCreateUserSettings } from "../Redux/UserSettings/userSettings.action";
import { fetchFeatureFlags } from "../Redux/FeatureFlags";
import { setTheme } from "../Redux/Theme/theme.actions";
import { preloadUserPreferences } from "../services/userPreferencesService";
import { withTimeout } from "../utils/async/withTimeout";

const INIT_TIMEOUT_MS = 20000;

export const useAppInitialization = (jwt, auth) => {
  const [loading, setLoading] = useState(() => Boolean(jwt));
  const isInitialLoadRef = useRef(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (jwt) {
      import("../routes/AuthenticatedApp").catch(() => {});
    }
  }, [jwt]);

  useEffect(() => {
    if (jwt && auth?.user) {
      setLoading(false);
      return;
    }

    if (jwt) {
      setLoading(true);
    }

    let cancelled = false;

    const initializeApp = async () => {
      try {
        const flagsPromise = withTimeout(
          dispatch(fetchFeatureFlags()),
          INIT_TIMEOUT_MS,
          "Feature flags",
        ).catch((error) => {
          console.warn(error?.message || error);
          return null;
        });

        if (!jwt) {
          await flagsPromise;
          return;
        }

        const flags = await flagsPromise;

        const themeLocked =
          flags?.dormancyEnabled === true &&
          flags?.modules?.themeCustomization === false;
        if (themeLocked) {
          dispatch(setTheme("dark"));
        }

        const profilePromise = withTimeout(
          dispatch(getProfileAction(jwt)),
          INIT_TIMEOUT_MS,
          "Profile",
        ).catch((error) => {
          console.warn(error?.message || error);
          return null;
        });

        const preferencesPromise = withTimeout(
          preloadUserPreferences(dispatch, themeLocked),
          INIT_TIMEOUT_MS,
          "User preferences",
        ).catch((error) => {
          console.warn(error?.message || error);
          return null;
        });

        const settingsPromise = withTimeout(
          dispatch(fetchOrCreateUserSettings()),
          INIT_TIMEOUT_MS,
          "User settings",
        ).catch((error) => {
          console.warn(error?.message || error);
          return null;
        });

        const [profileResult, settingsFromPreload, settingsFromStore] =
          await Promise.all([
            profilePromise,
            preferencesPromise,
            settingsPromise,
          ]);

        const settings = settingsFromStore || settingsFromPreload;
        if (settings?.themeMode && !themeLocked) {
          dispatch(setTheme(settings.themeMode));
        }

        const profileUser = profileResult?.data ?? auth?.user;
        if (!cancelled) {
          handleInitialNavigation(
            { currentMode: profileUser?.currentMode ?? auth?.currentMode },
            location,
            isInitialLoadRef.current,
            navigate,
          );
          isInitialLoadRef.current = false;
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        if (!cancelled) {
          isInitialLoadRef.current = false;
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initializeApp();

    return () => {
      cancelled = true;
    };
  }, [jwt, dispatch, auth?.user, auth?.currentMode]);

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
