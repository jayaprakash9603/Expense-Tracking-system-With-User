import React from "react";
import { Box, Card } from "@mui/material";
import { useSelector } from "react-redux";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import OtpVerification from "./OtpVerification";
import MfaVerification from "../AuthPage/MfaVerification";
import { Route, Routes, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { isFeatureEnabledInState, SUB_FEATURE_KEYS } from "../../config/featureCatalog";
import FeatureUnavailable from "../../features/errors/pages/FeatureUnavailablePage";

const Authentication = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const featureFlags = useSelector((state) => state.featureFlags);

  const mfaEnabled = isFeatureEnabledInState(
    featureFlags,
    SUB_FEATURE_KEYS.AUTH_MFA,
  );
  const emailOtpEnabled = isFeatureEnabledInState(
    featureFlags,
    SUB_FEATURE_KEYS.AUTH_EMAIL_OTP,
  );

  // OTP verification page should render without the card wrapper
  if (location.pathname === "/otp-verification") {
    const mode = (searchParams.get("mode") || "login").toLowerCase();
    if (mode === "login" && !emailOtpEnabled) {
      return <FeatureUnavailable featureKey={SUB_FEATURE_KEYS.AUTH_EMAIL_OTP} />;
    }
    return <OtpVerification />;
  }

  // MFA verification page should render without the card wrapper
  if (location.pathname === "/mfa") {
    if (!mfaEnabled) {
      return <FeatureUnavailable featureKey={SUB_FEATURE_KEYS.AUTH_MFA} />;
    }
    return <MfaVerification />;
  }

  // Check if current route is forgot-password or create-password
  const isForgotPasswordRoute =
    location.pathname === "/forgot-password" ||
    location.pathname === "/create-password";

  return (
    <Box
      className="min-h-screen flex"
      sx={{ backgroundColor: "var(--color-secondary-bg)", minHeight: "100dvh" }}
    >
        {/* Left Side Branding (Hidden on mobile/tablet) */}
        <Box
          className="hidden lg:flex flex-col justify-center items-center w-[45%] p-12 relative overflow-hidden"
          sx={{
            backgroundColor: "var(--color-primary-bg)",
            borderRight: 1,
            borderColor: "var(--color-border-color)",
          }}
        >
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
            <Box
              className="absolute top-[-10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[140px]"
              sx={{ bgcolor: "var(--color-primary-accent)", opacity: 0.35 }}
            />
            <Box
              className="absolute bottom-[-10%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[120px]"
              sx={{ bgcolor: "primary.dark", opacity: 0.3 }}
            />
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
            <a
              href="/"
              className="z-10 mt-4 text-sm text-[#14b8a6] underline underline-offset-4 hover:text-[#99f6e4]"
            >
              Back to the public site
            </a>
          </div>
        </Box>

        {/* Right Side Forms */}
        <Box
          className="flex-1 flex items-center justify-center p-4 sm:p-8"
          sx={{ backgroundColor: "var(--color-secondary-bg)" }}
        >
          <Card
            className="w-full max-w-md p-8 sm:p-10 rounded-2xl relative z-10"
            sx={{
              backgroundColor: "var(--color-primary-bg)",
              border: "1px solid var(--color-border-color)",
              borderRadius: 2,
              boxShadow: 4,
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
              <Route path="/" element={<Navigate to="/login" replace />} />
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
        </Box>
    </Box>
  );
};

export default Authentication;
