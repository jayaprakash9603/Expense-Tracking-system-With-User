import React, { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  Button,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUserAction,
  verifyTwoFactorOtpAction,
} from "../../Redux/Auth/auth.action";
import GoogleLoginButton from "../../components/Auth/GoogleLoginButton";

const initialValues = { email: "", password: "" };

// Updated: restrict final TLD to 2-9 letters
const STRICT_EMAIL_REGEX =
  /^(?!.*\.\.)[A-Za-z0-9]+([._%+-][A-Za-z0-9]+)*@(?!(?:[0-9]{1,3}\.){3}[0-9]{1,3}$)(?!-)(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,9}$/;

const validationSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .test("strict-email", "Enter a valid email", (value) => {
      if (!value) return false;
      return STRICT_EMAIL_REGEX.test(value.trim());
    }),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const navigateAfterLogin = (result) => {
    const { currentMode, role, user } = result;

    console.log("Login Navigation Debug:", {
      currentMode,
      role,
      userRole: user?.role,
      fullUser: user,
    });

    if (currentMode === "ADMIN" || role === "ADMIN" || user?.role === "ADMIN") {
      console.log("Navigating to ADMIN dashboard");
      navigate("/admin/dashboard");
    } else {
      console.log("Navigating to USER dashboard");
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    const result = await dispatch(loginUserAction({ data: values }));
    if (!result.success) {
      // Check if this is an OAuth user without password
      if (result.message === "OAUTH_NO_PASSWORD") {
        // Navigate to create password page with email
        navigate(`/create-password?email=${encodeURIComponent(values.email)}`);
        setSubmitting(false);
        return;
      }

      if (result.twoFactorRequired) {
        setOtpEmail(result.email || values.email);
        setOtp("");
        setOtpError("");
        setOtpDialogOpen(true);
        setSubmitting(false);
        return;
      } else {
        setError(result.message);
      }
    } else {
      navigateAfterLogin(result);
    }
    setSubmitting(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpEmail || !otp) {
      setOtpError("Enter the OTP sent to your email");
      return;
    }

    setOtpError("");
    setIsVerifyingOtp(true);
    try {
      const result = await dispatch(
        verifyTwoFactorOtpAction({ email: otpEmail, otp: otp.trim() }),
      );

      if (!result.success) {
        setOtpError(result.message || "OTP verification failed");
        return;
      }

      setOtpDialogOpen(false);
      navigateAfterLogin(result);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Function to handle forgot password click
  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");
  };

  // Function to get the first error message in priority order
  const getFirstError = (errors, touched) => {
    // If both fields are touched (formik does this on submit) & both have errors -> show unified message
    if (touched.email && touched.password && errors.email && errors.password) {
      return "Enter all the mandatory fields";
    }
    // Priority order: email, password, then login/server error
    if (touched.email && errors.email) return errors.email;
    if (touched.password && errors.password) return errors.password;
    if (error) return error;
    return null;
  };

  return (
    <div className="p-3">
      <Formik
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        initialValues={initialValues}
      >
        {({ isSubmitting, values, errors, touched }) => {
          const currentError = getFirstError(errors, touched);

          return (
            <Form className="space-y-4" noValidate>
              {/* Further Reduced Height Error Message Container */}
              <div className="min-h-[10px] mb-1">
                {currentError && (
                  <Alert
                    severity="error"
                    sx={{
                      backgroundColor: "rgba(244, 67, 54, 0.1)",
                      color: "#f44336",
                      "& .MuiAlert-icon": {
                        color: "#f44336",
                      },
                    }}
                  >
                    {currentError}
                  </Alert>
                )}
              </div>

              {/* Email Field (clears server error on edit) */}
              <div>
                <Field name="email">
                  {({ field, form }) => (
                    <TextField
                      {...field}
                      placeholder="Email"
                      type="text" /* use text to suppress native email tooltip */
                      variant="outlined"
                      fullWidth
                      error={touched.email && !!errors.email}
                      onChange={(e) => {
                        field.onChange(e);
                        if (error) setError("");
                      }}
                      onFocus={() => {
                        if (error) setError("");
                      }}
                      inputMode="email"
                      autoComplete="email"
                      InputProps={{
                        style: {
                          backgroundColor: "rgb(56, 56, 56)",
                          color: "#d8fffb",
                          borderRadius: "8px",
                        },
                      }}
                      InputLabelProps={{ style: { color: "#d8fffb" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#f44336",
                          },
                        },
                      }}
                    />
                  )}
                </Field>
              </div>

              {/* Password Field (clears server error on edit) */}
              <div>
                <Field name="password">
                  {({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      error={touched.password && !!errors.password}
                      onChange={(e) => {
                        field.onChange(e);
                        if (error) setError("");
                      }}
                      onFocus={() => {
                        if (error) setError("");
                      }}
                      InputProps={{
                        style: {
                          backgroundColor: "rgb(56, 56, 56)",
                          color: "#d8fffb",
                          borderRadius: "8px",
                        },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              style={{ color: "#14b8a6" }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{ style: { color: "#d8fffb" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#f44336",
                          },
                        },
                      }}
                    />
                  )}
                </Field>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                style={{
                  backgroundColor: "#14b8a6",
                  color: "#d8fffb",
                  padding: "12px 0",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-2 py-2">
                <Divider
                  sx={{ flex: 1, borderColor: "rgba(255,255,255,0.2)" }}
                />
                <span className="text-gray-400 text-sm">or</span>
                <Divider
                  sx={{ flex: 1, borderColor: "rgba(255,255,255,0.2)" }}
                />
              </div>

              {/* Google Sign-In Button */}
              <GoogleLoginButton
                mode="signin"
                onError={(message) => setError(message)}
                disabled={isSubmitting}
              />

              {/* Links */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <p
                  className="cursor-pointer"
                  onClick={handleForgotPasswordClick}
                  style={{ color: "#14b8a6", textTransform: "none" }}
                >
                  Forgot Password?
                </p>
                <Button
                  onClick={() => navigate("/register")}
                  style={{
                    backgroundColor: "#14b8a6",
                    color: "#ffffff",
                    padding: "10px 50px",
                    border: "none",
                    borderRadius: "4px",
                    textTransform: "none",
                    cursor: "pointer",
                  }}
                >
                  Register
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>

      <Dialog
        open={otpDialogOpen}
        onClose={() => {
          setOtpDialogOpen(false);
          setOtp("");
          setOtpError("");
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the OTP sent to {otpEmail} to complete login.
          </Typography>

          {otpError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {otpError}
            </Alert>
          )}

          <TextField
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(next);
              if (otpError) setOtpError("");
            }}
            fullWidth
            inputMode="numeric"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOtpDialogOpen(false);
              setOtp("");
              setOtpError("");
            }}
            disabled={isVerifyingOtp}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleVerifyOtp}
            disabled={isVerifyingOtp}
          >
            {isVerifyingOtp ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Verify"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;
