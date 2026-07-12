import { useState, useCallback } from "react";
import { authApi } from "@/infrastructure/api/authApi";
import { STRICT_EMAIL_REGEX } from "../validation/registerSchema";

export function useRegisterEmailAvailability(t) {
  const [emailAvailabilityMessage, setEmailAvailabilityMessage] = useState("");

  const clearEmailAvailability = useCallback(() => setEmailAvailabilityMessage(""), []);

  const verifyEmailAvailable = useCallback(
    async (email) => {
      const trimmed = email?.trim();
      if (!trimmed || !STRICT_EMAIL_REGEX.test(trimmed)) {
        setEmailAvailabilityMessage("");
        return true;
      }
      const { data, error } = await authApi.checkEmail(trimmed);
      if (error) {
        setEmailAvailabilityMessage(t("auth.register.emailCheckFailed"));
        return false;
      }
      if (!data?.isAvailable) {
        setEmailAvailabilityMessage(t("auth.register.emailTaken"));
        return false;
      }
      setEmailAvailabilityMessage("");
      return true;
    },
    [t],
  );

  return { emailAvailabilityMessage, clearEmailAvailability, verifyEmailAvailable };
}
