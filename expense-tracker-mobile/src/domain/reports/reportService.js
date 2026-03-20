import { reportApi } from "@/infrastructure/api";

/**
 * @param {any} payload
 * @returns {Promise<import('@/shared/contracts/api').ApiResult<any>>}
 */
async function generate(payload) {
  return reportApi.generate(payload);
}

/**
 * @param {Record<string, any>} params
 * @returns {Promise<import('@/shared/contracts/api').ApiResult<any[]>>}
 */
async function history(params) {
  return reportApi.getHistory(params);
}

export const reportService = {
  generate,
  history,
  getById: reportApi.getById,
  remove: reportApi.delete,
  download: reportApi.download,
};

export default reportService;
