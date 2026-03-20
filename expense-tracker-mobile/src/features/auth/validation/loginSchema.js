import * as Yup from "yup";
import { STRICT_EMAIL_REGEX } from "./registerSchema";

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
