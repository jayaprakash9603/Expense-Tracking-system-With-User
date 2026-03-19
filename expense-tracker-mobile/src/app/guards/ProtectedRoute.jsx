import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { STORAGE_KEYS } from "@/config/constants";

export function ProtectedRoute() {
  const jwt = localStorage.getItem(STORAGE_KEYS.JWT);

  if (!jwt) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
