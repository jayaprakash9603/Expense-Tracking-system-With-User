import React, { useMemo } from "react";
import { Card, ThemeProvider } from "@mui/material";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import OtpVerification from "./OtpVerification";
import MfaVerification from "../AuthPage/MfaVerification";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import OAuthCallback from "../OAuthCallback";
import createAppTheme from "../Landingpage/theme";

const Authentication = () => {
  const location = useLocation();

  // Force dark theme for authentication pages
  const darkTheme = useMemo(() => createAppTheme("dark"), []);

  // OAuth callback page should render without the card wrapper
  if (location.pathname === "/oauth/callback") {
    return <OAuthCallback />;
  }

  // OTP verification page should render without the card wrapper
  if (location.pathname === "/otp-verification") {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="dark">
          <OtpVerification />
        </div>
      </ThemeProvider>
    );
  }

  // MFA verification page should render without the card wrapper
  if (location.pathname === "/mfa") {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="dark">
          <MfaVerification />
        </div>
      </ThemeProvider>
    );
  }

  // Check if current route is forgot-password or create-password
  const isForgotPasswordRoute =
    location.pathname === "/forgot-password" ||
    location.pathname === "/create-password";

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="dark min-h-screen flex bg-[#121212]">
        {/* Left Side Branding (Hidden on mobile/tablet) */}
        <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12 bg-gradient-to-br from-[#1b1b1b] to-[#29282b] relative overflow-hidden border-r border-[#383838]">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#14b8a6] blur-[120px]" />
            <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[rgb(0,218,196)] blur-[100px]" />
          </div>

          <div className="z-10 flex flex-col items-center mb-6 space-y-4">
            <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-tr from-[#14b8a6] to-[rgb(146,233,220)] flex items-center justify-center shadow-lg shadow-[#14b8a6]/20">
              <span className="text-4xl text-[#121212] font-[Syncopate] font-bold">E</span>
            </div>
            <h1
              className="text-center text-4xl xl:text-5xl font-bold font-[Syncopate] tracking-wide"
              style={{ whiteSpace: "pre-line" }}
            >
              <span style={{ color: "#d8fffb" }}>Ex</span>
              <span style={{ color: "rgb(146, 233, 220)" }}>p</span>
              <span style={{ color: "rgb(0, 218, 196)" }}>en</span>
              <span style={{ color: "rgb(0, 199, 171)" }}>s</span>
              <span style={{ color: "rgb(0, 168, 133)" }}>i</span>
              <span style={{ color: "rgb(0, 137, 102)" }}>o</span>
              <br />
              <span style={{ color: "#14b8a6", display: "inline-block", marginTop: "10px" }}> Finance</span>
            </h1>
            <p className="text-center text-lg text-gray-400 max-w-md mt-6 leading-relaxed">
              Track all your expenses in one place with a simpler, more intuitive way.
              Take control of your financial journey today.
            </p>
          </div>
        </div>

        {/* Right Side Forms */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#1e1e1e]">
          <Card
            className="w-full max-w-md p-6 sm:p-8 rounded-xl relative z-10"
            style={{
              backgroundColor: "rgb(27, 27, 27)",
              border: "1px solid rgb(56, 56, 56)",
              borderRadius: "16px",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
              opacity: 1,
            }}
          >
            {/* Mobile Branding (Only visible on small screens) */}
            <div className="lg:hidden flex flex-col items-center mb-8 space-y-2">
              <div className="w-16 h-16 mb-2 rounded-full bg-gradient-to-tr from-[#14b8a6] to-[rgb(146,233,220)] flex items-center justify-center shadow-md">
                <span className="text-2xl text-[#121212] font-[Syncopate] font-bold">E</span>
              </div>
              <h1
                className="text-center text-3xl font-bold font-[Syncopate]"
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
              <p className="text-center text-sm text-gray-400 max-w-xs mt-1">
                Track all your expenses in one place
              </p>
            </div>

            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/create-password"
                element={<ForgotPassword isPasswordCreation={true} />}
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Authentication;
