import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const hasValues = (state) =>
  state && Object.keys(state).length > 0;

const usePreserveNavigationState = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const preservedState = useMemo(
    () => ({ ...(location.state || {}) }),
    [location.state]
  );

  const buildState = useCallback(
    (extraState) => {
      const merged = { ...preservedState, ...(extraState || {}) };
      return hasValues(merged) ? merged : undefined;
    },
    [preservedState]
  );

  const navigateWithState = useCallback(
    (to, options = {}) => {
      if (typeof to === "number") {
        navigate(to);
        return;
      }

      const { state: nextState, preserve = true, ...rest } = options;
      const finalState = preserve
        ? buildState(nextState)
        : hasValues(nextState || {})
        ? nextState
        : undefined;

      navigate(to, {
        ...rest,
        state: finalState,
      });
    },
    [buildState, navigate]
  );

  return {
    preservedState,
    buildState,
    navigateWithState,
  };
};

export default usePreserveNavigationState;
