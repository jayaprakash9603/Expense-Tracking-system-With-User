import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { STORAGE_KEYS } from "@/config/constants";

export function PublicRoute() {
  const jwt = localStorage.getItem(STORAGE_KEYS.JWT);

  if (jwt) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
