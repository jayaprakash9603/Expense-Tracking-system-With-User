const AXIOS_ERROR_FLAG = "__axiosHandled__";

const shouldHandle = (error) => {
  if (!error) return false;
  if (error[AXIOS_ERROR_FLAG]) return false;
  return true;
};

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    if (!event?.reason) return;
    if (!shouldHandle(event.reason)) return;
  });

  window.addEventListener("error", (event) => {
    if (!event?.error) return;
    if (!shouldHandle(event.error)) return;
  });
}
