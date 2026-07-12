function toTypePrefix(name) {
  return String(name)
    .replace(/-/g, "_")
    .toUpperCase();
}

export function createEntitySlice({ name, fetchListApi, listKey = "list" }) {
  const prefix = toTypePrefix(name);
  const REQUEST = `FETCH_${prefix}_REQUEST`;
  const SUCCESS = `FETCH_${prefix}_SUCCESS`;
  const FAILURE = `FETCH_${prefix}_FAILURE`;

  const fetchListAction = (params) => async (dispatch) => {
    dispatch({ type: REQUEST });
    const { data, error } = await fetchListApi(params);
    if (error) {
      dispatch({ type: FAILURE, payload: error.message });
      return { success: false, error };
    }
    dispatch({ type: SUCCESS, payload: data });
    return { success: true, data };
  };

  const applyRequest = (state) => ({ ...state, loading: true, error: null });

  const applySuccess = (state, action) => ({
    ...state,
    loading: false,
    [listKey]: Array.isArray(action.payload) ? action.payload : [],
  });

  const applyFailure = (state, action) => ({
    ...state,
    loading: false,
    error: action.payload,
  });

  return {
    typeNames: { REQUEST, SUCCESS, FAILURE },
    fetchListAction,
    applyRequest,
    applySuccess,
    applyFailure,
  };
}
