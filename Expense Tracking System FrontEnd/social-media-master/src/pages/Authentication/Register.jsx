import React, { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Alert,
  Divider,
} from "@mui/material";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUserAction } from "../../Redux/Auth/auth.action";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import ToastNotification from "../Landingpage/ToastNotification";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { API_BASE_URL } from "../../config/api";
import axios from "axios";
import GoogleLoginButton from "../../components/Auth/GoogleLoginButton";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  gender: "",
};

// Stricter email regex: disallows consecutive dots, leading/trailing dot, invalid chars, numeric IP, short/very long TLDs, underscores or $ in domain, etc.
// Updated: restrict final TLD to 2-9 letters to invalidate extremely long TLDs like 'toolongtld'
const STRICT_EMAIL_REGEX =
  /^(?!.*\.{2})[A-Za-z0-9]+([._%+-][A-Za-z0-9]+)*@(?!(?:[0-9]{1,3}\.){3}[0-9]{1,3}$)(?!-)(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,9}$/;
// Safe name regex allows letters, spaces, apostrophes, and hyphens; disallows angle brackets and script tags
const SAFE_NAME_REGEX = /^[A-Za-z][A-Za-z'\- ]*$/;

const validationSchema = Yup.object({
  firstName: Yup.string()
    .transform((v) => (v == null ? v : v.trim()))
    .required("First Name is required")
    .test(
      "safe-first-name",
      "Invalid characters",
      (v) => !v || SAFE_NAME_REGEX.test(v),
    )
    .max(20, "First Name too long"),
  lastName: Yup.string()
    .transform((v) => (v == null ? v : v.trim()))
    .required("Last Name is required")
    .test(
      "safe-last-name",
      "Invalid characters",
      (v) => !v || SAFE_NAME_REGEX.test(v),
    )
    .max(20, "Last Name too long"),
  email: Yup.string()
    .transform((v) => (v == null ? v : v.trim()))
    .required("Email is required")
    .test("strict-email", "Enter a valid email", (value) => {
      if (!value) return false;
      return STRICT_EMAIL_REGEX.test(value);
    }),
  password: Yup.string()
    .transform((v) => (v == null ? v : v.trim()))
    .required("Password is required")
    .test("min-length", "Password too short", (v) => !v || v.length >= 8)
    .test(
      "has-number",
      "Password must contain a number",
      (v) => !v || /\d/.test(v),
    )
    .test(
      "has-letter",
      "Password must contain a letter",
      (v) => !v || /[A-Za-z]/.test(v),
    )
    .test(
      "has-symbol",
      "Password must contain a symbol",
      (v) => !v || /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v),
    ),
  // gender optional now
});

const Register = () => {
  const [gender, setGender] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/check-email`, {
        email,
      });
      if (!response.data.isAvailable) {
        setEmailError("This email is already taken");
        return false;
      }
      setEmailError("");
      return true;
    } catch (err) {
      setEmailError("Error checking email availability");
      return false;
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    // Normalize & sanitize to prevent XSS or angle bracket injection
    const sanitize = (s) => s?.replace(/[<>]/g, "").trim();
    values.firstName = sanitize(values.firstName);
    values.lastName = sanitize(values.lastName);
    values.email = values.email?.trim();
    values.password = values.password?.trim();
    if (gender) {
      values.gender = gender;
    }
    const isEmailAvailable = await checkEmailAvailability(values.email);
    if (isEmailAvailable) {
      const result = await dispatch(registerUserAction({ data: values }));
      if (result?.success) {
        setToast({
          open: true,
          message: "Registration successful. Please login.",
          severity: "success",
        });
        setTimeout(() => navigate("/login"), 1200);
      }
    }
    setSubmitting(false);
  };

  // Function to get the first error message in priority order
  const getFirstError = (errors, touched, values) => {
    const requiredFields = [
      { name: "firstName", label: errors.firstName },
      { name: "lastName", label: errors.lastName },
      { name: "email", label: errors.email },
      { name: "password", label: errors.password },
      // gender removed from required list
    ];
    const emptyTouchedErrors = requiredFields.filter(
      (f) => touched[f.name] && !values[f.name] && errors[f.name],
    );
    if (emptyTouchedErrors.length >= 2) {
      return "Enter all the mandatory fields";
    }
    // Single field error precedence (same original priority)
    if (touched.firstName && errors.firstName) return errors.firstName;
    if (touched.lastName && errors.lastName) return errors.lastName;
    if (touched.email && errors.email) return errors.email;
    if (emailError) return emailError;
    if (touched.password && errors.password) return errors.password;
    // gender no longer required
    return null;
  };

  return (
    <>
      <Formik
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        initialValues={initialValues}
      >
        {({ values, setFieldValue, errors, touched }) => {
          const currentError = getFirstError(errors, touched, values);

          return (
            <Form className="space-y-4 p-4" noValidate>
              {/* Single Error Message Display */}
              {currentError && (
                <div className="mb-4">
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
                </div>
              )}

              <div>
                <Field
                  as={TextField}
                  name="firstName"
                  placeholder="First Name"
                  type="text"
                  variant="outlined"
                  fullWidth
                  error={
                    touched.firstName && !!errors.firstName && !values.firstName
                  }
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
              </div>
              <div>
                <Field
                  as={TextField}
                  name="lastName"
                  placeholder="Last Name"
                  type="text"
                  variant="outlined"
                  fullWidth
                  error={
                    touched.lastName && !!errors.lastName && !values.lastName
                  }
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
              </div>
              <div>
                <Field
                  as={TextField}
                  name="email"
                  placeholder="Email"
                  type="text" /* suppress native tooltip */
                  variant="outlined"
                  fullWidth
                  error={
                    ((touched.email && !!errors.email) || !!emailError) &&
                    !values.email
                  }
                  onBlur={() => checkEmailAvailability(values.email)}
                  InputProps={{
                    style: {
                      backgroundColor: "rgb(56, 56, 56)",
                      color: "#d8fffb",
                      borderRadius: "8px",
                    },
                  }}
                  inputMode="email"
                  autoComplete="email"
                  InputLabelProps={{ style: { color: "#d8fffb" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#f44336",
                      },
                    },
                  }}
                />
              </div>
              <div>
                <Field name="password">
                  {({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      error={
                        touched.password &&
                        !!errors.password &&
                        !values.password
                      }
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
                <PasswordStrengthMeter password={values.password} />
              </div>

              <div>
                <RadioGroup
                  onChange={(e) => {
                    setGender(e.target.value);
                    setFieldValue("gender", e.target.value);
                  }}
                  aria-label="gender"
                  name="gender"
                  row
                  className="justify-center"
                >
                  <FormControlLabel
                    value="female"
                    control={<Radio style={{ color: "#14b8a6" }} />}
                    label="Female"
                    className="text-gray-400"
                  />
                  <FormControlLabel
                    value="male"
                    control={<Radio style={{ color: "#14b8a6" }} />}
                    label="Male"
                    className="text-gray-400"
                  />
                </RadioGroup>
              </div>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                style={{
                  backgroundColor: "#14b8a6",
                  color: "#d8fffb",
                  padding: "12px 0",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                Register
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

              {/* Google Sign-Up Button */}
              <GoogleLoginButton
                mode="signup"
                onSuccess={() => {
                  setToast({
                    open: true,
                    message: "Google sign-up successful!",
                    severity: "success",
                  });
                }}
                onError={(message) => {
                  setToast({
                    open: true,
                    message: message || "Google sign-up failed",
                    severity: "error",
                  });
                }}
              />

              <div className="flex items-center justify-center gap-2 pt-1">
                <p className="text-gray-400 text-sm m-0">
                  Already have an account?
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  style={{ color: "#14b8a6", textTransform: "none" }}
                >
                  Login
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
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

export default Register;
