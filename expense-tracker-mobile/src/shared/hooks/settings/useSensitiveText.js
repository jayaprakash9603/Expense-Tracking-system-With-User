import { useCallback } from "react";
import { useMasking } from "./useMasking";

export function useSensitiveText() {
  const { isMasked, maskSensitiveData } = useMasking();

  const mask = useCallback(
    (value, visibleChars = 0) => maskSensitiveData(value, visibleChars),
    [maskSensitiveData]
  );

  return { mask, isMasked };
}

export default useSensitiveText;
