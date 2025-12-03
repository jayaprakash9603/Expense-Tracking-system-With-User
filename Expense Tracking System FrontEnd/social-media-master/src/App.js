import { Routes } from "react-router-dom";
import "./App.css";
import { useSelector } from "react-redux";
import Loader from "./components/Loaders/Loader";
import GlobalErrorHandler from "./pages/Landingpage/Errors/GlobalErrorHandler";
import { useAppInitialization } from "./hooks/useAppInitialization";
import { getAuthRoutes, getAppRoutes } from "./routes/AppRoutes";
// Import WebSocket Service
import "./services/socketService";

/**
 * Main App Component
 * Responsibilities:
 * - Initialize app on mount (via useAppInitialization hook)
 * - Render appropriate routes based on authentication state
 * - Apply theme to the app
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
    return <Routes>{getAuthRoutes()}</Routes>;
  }

  // Render main application routes for authenticated users
  return (
    <>
      <div className={isDark ? "dark" : "light"}>
        <Routes>{getAppRoutes()}</Routes>
      </div>
      <GlobalErrorHandler />
    </>
  );
}

export default App;
