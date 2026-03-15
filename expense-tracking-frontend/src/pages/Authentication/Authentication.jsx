import React, { useMemo } from "react";
import { Card, ThemeProvider } from "@mui/material";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import OtpVerification from "./OtpVerification";
import MfaVerification from "../AuthPage/MfaVerification";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import OAuthCallback from "../OAuthCallback";
import createAppTheme from "../../shared/theme/createAppTheme";

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
        <div className="hidden lg:flex flex-col justify-center items-center w-[45%] p-12 bg-[#1b1b1b] relative overflow-hidden border-r border-[#2e2e2e]">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#14b8a6] blur-[140px]" />
            <div className="absolute bottom-[-10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#0d9488] blur-[120px]" />
          </div>

          <div className="z-10 flex flex-col items-center space-y-8">
            {/* Logo Icon */}
            <div className="w-28 h-28 rounded-full bg-[#14b8a6] flex items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.3)]">
              <span 
                className="text-5xl text-[#121212] font-black tracking-widest" 
                style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
              >
                E
              </span>
            </div>
            
            {/* Typography Logo */}
            <div className="flex flex-col items-center mt-2">
              <h1 
                className="text-5xl xl:text-6xl font-extrabold text-white mb-1 tracking-wider" 
                style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
              >
                Expensio
              </h1>
              <span 
                className="text-4xl xl:text-5xl font-bold text-[#14b8a6] tracking-wide" 
                style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
              >
                Finance
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-center text-[#a0a0a0] text-lg max-w-[400px] mt-8 leading-relaxed font-light">
              Track all your expenses in one place with a simpler, 
              more intuitive way. Take control of your financial 
              journey today.
            </p>
          </div>
        </div>

        {/* Right Side Forms */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#18181b]">
          <Card
            className="w-full max-w-md p-8 sm:p-10 rounded-2xl relative z-10"
            style={{
              backgroundColor: "#222222",
              border: "1px solid #333333",
              borderRadius: "16px",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
              opacity: 1,
            }}
          >
            {/* Mobile Branding (Only visible on small screens) */}
            <div className="lg:hidden flex flex-col items-center mb-8 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#14b8a6] flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                <span className="text-4xl text-[#121212] font-black" style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}>E</span>
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-4xl font-extrabold text-white tracking-wider" style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}>
                  Expensio
                </h1>
                <span className="text-3xl font-bold text-[#14b8a6] tracking-wide" style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}>
                  Finance
                </span>
              </div>
              <p className="text-center text-[#a0a0a0] text-sm max-w-xs mt-2 font-light">
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
