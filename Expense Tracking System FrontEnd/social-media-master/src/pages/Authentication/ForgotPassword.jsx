import React, { useState } from "react";
import { Card, TextField, Button, CircularProgress } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  loginUserAction,
  registerUserAction,
} from "../../Redux/Auth/auth.action";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const ForgotPassword = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (values) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        email: values.email,
      });
      setEmail(values.email);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (values) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email,
        otp: values.otp,
      });
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setIsLoading(true);
    try {
      await axios.patch(`${API_BASE_URL}/auth/reset-password`, {
        email,
        password: values.password,
      });
      onBack();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to reset password. Please try again."
      );
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

  return (
    <div className="space-y-4">
      {step === 1 && (
        <Formik
          onSubmit={handleSendOtp}
          validationSchema={emailSchema}
          initialValues={{ email: "" }}
        >
          <Form>
            <div className="min-h-[80px]">
              <Field
                as={TextField}
                name="email"
                placeholder="Enter your email"
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
              {error && (
                <div className="text-red-500 text-sm mt-1 min-h-[20px]">
                  {error}
                </div>
              )}
            </div>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              style={{
                backgroundColor: "#14b8a6",
                color: "#d8fffb",
                padding: "12px 0",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Send OTP"}
            </Button>
            <Button
              onClick={onBack}
              style={{ color: "#14b8a6", textTransform: "none" }}
              className="mt-4"
            >
              Back to Login
            </Button>
          </Form>
        </Formik>
      )}
      {step === 2 && (
        <Formik
          onSubmit={handleVerifyOtp}
          validationSchema={otpSchema}
          initialValues={{ otp: "" }}
        >
          <Form>
            <div className="min-h-[80px]">
              <Field
                as={TextField}
                name="otp"
                placeholder="Enter OTP"
                type="text"
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
                name="otp"
                component="div"
                className="text-red-500 text-sm mt-1 min-h-[20px]"
              />
              {error && (
                <div className="text-red-500 text-sm mt-1 min-h-[20px]">
                  {error}
                </div>
              )}
            </div>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              style={{
                backgroundColor: "#14b8a6",
                color: "#d8fffb",
                padding: "12px 0",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Verify OTP"}
            </Button>
            <Button
              onClick={() => setStep(1)}
              style={{ color: "#14b8a6", textTransform: "none" }}
              className="mt-4"
            >
              Back
            </Button>
          </Form>
        </Formik>
      )}
      {step === 3 && (
        <Formik
          onSubmit={handleResetPassword}
          validationSchema={passwordSchema}
          initialValues={{ password: "", confirmPassword: "" }}
        >
          <Form className="space-y-4">
            <div className="min-h-[80px]">
              <Field
                as={TextField}
                name="password"
                placeholder="New Password"
                type="password"
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
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1 min-h-[20px]"
              />
            </div>
            <div className="min-h-[80px]">
              <Field
                as={TextField}
                name="confirmPassword"
                placeholder="Confirm Password"
                type="password"
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
                name="confirmPassword"
                component="div"
                className="text-red-500 text-sm mt-1 min-h-[20px]"
              />
            </div>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              style={{
                backgroundColor: "#14b8a6",
                color: "#d8fffb",
                padding: "12px 0",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Reset Password"}
            </Button>
            <Button
              onClick={() => setStep(2)}
              style={{ color: "#14b8a6", textTransform: "none" }}
              className="mt-4"
            >
              Back
            </Button>
          </Form>
        </Formik>
      )}
    </div>
  );
};

export default ForgotPassword;
