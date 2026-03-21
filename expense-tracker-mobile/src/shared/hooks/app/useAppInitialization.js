import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateAuthHeader } from "@/config/api";
import { getProfileAction } from "@/redux/auth/auth.actions";
import { fetchOrCreateUserSettings } from "@/redux/userSettings/userSettings.actions";
import { setTheme } from "@/redux/theme/theme.actions";
import { preloadUserPreferences } from "@/services/userPreferencesService";

export const useAppInitialization = (jwt) => {
  const [loading, setLoading] = useState(() => Boolean(jwt));
  const firstHydrationRef = useRef(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!jwt) {
      firstHydrationRef.current = true;
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    updateAuthHeader();

    const pathAtStart =
      typeof window !== "undefined" ? window.location.pathname : "/";

    const run = async () => {
      try {
        await Promise.all([
          preloadUserPreferences(dispatch),
          dispatch(getProfileAction(jwt)),
        ]);
        if (cancelled) return;
        const settings = await dispatch(fetchOrCreateUserSettings());
        if (cancelled) return;
        if (settings?.themeMode) {
          dispatch(setTheme(settings.themeMode));
        }
        const isAuthRoute =
          pathAtStart === "/" ||
          pathAtStart.startsWith("/login") ||
          pathAtStart.startsWith("/register");
        if (firstHydrationRef.current && isAuthRoute) {
          navigate("/dashboard");
        }
        firstHydrationRef.current = false;
      } catch {
        firstHydrationRef.current = false;
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [jwt, dispatch, navigate]);

  return { loading };
};

export default useAppInitialization;
