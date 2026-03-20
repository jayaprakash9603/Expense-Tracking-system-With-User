import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getActiveJwt } from "@/shared/utils/authStorage";

export function PublicRoute() {
  const jwt = getActiveJwt();

  if (jwt) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
