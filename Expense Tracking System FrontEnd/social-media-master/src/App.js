import { Routes } from "react-router-dom";
import "./App.css";
import { useSelector } from "react-redux";
import Loader from "./components/Loaders/Loader";
import GlobalErrorHandler from "./pages/Landingpage/Errors/GlobalErrorHandler";
import { useAppInitialization } from "./hooks/useAppInitialization";
import { getAuthRoutes, getAppRoutes } from "./routes/AppRoutes";
import { LanguageProvider } from "./i18n/LanguageContext";
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

  // Show loader while app is initializing
  if (loading) {
    return <Loader />;
  }

  // Render authentication routes if user is not authenticated
  if (!jwt || !auth.user) {
    return (
      <LanguageProvider>
        <Routes>{getAuthRoutes()}</Routes>
      </LanguageProvider>
    );
  }

  // Render main application routes for authenticated users
  return (
    <LanguageProvider>
      <div className={isDark ? "dark" : "light"}>
        <Routes>{getAppRoutes()}</Routes>
      </div>
      <GlobalErrorHandler />
    </LanguageProvider>
  );
}

export default App;
