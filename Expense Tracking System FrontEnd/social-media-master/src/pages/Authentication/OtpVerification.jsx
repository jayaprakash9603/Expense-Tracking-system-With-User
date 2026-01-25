import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "../../hooks/useTheme";
import { api } from "../../config/api";
import { useDispatch } from "react-redux";
import { verifyTwoFactorOtpAction } from "../../Redux/Auth/auth.action";
import ToastNotification from "../Landingpage/ToastNotification";

const OTP_LENGTH = 6;
const TIMER_SECONDS = 30; // 30 seconds

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const OtpVerification = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const mode = (searchParams.get("mode") || "login").toLowerCase(); // login | reset
  const email = searchParams.get("email") || "";
  const isPasswordCreation = searchParams.get("isPasswordCreation") === "1";

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const inputsRef = useRef([]);

  const otp = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    if (!email) {
      setError("Email is missing. Please go back and try again.");
      return;
    }

    setExpired(false);
    setTimeLeft(TIMER_SECONDS);
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [email, location.key]);

  const focusIndex = (index) => {
    const node = inputsRef.current[index];
    if (node) node.focus();
  };

  const setDigit = (index, value) => {
    const sanitized = String(value || "")
      .replace(/\D/g, "")
      .slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = sanitized;
      return next;
    });
  };

  const clearOtp = () => {
    setDigits(Array(OTP_LENGTH).fill(""));
    focusIndex(0);
  };

  const handleInputChange = (index, value) => {
    setError("");

    setDigit(index, value);

    const sanitized = String(value || "").replace(/\D/g, "");
    if (sanitized.length >= 1 && index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        focusIndex(index - 1);
      }
      return;
    }

    if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
      e.preventDefault();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }

    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const verify = async () => {
    if (!email) {
      setError("Email is missing. Please go back and try again.");
      return;
    }

    if (otp.length !== OTP_LENGTH || digits.some((d) => !d)) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");
    try {
      if (mode === "reset") {
        await api.post("/auth/verify-otp", { email, otp }, { skipAuth: true });

        const target = isPasswordCreation
          ? "/create-password"
          : "/forgot-password";
        navigate(`${target}?email=${encodeURIComponent(email)}&otpVerified=1`, {
          replace: true,
        });
        return;
      }

      const result = await dispatch(verifyTwoFactorOtpAction({ email, otp }));
      if (!result.success) {
        setToast({
          open: true,
          message: result.message || "OTP verification failed",
          severity: "error",
        });
        return;
      }

      // Auth action already fetched profile; route accordingly
      const { currentMode, role, user } = result;
      if (
        currentMode === "ADMIN" ||
        role === "ADMIN" ||
        user?.role === "ADMIN"
      ) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setToast({
        open: true,
        message:
          err?.response?.data?.error ||
          err?.message ||
          "OTP verification failed",
        severity: "error",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    if (!email) {
      setError("Email is missing. Please go back and try again.");
      return;
    }

    setIsResending(true);
    setError("");
    try {
      if (mode === "reset") {
        await api.post("/auth/send-otp", { email }, { skipAuth: true });
      } else {
        await api.post("/auth/resend-login-otp", { email }, { skipAuth: true });
      }

      clearOtp();
      setExpired(false);
      setTimeLeft(TIMER_SECONDS);
      setToast({
        open: true,
        message: "OTP code sent successfully!",
        severity: "success",
      });
    } catch (err) {
      setToast({
        open: true,
        message:
          err?.response?.data?.error || err?.message || "Failed to resend OTP",
        severity: "error",
      });
    } finally {
      setIsResending(false);
    }
  };

  const containerBg = colors.secondary_bg;
  const cardBg = colors.card_bg;
  const border = colors.border_color;
  const text = colors.primary_text;
  const muted = colors.placeholder_text;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundColor: containerBg,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          backgroundColor: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 2,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          p: { xs: 3, sm: 4 },
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: text,
            mb: 1,
            letterSpacing: 0.2,
          }}
        >
          OTP Verification
        </Typography>

        <Typography variant="body2" sx={{ color: muted, mb: 1.5 }}>
          Enter the 6-digit code sent to your email
        </Typography>

        <Typography
          id="timer"
          sx={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: expired ? colors.primary_accent : "#ff9800",
            mb: 2.5,
          }}
        >
          {expired
            ? "Resend available"
            : `Time remaining: ${formatTime(timeLeft)}`}
        </Typography>

        <Box
          className="otp-input"
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mb: 3,
            flexWrap: "nowrap",
          }}
        >
          {digits.map((value, index) => (
            <Box
              key={index}
              component="input"
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              inputMode="numeric"
              aria-label={`OTP digit ${index + 1}`}
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                border: `1px solid ${border}`,
                backgroundColor: colors.active_bg,
                color: text,
                fontSize: "1.2rem",
                fontWeight: 700,
                textAlign: "center",
                outline: "none",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
                "&:focus": {
                  borderColor: colors.primary_accent,
                  boxShadow: `0 0 0 3px ${colors.primary_accent}22`,
                },
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={verify}
            disabled={isVerifying}
            sx={{
              minWidth: 120,
              backgroundColor: colors.button_bg,
              color: colors.button_text,
              fontWeight: 800,
              textTransform: "none",
              "&:hover": { backgroundColor: colors.button_hover },
            }}
          >
            {isVerifying ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Verify"
            )}
          </Button>

          <Button
            id="resendButton"
            variant="contained"
            onClick={resend}
            disabled={isResending || !expired}
            sx={{
              minWidth: 140,
              backgroundColor: colors.button_inactive,
              color: colors.primary_text,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { backgroundColor: colors.hover_bg },
              "&.Mui-disabled": {
                backgroundColor: colors.button_inactive,
                color: colors.icon_muted,
              },
            }}
          >
            {isResending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Resend Code"
            )}
          </Button>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Button
            variant="text"
            onClick={() => navigate("/login")}
            sx={{
              textTransform: "none",
              color: colors.primary_accent,
              fontWeight: 700,
            }}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
      <ToastNotification
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
};

export default OtpVerification;
