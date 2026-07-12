import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { STORAGE_KEYS, DEFAULT_DATE_FORMAT } from "@/config/app/constants";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

function getStoredFormat() {
  return localStorage.getItem(STORAGE_KEYS.DATE_FORMAT) || DEFAULT_DATE_FORMAT;
}

export function formatDate(date) {
  if (!date) return "";
  return dayjs(date).format(getStoredFormat());
}

export function formatDateTime(date) {
  if (!date) return "";
  return dayjs(date).format(`${getStoredFormat()} HH:mm`);
}

export function formatRelative(date) {
  if (!date) return "";
  return dayjs(date).fromNow();
}

export function setDateLocale(locale) {
  import(/* @vite-ignore */ `dayjs/locale/${locale}.js`)
    .then(() => dayjs.locale(locale))
    .catch(() => dayjs.locale("en"));
}

export function getToday() {
  return new Date().toISOString().split("T")[0];
}
