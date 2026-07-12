import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getActiveJwt } from "@/shared/utils/authStorage";

export function ProtectedRoute() {
  const jwt = getActiveJwt();
  const location = useLocation();
  const currentMode = useSelector((state) => state.auth?.currentMode || "USER");
  const isAdminMode = currentMode === "ADMIN";
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isNotFoundRoute = location.pathname === "/not-found";

  if (!jwt) {
    return <Navigate to="/login" replace />;
  }

  // Enforce mode-aware route access to keep USER and ADMIN surfaces isolated.
  if (!isNotFoundRoute && isAdminMode && !isAdminRoute) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!isNotFoundRoute && !isAdminMode && isAdminRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
