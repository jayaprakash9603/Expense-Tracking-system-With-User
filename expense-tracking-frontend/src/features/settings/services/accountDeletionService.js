import { api } from "../../../config/api";

const BASE = "/api/user/me/deletion-request";

export async function fetchDeletionStatus() {
  try {
    const res = await api.get(BASE);
    return res.status === 204 ? null : res.data;
  } catch (err) {
    if (err?.response?.status === 404 || err?.response?.status === 204) return null;
    throw err;
  }
}

export async function requestSelfDeletion() {
  const res = await api.post(BASE);
  return res.data;
}

export async function cancelSelfDeletion() {
  const res = await api.delete(BASE);
  return res.data;
}
