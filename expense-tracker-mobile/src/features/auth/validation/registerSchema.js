import * as Yup from "yup";

export const STRICT_EMAIL_REGEX =
  /^(?!.*\.{2})[A-Za-z0-9]+([._%+-][A-Za-z0-9]+)*@(?!(?:[0-9]{1,3}\.){3}[0-9]{1,3}$)(?!-)(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,9}$/;

const SAFE_NAME_REGEX = /^[A-Za-z][A-Za-z'\- ]*$/;

const PASSWORD_SYMBOL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export const registerSchema = Yup.object({
  firstName: Yup.string()
    .transform((v) => (v == null ? v : String(v).trim()))
    .required("auth.validation.firstNameRequired")
    .test("safe-first-name", "auth.validation.nameInvalid", (v) => !v || SAFE_NAME_REGEX.test(v))
    .max(20, "auth.validation.firstNameTooLong"),
  lastName: Yup.string()
    .transform((v) => (v == null ? v : String(v).trim()))
    .required("auth.validation.lastNameRequired")
    .test("safe-last-name", "auth.validation.nameInvalid", (v) => !v || SAFE_NAME_REGEX.test(v))
    .max(20, "auth.validation.lastNameTooLong"),
  email: Yup.string()
    .transform((v) => (v == null ? v : String(v).trim()))
    .required("auth.validation.emailRequired")
    .test("strict-email", "auth.validation.emailInvalid", (value) => {
      if (!value) return false;
      return STRICT_EMAIL_REGEX.test(value);
    }),
  password: Yup.string()
    .transform((v) => (v == null ? v : String(v).trim()))
    .required("auth.validation.passwordRequired")
    .test("min-length", "auth.validation.passwordMinLength", (v) => !v || v.length >= 8)
    .test("has-number", "auth.validation.passwordNeedNumber", (v) => !v || /\d/.test(v))
    .test("has-letter", "auth.validation.passwordNeedLetter", (v) => !v || /[A-Za-z]/.test(v))
    .test("has-symbol", "auth.validation.passwordNeedSymbol", (v) => !v || PASSWORD_SYMBOL_REGEX.test(v)),
  confirmPassword: Yup.string()
    .transform((v) => (v == null ? v : String(v).trim()))
    .required("auth.validation.passwordRequired")
    .oneOf([Yup.ref("password")], "auth.validation.passwordsDoNotMatch"),
  gender: Yup.mixed().oneOf(["male", "female", ""]),
});

export const registerInitialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
};
