import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, Suspense } from "react";
import { getProfileAction } from "./Redux/Auth/auth.action";
import Loader from "./components/Loaders/Loader";
import Authentication from "./pages/Authentication/Authentication";
import GlobalErrorHandler from "./pages/Landingpage/Errors/GlobalErrorHandler";

import ProtectedRoute from "./components/routing/ProtectedRoute";
import { protectedRoutes, buildRoutes } from "./routes/routeConfig";

function App() {
  const { auth } = useSelector((s) => s);
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jwt) {
      dispatch(getProfileAction(jwt)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [jwt, dispatch]);

  if (loading) return <Loader />;

  const isAuthed = !!(jwt && auth.user);

  return (
    <>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/auth/*" element={<Authentication />} />
          {protectedRoutes.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={
                <ProtectedRoute isAuthed={isAuthed}>{r.element}</ProtectedRoute>
              }
            >
              {r.children && buildRoutes(r.children)}
            </Route>
          ))}
          <Route
            path="*"
            element={
              <Navigate to={isAuthed ? "/not-found" : "/auth"} replace />
            }
          />
        </Routes>
      </Suspense>
      <GlobalErrorHandler />
    </>
  );
}

export default App;
