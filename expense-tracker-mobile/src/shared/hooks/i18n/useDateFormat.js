import { useState, useCallback } from "react";
import { STORAGE_KEYS, DEFAULT_DATE_FORMAT } from "@/config/constants";
import { formatDate, formatDateTime, formatRelative } from "@/shared/utils/dateUtils";

export function useDateFormat() {
  const [dateFormat, setDateFormatState] = useState(
    () => localStorage.getItem(STORAGE_KEYS.DATE_FORMAT) || DEFAULT_DATE_FORMAT
  );

  const setDateFormat = useCallback((format) => {
    localStorage.setItem(STORAGE_KEYS.DATE_FORMAT, format);
    setDateFormatState(format);
  }, []);

  return {
    dateFormat,
    setDateFormat,
    formatDate,
    formatDateTime,
    formatRelative,
  };
}

export default useDateFormat;
