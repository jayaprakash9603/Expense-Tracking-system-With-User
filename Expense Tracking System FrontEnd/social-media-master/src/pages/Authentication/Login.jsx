import React, { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  Button,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUserAction } from "../../Redux/Auth/auth.action";
import ForgotPassword from "./ForgotPassword";

const initialValues = { email: "", password: "" };

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    const result = await dispatch(loginUserAction({ data: values }));
    if (!result.success) {
      setError(result.message);
    } else {
      navigate("/");
    }
    setSubmitting(false);
  };

  return (
    <div className="p-3">
      {!showForgotPassword ? (
        <Formik
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          initialValues={initialValues}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              {/* Email Field */}
              <div className="min-h-[80px]">
                <Field
                  as={TextField}
                  name="email"
                  placeholder="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    style: {
                      backgroundColor: "rgb(56, 56, 56)",
                      color: "#d8fffb",
                      borderRadius: "8px",
                    },
                  }}
                  InputLabelProps={{ style: { color: "#d8fffb" } }}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1 min-h-[20px]"
                />
                {error?.toLowerCase().includes("email") && (
                  <div className="text-red-500 text-sm mt-1 min-h-[20px]">
                    {error}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="min-h-[80px]">
                <Field name="password">
                  {({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
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
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1 min-h-[20px]"
                />
                {!error?.toLowerCase().includes("email") && error && (
                  <div className="text-red-500 text-sm mt-1 min-h-[20px]">
                    {error}
                  </div>
                )}
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

              {/* Links */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <p
                  className="cursor-pointer"
                  onClick={() => setShowForgotPassword(true)}
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
          )}
        </Formik>
      ) : (
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login;
