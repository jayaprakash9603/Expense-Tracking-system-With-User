export function normalizeRequestPath(config) {
  const url = config.url || "";
  if (url.startsWith("http")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url.split("?")[0] || "/";
    }
  }
  return url.split("?")[0] || "/";
}

export function parseRequestBody(config) {
  const d = config.data;
  if (d == null || d === "") return {};
  if (typeof d === "string") {
    try {
      return JSON.parse(d);
    } catch {
      return {};
    }
  }
  return d;
}

export function rejectDemoHttp(status, message) {
  const err = new Error(message);
  err.response = { status, data: { message } };
  return Promise.reject(err);
}

export function resolveDemoData(data, status = 200) {
  return Promise.resolve({
    data,
    status,
    statusText: "OK",
    headers: {},
    config: {},
  });
}
