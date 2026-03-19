import { useCallback } from "react";
import { useMasking } from "./useMasking";
import { useUserSettings } from "./useUserSettings";
import { formatMoney, CURRENCY_MAP } from "@/domain/shared/money";

export function useMoneyFormatter() {
  const { isMasked, formatMaskedAmount } = useMasking();
  const { settings } = useUserSettings();
  const currency = settings?.currency || "INR";

  const format = useCallback(
    (amount, currencyCode, options) => {
      const code = currencyCode || currency;
      if (isMasked) {
        const symbol = CURRENCY_MAP[code]?.symbol || "₹";
        return formatMaskedAmount(amount, symbol);
      }
      return formatMoney(amount, code, options);
    },
    [isMasked, formatMaskedAmount, currency]
  );

  const formatCompact = useCallback(
    (amount, currencyCode) => {
      const code = currencyCode || currency;
      if (isMasked) {
        const symbol = CURRENCY_MAP[code]?.symbol || "₹";
        return formatMaskedAmount(amount, symbol);
      }
      return formatMoney(amount, code, { compact: true });
    },
    [isMasked, formatMaskedAmount, currency]
  );

  return { format, formatCompact, isMasked, currency };
}

export default useMoneyFormatter;
