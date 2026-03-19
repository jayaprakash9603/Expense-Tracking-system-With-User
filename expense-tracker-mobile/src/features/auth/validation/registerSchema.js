import * as Yup from "yup";

const STRICT_EMAIL_REGEX =
  /^(?!.*\.\.)[A-Za-z0-9]+([._%+-][A-Za-z0-9]+)*@(?!(?:[0-9]{1,3}\.){3}[0-9]{1,3}$)(?!-)(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,9}$/;

const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const registerSchema = Yup.object({
  firstName: Yup.string()
    .required("auth.validation.firstNameRequired")
    .min(2, "auth.validation.firstNameMinLength"),
  lastName: Yup.string()
    .required("auth.validation.lastNameRequired")
    .min(2, "auth.validation.lastNameMinLength"),
  email: Yup.string()
    .required("auth.validation.emailRequired")
    .test("strict-email", "auth.validation.emailInvalid", (value) => {
      if (!value) return false;
      return STRICT_EMAIL_REGEX.test(value.trim());
    }),
  password: Yup.string()
    .required("auth.validation.passwordRequired")
    .min(8, "auth.validation.passwordMinLength")
    .matches(PASSWORD_STRENGTH_REGEX, "auth.validation.passwordStrength"),
  confirmPassword: Yup.string()
    .required("auth.validation.passwordRequired")
    .oneOf([Yup.ref("password")], "auth.validation.passwordsDoNotMatch"),
});

export const registerInitialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};
