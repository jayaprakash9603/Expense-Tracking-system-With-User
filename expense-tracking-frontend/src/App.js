import { lazy, Suspense, useEffect } from "react";
import { Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useSelector } from "react-redux";
import Loader from "./components/Loaders/Loader";
import { useAppInitialization } from "./hooks/useAppInitialization";
import { getPublicRoutes } from "./routes/PublicRoutes";
import { AppSeo, isPublicMarketingPath } from "./seo";
import { LanguageProvider } from "./i18n/LanguageContext";

const GuestAuthApp = lazy(() => import("./routes/GuestAuthApp"));
const AuthenticatedApp = lazy(() =>
  import(/* webpackPrefetch: true */ "./routes/AuthenticatedApp"),
);
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));

function App() {
  const location = useLocation();
  const { auth, theme } = useSelector((store) => store);
  const jwt = localStorage.getItem("jwt");
  const { loading } = useAppInitialization(jwt, auth);

  useEffect(() => {
    if (jwt) {
      import("./routes/AuthenticatedApp").catch(() => {});
    }
  }, [jwt]);

  const isDark = theme?.mode === "dark";
  const isOAuthCallback = location.pathname === "/oauth/callback";
  const isLoggedIn = Boolean(jwt && auth.user);
  const showPublicSite =
    isPublicMarketingPath(location.pathname) &&
    !(isLoggedIn && location.pathname === "/");

  if (isOAuthCallback) {
    return (
      <LanguageProvider>
        <Suspense fallback={<Loader />}>
          <OAuthCallback />
        </Suspense>
      </LanguageProvider>
    );
  }

  if (showPublicSite) {
    return (
      <LanguageProvider>
        <AppSeo />
        <Routes>{getPublicRoutes({ includeHome: true })}</Routes>
      </LanguageProvider>
    );
  }

  const isSessionHydrating =
    Boolean(jwt) && !auth.user && (loading || auth.loading);

  if (loading || isSessionHydrating) {
    return <Loader />;
  }

  if (!jwt || !auth.user) {
    return (
      <LanguageProvider>
        <AppSeo />
        <Suspense fallback={<Loader />}>
          <GuestAuthApp />
        </Suspense>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <AppSeo />
      <Suspense fallback={<Loader />}>
        <AuthenticatedApp isDark={isDark} />
      </Suspense>
    </LanguageProvider>
  );
}

export default App;
