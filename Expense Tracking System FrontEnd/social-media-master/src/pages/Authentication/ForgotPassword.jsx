import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Box,
  IconButton,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import ToastNotification from "../Landingpage/ToastNotification";
import LockResetIcon from "@mui/icons-material/LockReset";
import EmailIcon from "@mui/icons-material/Email";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckIcon from "@mui/icons-material/Check";

const ForgotPassword = ({ isPasswordCreation = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(prefilledEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOAuthUser, setIsOAuthUser] = useState(isPasswordCreation);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // If prefilled email is provided (OAuth user), start OTP flow immediately
  useEffect(() => {
    if (prefilledEmail && isPasswordCreation) {
      handleSendOtpDirect(prefilledEmail);
    }
  }, [prefilledEmail, isPasswordCreation]);

  const handleSendOtpDirect = async (emailToSend) => {
    setIsLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        email: emailToSend,
      });
      setEmail(emailToSend);
      setStep(2);
      setToast({
        open: true,
        message: "OTP sent to your email",
        severity: "success",
      });
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to send OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (values) => {
    setIsLoading(true);
    setError("");
    try {
      // Check if user is OAuth user without password
      try {
        const authCheckResponse = await axios.get(
          `${API_BASE_URL}/auth/check-auth-method?email=${values.email}`,
        );
        if (
          authCheckResponse.data.exists &&
          authCheckResponse.data.authProvider === "GOOGLE" &&
          !authCheckResponse.data.hasPassword
        ) {
          setIsOAuthUser(true);
        }
      } catch (e) {
        // Ignore check errors
      }

      await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        email: values.email,
      });
      setEmail(values.email);
      setStep(2);
      setToast({
        open: true,
        message: "OTP sent to your email",
        severity: "success",
      });
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to send OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (values) => {
    setIsLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email,
        otp: values.otp,
      });
      setStep(3);
      setToast({
        open: true,
        message: "OTP verified successfully",
        severity: "success",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setIsLoading(true);
    setError("");
    try {
      await axios.patch(`${API_BASE_URL}/auth/reset-password`, {
        email,
        password: values.password,
      });

      const successMessage =
        isOAuthUser || isPasswordCreation
          ? "Password created successfully!"
          : "Password reset successfully!";
      setToast({ open: true, message: successMessage, severity: "success" });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to reset password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE_URL}/auth/send-otp`, { email });
      setToast({
        open: true,
        message: "OTP resent successfully",
        severity: "success",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const emailSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const otpSchema = Yup.object({
    otp: Yup.string()
      .required("OTP is required")
      .length(6, "OTP must be 6 digits"),
  });

  const passwordSchema = Yup.object({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const getTitle = () => {
    if (isOAuthUser || isPasswordCreation) {
      return "Create Password";
    }
    return "Forgot Password";
  };

  const getStepIcon = () => {
    if (step === 1)
      return <EmailIcon sx={{ fontSize: 40, color: "#14b8a6" }} />;
    if (step === 2)
      return <VpnKeyIcon sx={{ fontSize: 40, color: "#14b8a6" }} />;
    return <LockResetIcon sx={{ fontSize: 40, color: "#14b8a6" }} />;
  };

  const getStepDescription = () => {
    if (step === 1) {
      if (isOAuthUser || isPasswordCreation) {
        return "Enter your email to create a password for email/password login.";
      }
      return "Enter your email and we'll send you an OTP to reset your password.";
    }
    if (step === 2) {
      return `We've sent a 6-digit code to ${email}. Enter it below.`;
    }
    if (isOAuthUser || isPasswordCreation) {
      return "Create a password to enable email/password login.";
    }
    return "Enter your new password below.";
  };

  const getProgress = () => (step / 3) * 100;

  // Step indicator component
  const StepIndicator = ({ stepNumber, label, isActive, isCompleted }) => (
    <div className="flex flex-col items-center">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isCompleted
            ? "#14b8a6"
            : isActive
              ? "rgba(20, 184, 166, 0.2)"
              : "rgb(56, 56, 56)",
          border: isActive ? "2px solid #14b8a6" : "2px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        {isCompleted ? (
          <CheckIcon sx={{ fontSize: 18, color: "#fff" }} />
        ) : (
          <span
            style={{
              color: isActive ? "#14b8a6" : "#6b7280",
              fontWeight: "bold",
              fontSize: "0.9rem",
            }}
          >
            {stepNumber}
          </span>
        )}
      </div>
      <span
        style={{
          color: isActive || isCompleted ? "#14b8a6" : "#6b7280",
          fontSize: "0.7rem",
          marginTop: "6px",
          fontWeight: isActive ? "600" : "normal",
        }}
      >
        {label}
      </span>
    </div>
  );

  // Connector line between steps
  const StepConnector = ({ isCompleted }) => (
    <div
      style={{
        flex: 1,
        height: 2,
        backgroundColor: isCompleted ? "#14b8a6" : "rgb(56, 56, 56)",
        margin: "0 8px",
        marginBottom: "20px",
        transition: "background-color 0.3s ease",
      }}
    />
  );

  return (
    <>
      <div className="space-y-5" style={{ padding: "24px" }}>
        {/* Back to Login - Top Left */}
        <div style={{ marginBottom: "8px" }}>
          <Button
            onClick={() => navigate("/login")}
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 14 }} />}
            sx={{
              color: "#14b8a6",
              textTransform: "none",
              fontSize: "0.85rem",
              padding: "4px 8px",
              minWidth: "auto",
              "&:hover": {
                backgroundColor: "rgba(20, 184, 166, 0.1)",
              },
            }}
          >
            Back to Login
          </Button>
        </div>

        {/* Header: Icon and Title in same row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(20, 184, 166, 0.1)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LockResetIcon sx={{ fontSize: 24, color: "#14b8a6" }} />
          </div>
          <h2
            style={{
              color: "#14b8a6",
              fontWeight: "bold",
              fontSize: "1.35rem",
              margin: 0,
            }}
          >
            {getTitle()}
          </h2>
        </div>

        {/* Step Progress Indicator */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            mb: 3,
          }}
        >
          <StepIndicator
            stepNumber={1}
            label="Email"
            isActive={step === 1}
            isCompleted={step > 1}
          />
          <StepConnector isCompleted={step > 1} />
          <StepIndicator
            stepNumber={2}
            label="Verify"
            isActive={step === 2}
            isCompleted={step > 2}
          />
          <StepConnector isCompleted={step > 2} />
          <StepIndicator
            stepNumber={3}
            label="Password"
            isActive={step === 3}
            isCompleted={false}
          />
        </Box>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              border: "1px solid rgba(244, 67, 54, 0.3)",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#f44336", fontSize: "0.875rem", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Step 1: Loading state for auto-send */}
        {step === 1 && prefilledEmail && isLoading && (
          <div className="text-center py-6">
            <CircularProgress style={{ color: "#14b8a6" }} size={40} />
            <p
              style={{
                color: "#9ca3af",
                marginTop: "16px",
                fontSize: "0.9rem",
              }}
            >
              Sending OTP...
            </p>
          </div>
        )}

        {/* Step 1: Error with retry for auto-send */}
        {step === 1 && prefilledEmail && !isLoading && error && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => handleSendOtpDirect(prefilledEmail)}
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#14b8a6",
                color: "#fff",
                py: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#0d9488" },
              }}
            >
              Retry Send OTP
            </Button>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 && !prefilledEmail && (
          <Formik
            onSubmit={handleSendOtp}
            validationSchema={emailSchema}
            initialValues={{ email: "" }}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                <Field name="email">
                  {({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Enter your email"
                      type="email"
                      variant="outlined"
                      fullWidth
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        style: {
                          backgroundColor: "rgb(56, 56, 56)",
                          color: "#d8fffb",
                          borderRadius: "8px",
                        },
                      }}
                      FormHelperTextProps={{
                        style: { color: "#f44336" },
                      }}
                    />
                  )}
                </Field>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    backgroundColor: "#14b8a6",
                    color: "#fff",
                    py: 1.5,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": { backgroundColor: "#0d9488" },
                    "&:disabled": {
                      backgroundColor: "rgba(20, 184, 166, 0.5)",
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <Formik
            onSubmit={handleVerifyOtp}
            validationSchema={otpSchema}
            initialValues={{ otp: "" }}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                <Field name="otp">
                  {({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Enter 6-digit OTP"
                      type="text"
                      variant="outlined"
                      fullWidth
                      error={touched.otp && !!errors.otp}
                      helperText={touched.otp && errors.otp}
                      inputProps={{
                        maxLength: 6,
                        style: {
                          textAlign: "center",
                          letterSpacing: "8px",
                          fontSize: "1.25rem",
                        },
                      }}
                      InputProps={{
                        style: {
                          backgroundColor: "rgb(56, 56, 56)",
                          color: "#d8fffb",
                          borderRadius: "8px",
                        },
                      }}
                      FormHelperTextProps={{
                        style: { color: "#f44336", textAlign: "center" },
                      }}
                    />
                  )}
                </Field>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    backgroundColor: "#14b8a6",
                    color: "#fff",
                    py: 1.5,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": { backgroundColor: "#0d9488" },
                    "&:disabled": {
                      backgroundColor: "rgba(20, 184, 166, 0.5)",
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => {
                      setStep(1);
                      setError("");
                    }}
                    startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 12 }} />}
                    sx={{
                      color: "#9ca3af",
                      textTransform: "none",
                      fontSize: "0.85rem",
                      "&:hover": {
                        color: "#14b8a6",
                        backgroundColor: "rgba(20, 184, 166, 0.1)",
                      },
                    }}
                  >
                    Change Email
                  </Button>
                  <Button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    sx={{
                      color: "#14b8a6",
                      textTransform: "none",
                      fontSize: "0.85rem",
                      "&:hover": { backgroundColor: "rgba(20, 184, 166, 0.1)" },
                    }}
                  >
                    Resend OTP
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <Formik
            onSubmit={handleResetPassword}
            validationSchema={passwordSchema}
            initialValues={{ password: "", confirmPassword: "" }}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                <Field name="password">
                  {({ field }) => (
                    <TextField
                      {...field}
                      placeholder="New Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                      error={touched.password && !!errors.password}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        style: {
                          backgroundColor: "rgb(56, 56, 56)",
                          color: "#d8fffb",
                          borderRadius: "8px",
                        },
                      }}
                      FormHelperTextProps={{
                        style: { color: "#f44336" },
                      }}
                    />
                  )}
                </Field>

                <Field name="confirmPassword">
                  {({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Confirm Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                      error={
                        touched.confirmPassword && !!errors.confirmPassword
                      }
                      helperText={
                        touched.confirmPassword && errors.confirmPassword
                      }
                      InputProps={{
                        style: {
                          backgroundColor: "rgb(56, 56, 56)",
                          color: "#d8fffb",
                          borderRadius: "8px",
                        },
                      }}
                      FormHelperTextProps={{
                        style: { color: "#f44336" },
                      }}
                    />
                  )}
                </Field>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    backgroundColor: "#14b8a6",
                    color: "#fff",
                    py: 1.5,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": { backgroundColor: "#0d9488" },
                    "&:disabled": {
                      backgroundColor: "rgba(20, 184, 166, 0.5)",
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : isOAuthUser || isPasswordCreation ? (
                    "Create Password"
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <Button
                  onClick={() => {
                    setStep(2);
                    setError("");
                  }}
                  startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 12 }} />}
                  fullWidth
                  sx={{
                    color: "#9ca3af",
                    textTransform: "none",
                    "&:hover": {
                      color: "#14b8a6",
                      backgroundColor: "rgba(20, 184, 166, 0.1)",
                    },
                  }}
                >
                  Back to OTP Verification
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </div>
      <ToastNotification
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
};

export default ForgotPassword;
