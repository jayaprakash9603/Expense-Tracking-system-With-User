import { api } from "../../../config/api";

const BASE = "/api/user/me/deletion-request";
const REQUEST_TIMEOUT_MS = 12000;

const withTimeout = (promise, timeoutMs = REQUEST_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
    }),
  ]);

export async function fetchDeletionStatus() {
  try {
    const res = await withTimeout(api.get(BASE));
    return res.status === 204 ? null : res.data;
  } catch (err) {
    if (err?.response?.status === 404 || err?.response?.status === 204) return null;
    throw err;
  }
}

export async function requestSelfDeletion() {
  const res = await withTimeout(api.post(BASE));
  return res.data;
}

export async function cancelSelfDeletion() {
  const res = await withTimeout(api.delete(BASE));
  return res.data;
}
