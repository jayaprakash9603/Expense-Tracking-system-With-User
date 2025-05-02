import React, { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUserAction } from "../../Redux/Auth/auth.action";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { API_BASE_URL } from "../../config/api";
import axios from "axios";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  gender: "",
};

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  gender: Yup.string().required("Gender is required"),
});

const Register = () => {
  const [gender, setGender] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    gender: Yup.string().required("Gender is required"),
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
    values.gender = gender;
    const isEmailAvailable = await checkEmailAvailability(values.email);
    if (isEmailAvailable) {
      dispatch(registerUserAction({ data: values }));
    }
    setSubmitting(false);
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-4">
          <div className="min-h-[80px]">
            <Field
              as={TextField}
              name="firstName"
              placeholder="First Name"
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
              name="firstName"
              component="div"
              className="text-red-500 text-sm mt-1 min-h-[20px]"
            />
          </div>
          <div className="min-h-[80px]">
            <Field
              as={TextField}
              name="lastName"
              placeholder="Last Name"
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
              name="lastName"
              component="div"
              className="text-red-500 text-sm mt-1 min-h-[20px]"
            />
          </div>
          <div className="min-h-[80px]">
            <Field
              as={TextField}
              name="email"
              placeholder="Email"
              type="email"
              variant="outlined"
              fullWidth
              onBlur={() => checkEmailAvailability(values.email)}
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
            {emailError && (
              <div className="text-red-500 text-sm mt-1 min-h-[20px]">
                {emailError}
              </div>
            )}
          </div>
          <div className="min-h-[110px]">
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
                          {showPassword ? <VisibilityOff /> : <Visibility />}
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
              className="text-red-500 text-sm mt-2 min-h-[20px]"
            />
            <PasswordStrengthMeter password={values.password} />
          </div>

          <div className="min-h-[40px]">
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
            <ErrorMessage
              name="gender"
              component="div"
              className="text-red-500 text-sm text-center min-h-[20px]"
            />
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
      )}
    </Formik>
  );
};

export default Register;
