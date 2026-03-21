import { categoryApi } from "@/infrastructure/api";
import { createEntitySlice } from "@/redux/createEntitySlice";

const listSlice = createEntitySlice({
  name: "categories",
  fetchListApi: (params) => categoryApi.getAll(params),
});

export const fetchCategoriesAction = listSlice.fetchListAction;

export const categoriesListSliceHelpers = {
  applyRequest: listSlice.applyRequest,
  applySuccess: listSlice.applySuccess,
  applyFailure: listSlice.applyFailure,
};
