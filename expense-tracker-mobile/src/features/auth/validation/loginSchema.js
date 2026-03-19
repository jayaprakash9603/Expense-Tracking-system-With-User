import * as Yup from "yup";

const STRICT_EMAIL_REGEX =
  /^(?!.*\.\.)[A-Za-z0-9]+([._%+-][A-Za-z0-9]+)*@(?!(?:[0-9]{1,3}\.){3}[0-9]{1,3}$)(?!-)(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,9}$/;

export const loginSchema = Yup.object({
  email: Yup.string()
    .required("auth.validation.emailRequired")
    .test("strict-email", "auth.validation.emailInvalid", (value) => {
      if (!value) return false;
      return STRICT_EMAIL_REGEX.test(value.trim());
    }),
  password: Yup.string().required("auth.validation.passwordRequired"),
});

export const loginInitialValues = { email: "", password: "" };
