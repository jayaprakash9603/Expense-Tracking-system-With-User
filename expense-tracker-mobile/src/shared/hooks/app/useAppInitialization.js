import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfileAction } from "@/redux/auth/auth.actions";
import { fetchOrCreateUserSettings } from "@/redux/userSettings/userSettings.actions";
import { setTheme } from "@/redux/theme/theme.actions";
import { preloadUserPreferences } from "@/services/userPreferencesService";

export const useAppInitialization = (jwt) => {
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
        await Promise.all([
          preloadUserPreferences(dispatch),
          dispatch(getProfileAction(jwt)),
        ]);

        const settings = await dispatch(fetchOrCreateUserSettings());

        if (settings?.themeMode) {
          dispatch(setTheme(settings.themeMode));
        }

        const isAuthRoute =
          location.pathname === "/" ||
          location.pathname.startsWith("/login") ||
          location.pathname.startsWith("/register");

        if (isInitialLoad && isAuthRoute) {
          navigate("/dashboard");
        }

        setIsInitialLoad(false);
      } catch {
        setIsInitialLoad(false);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [jwt, dispatch]);

  return { loading };
};

export default useAppInitialization;
