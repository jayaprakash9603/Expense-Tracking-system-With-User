import dayjs from "dayjs";

export function toYmd(value) {
  return dayjs(value).format("YYYY-MM-DD");
}
