/**
 * =============================================================================
 * MfaVerification - MFA Code Verification Page During Login
 * =============================================================================
 *
 * Displayed when user has MFA enabled and needs to verify TOTP code.
 * Supports both regular TOTP codes and backup codes.
 *
 * Flow:
 * 1. User logs in with email/password
 * 2. If MFA enabled, redirected here with mfaToken
 * 3. User enters 6-digit TOTP from authenticator
 * 4. On success, receives JWT and redirected to dashboard
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import {
  PhonelinkLock as MfaIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  VpnKey as BackupKeyIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { api } from "../../../config/api";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  GET_PROFILE_SUCCESS,
} from "../../../Redux/Auth/auth.actionType";

// =============================================================================
// Main Component
// =============================================================================

const MfaVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const inputRefs = useRef([]);

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [backupCodeValue, setBackupCodeValue] = useState("");
  const [showBackupCode, setShowBackupCode] = useState(false);

  // Get mfaToken and email from navigation state
  const mfaToken = location.state?.mfaToken;
  const email = location.state?.email;

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Redirect to login if no mfaToken
    if (!mfaToken) {
      toast.warning(t("mfa.verification.sessionExpired"), {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
      navigate("/login");
      return;
    }

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [mfaToken, navigate, t]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle individual digit input change
   */
  const handleDigitChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        verifyCode(fullCode, false);
      }
    }
  };

  /**
   * Handle key down for navigation and paste
   */
  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6);
        if (digits.length === 6) {
          const newCode = digits.split("");
          setCode(newCode);
          verifyCode(digits, false);
        }
      });
    }
  };

  /**
   * Handle paste event
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pastedData) {
      const newCode = pastedData.split("");
      while (newCode.length < 6) newCode.push("");
      setCode(newCode);
      if (pastedData.length === 6) {
        verifyCode(pastedData, false);
      }
    }
  };

  /**
   * Verify TOTP or backup code
   */
  const verifyCode = async (codeValue, useBackupCode) => {
    try {
      setLoading(true);
      setError("");

      dispatch({ type: LOGIN_REQUEST });

      const response = await api.post("/auth/mfa/verify", {
        mfaToken: mfaToken,
        otp: codeValue,
        isBackupCode: useBackupCode,
      });

      if (response.data.jwt) {
        // Store JWT
        localStorage.setItem("jwt", response.data.jwt);

        // Update Redux state
        dispatch({
          type: LOGIN_SUCCESS,
          payload: response.data.jwt,
        });

        // Fetch user profile
        const profileResponse = await api.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${response.data.jwt}` },
        });

        dispatch({
          type: GET_PROFILE_SUCCESS,
          payload: profileResponse.data,
        });

        toast.success(t("mfa.verification.loginSuccess"));
        navigate("/");
      }
    } catch (error) {
      console.error("MFA verification error:", error);
      const errorMessage =
        error.response?.data?.error || t("mfa.verification.verificationFailed");
      setError(errorMessage);
      dispatch({ type: LOGIN_FAILURE, payload: errorMessage });

      // Show sticky warning toast notification (won't auto-dismiss)
      toast.warning(errorMessage, {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });

      // Log attempted code for debugging (only in development)
      if (process.env.NODE_ENV === "development") {
        console.log("Attempted code:", codeValue);
        console.log("Is backup code:", useBackupCode);
      }

      // Reset code on error
      if (!useBackupCode) {
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }

      // Check if token expired
      if (error.response?.status === 401) {
        toast.warning(t("mfa.verification.sessionExpired"), {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        });
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle backup code submission
   */
  const handleBackupCodeSubmit = (e) => {
    e.preventDefault();
    const normalizedCode = backupCodeValue.replace(/-/g, "").toUpperCase();
    if (normalizedCode.length === 8) {
      console.log("Submitting backup code (normalized):", normalizedCode);
      verifyCode(normalizedCode, true);
    } else {
      const errorMsg = t("mfa.verification.backupCodeFormat");
      setError(errorMsg);
      toast.warning(errorMsg, {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
    }
  };

  /**
   * Switch between TOTP and backup code mode
   */
  const toggleBackupCodeMode = () => {
    setIsBackupCode(!isBackupCode);
    setError("");
    setCode(["", "", "", "", "", ""]);
    setBackupCodeValue("");
  };

  /**
   * Go back to login
   */
  const handleBackToLogin = () => {
    navigate("/login");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 450,
          width: "100%",
          p: 4,
          borderRadius: 3,
          backgroundColor: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          textAlign: "center",
        }}
      >
        {/* Header */}
        <MfaIcon sx={{ fontSize: 60, color: colors.primary, mb: 2 }} />
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ color: colors.primary_text }}
        >
          {t("mfa.verification.title")}
        </Typography>
        <Typography sx={{ mb: 3, color: colors.secondary_text }}>
          {isBackupCode
            ? t("mfa.verification.backupSubtitle")
            : t("mfa.verification.subtitle")}
        </Typography>

        {/* Email display */}
        {email && (
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: colors.secondary_text,
              backgroundColor: colors.hover,
              py: 1,
              px: 2,
              borderRadius: 1,
            }}
          >
            {t("mfa.verification.signingInAs")}{" "}
            <strong style={{ color: colors.primary_text }}>{email}</strong>
          </Typography>
        )}

        {/* Error Alert - removed, using sticky toast instead */}

        {/* TOTP Code Input */}
        {!isBackupCode ? (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                mb: 2,
              }}
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <TextField
                  key={index}
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: "center",
                      fontSize: "1.5rem",
                      fontFamily: "monospace",
                      padding: "12px",
                      width: "40px",
                      color: colors.primary_text,
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: colors.hover,
                      "& fieldset": {
                        borderColor: colors.border,
                      },
                      "&:hover fieldset": {
                        borderColor: colors.primary,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.primary,
                      },
                    },
                  }}
                  disabled={loading}
                  autoComplete="off"
                />
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: colors.secondary_text }}>
              {t("mfa.verification.codeRefreshes")}
            </Typography>
          </Box>
        ) : (
          /* Backup Code Input */
          <Box
            component="form"
            onSubmit={handleBackupCodeSubmit}
            sx={{ mb: 3 }}
          >
            <TextField
              fullWidth
              value={backupCodeValue}
              onChange={(e) => {
                // Format as XXXX-XXXX
                let value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "");
                if (value.length > 4) {
                  value = value.slice(0, 4) + "-" + value.slice(4, 8);
                }
                setBackupCodeValue(value);
                setError("");
              }}
              placeholder="XXXX-XXXX"
              inputProps={{
                maxLength: 9,
                style: {
                  textAlign: "center",
                  fontSize: "1.5rem",
                  letterSpacing: "0.3rem",
                  fontFamily: "monospace",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowBackupCode(!showBackupCode)}
                      sx={{ color: colors.secondary_text }}
                    >
                      {showBackupCode ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: colors.hover,
                  "& fieldset": {
                    borderColor: colors.border,
                  },
                  "&:hover fieldset": {
                    borderColor: colors.primary,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: colors.primary,
                  },
                },
                "& .MuiInputBase-input": {
                  color: colors.primary_text,
                },
              }}
              type={showBackupCode ? "text" : "password"}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={
                loading || backupCodeValue.replace(/-/g, "").length !== 8
              }
              startIcon={
                loading ? <CircularProgress size={20} /> : <BackupKeyIcon />
              }
              sx={{
                backgroundColor: colors.primary,
                "&:hover": {
                  backgroundColor: colors.primary,
                  opacity: 0.9,
                },
              }}
            >
              {loading
                ? t("mfa.verification.verifying")
                : t("mfa.verification.useBackupCode")}
            </Button>
          </Box>
        )}

        {/* Manual Verify Button (for TOTP mode) */}
        {!isBackupCode && (
          <Button
            variant="contained"
            fullWidth
            onClick={() => verifyCode(code.join(""), false)}
            disabled={loading || code.join("").length !== 6}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              mb: 2,
              backgroundColor: colors.primary,
              "&:hover": {
                backgroundColor: colors.primary,
                opacity: 0.9,
              },
              "&.Mui-disabled": {
                backgroundColor: colors.border,
                color: colors.secondary_text,
              },
            }}
          >
            {loading
              ? t("mfa.verification.verifying")
              : t("mfa.verification.verify")}
          </Button>
        )}

        <Divider sx={{ my: 2, borderColor: colors.border }} />

        {/* Toggle Backup Code Mode */}
        <Box>
          <Link
            component="button"
            variant="body2"
            onClick={toggleBackupCodeMode}
            sx={{
              cursor: "pointer",
              display: "block",
              mb: 1,
              color: colors.primary,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {isBackupCode
              ? t("mfa.verification.useAuthenticator")
              : t("mfa.verification.lostAccess")}
          </Link>

          <Link
            component="button"
            variant="body2"
            onClick={handleBackToLogin}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              color: colors.primary,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
            {t("mfa.verification.backToLogin")}
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default MfaVerification;
