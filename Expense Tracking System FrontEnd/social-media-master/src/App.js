import { Routes } from "react-router-dom";
import "./App.css";
import { useSelector } from "react-redux";
import Loader from "./components/Loaders/Loader";
import GlobalErrorHandler from "./pages/Landingpage/Errors/GlobalErrorHandler";
import { useAppInitialization } from "./hooks/useAppInitialization";
import { getAuthRoutes, getAppRoutes } from "./routes/AppRoutes";
import { LanguageProvider } from "./i18n/LanguageContext";
import { KeyboardShortcutProvider, ShortcutGuideModal, AltKeyOverlay } from "./features/keyboard";
// Import WebSocket Service
import "./services/socketService";

/**
 * Main App Component
 * Responsibilities:
 * - Initialize app on mount (via useAppInitialization hook)
 * - Render appropriate routes based on authentication state
 * - Apply theme to the app
 * - Provide language context for i18n support
 */
function App() {
  const { auth, theme } = useSelector((store) => store);
  const jwt = localStorage.getItem("jwt");
  const { loading } = useAppInitialization(jwt, auth);

  const isDark = theme?.mode === "dark";

  // Render authentication routes if user is not authenticated
  if (!jwt || !auth.user) {
    // Show loader only for authenticated routes during initialization
    if (loading && jwt) {
      return <Loader />;
    }

    return (
      <LanguageProvider>
        <Routes>{getAuthRoutes()}</Routes>
      </LanguageProvider>
    );
  }

  // Show loader while app is initializing for authenticated users
  if (loading) {
    return <Loader />;
  }

  // Render main application routes for authenticated users
  return (
    <LanguageProvider>
      <KeyboardShortcutProvider>
        <div className={isDark ? "dark" : "light"}>
          <Routes>{getAppRoutes()}</Routes>
        </div>
        <GlobalErrorHandler />
        <ShortcutGuideModal />
        <AltKeyOverlay />
      </KeyboardShortcutProvider>
    </LanguageProvider>
  );
}

export default App;
