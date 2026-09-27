export const listBills = async (repo, params = {}) => {
  if (!repo || typeof repo.list !== "function") {
    throw new Error("listBills requires a BillRepository");
  }
  return repo.list(params);
};
