import React from "react";
import { Card } from "@mui/material";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import OAuthCallback from "../OAuthCallback";

const Authentication = () => {
  const location = useLocation();

  // OAuth callback page should render without the card wrapper
  if (location.pathname === "/oauth/callback") {
    return <OAuthCallback />;
  }

  // Check if current route is forgot-password or create-password
  const isForgotPasswordRoute =
    location.pathname === "/forgot-password" ||
    location.pathname === "/create-password";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#29282b] p-4">
      <Card
        className="w-full max-w-md p-6 sm:p-8 rounded-lg"
        style={{
          backgroundColor: "rgb(27, 27, 27)",
          border: "1px solid rgb(56, 56, 56)",
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          opacity: 1,
        }}
      >
        {!isForgotPasswordRoute && (
          <div className="flex flex-col items-center mb-6 space-y-2">
            <h1
              className="text-center text-2xl sm:text-3xl font-bold font-[Syncopate]"
              style={{ whiteSpace: "pre-line" }}
            >
              <span style={{ color: "#d8fffb" }}>Ex</span>
              <span style={{ color: "rgb(146, 233, 220)" }}>p</span>
              <span style={{ color: "rgb(0, 218, 196)" }}>en</span>
              <span style={{ color: "rgb(0, 199, 171)" }}>s</span>
              <span style={{ color: "rgb(0, 168, 133)" }}>i</span>
              <span style={{ color: "rgb(0, 137, 102)" }}>o</span>
              <span style={{ color: "#14b8a6" }}> Finance</span>
            </h1>
            <p className="text-center text-sm text-gray-400 max-w-xs">
              Track all your expenses in one place with a simpler way
            </p>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/create-password"
            element={<ForgotPassword isPasswordCreation={true} />}
          />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Card>
    </div>
  );
};

export default Authentication;
