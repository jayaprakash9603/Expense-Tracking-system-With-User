import { useCallback, useMemo } from "react";
import { useUserSettings } from "./useUserSettings";

const MASK_CHAR = "•";
const MASKED_AMOUNT = "••••";

export function useMasking() {
  const { settings } = useUserSettings();
  const isMasked = useMemo(() => settings?.maskSensitiveData ?? false, [settings]);

  const toggleMasking = useCallback(() => {
    return !isMasked;
  }, [isMasked]);

  const maskSensitiveData = useCallback(
    (value, visibleChars = 0) => {
      if (!isMasked) return String(value ?? "");
      const str = String(value ?? "");
      if (visibleChars > 0 && str.length > visibleChars) {
        return MASK_CHAR.repeat(str.length - visibleChars) + str.slice(-visibleChars);
      }
      return MASK_CHAR.repeat(Math.max(str.length, 4));
    },
    [isMasked]
  );

  const maskAmount = useCallback(
    (amount) => {
      if (!isMasked) return amount;
      return MASKED_AMOUNT;
    },
    [isMasked]
  );

  const formatMaskedAmount = useCallback(
    (amount, currencySymbol = "₹") => {
      if (!isMasked) return `${currencySymbol}${Number(amount || 0).toLocaleString()}`;
      return `${currencySymbol}${MASKED_AMOUNT}`;
    },
    [isMasked]
  );

  return { isMasked, toggleMasking, maskSensitiveData, maskAmount, formatMaskedAmount };
}

export default useMasking;
