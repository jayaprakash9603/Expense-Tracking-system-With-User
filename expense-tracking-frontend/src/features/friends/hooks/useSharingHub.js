import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchISharedWith,
  fetchSharedWithMe,
  fetchExpenseSharingSummary,
  fetchRecommendedToShare,
  quickShareExpenses,
  batchShareExpenses,
} from "../../../Redux/Friends/friendsActions";

export function useSharingHub() {
  const dispatch = useDispatch();

  const iSharedWith = useSelector((state) => state.friends?.iSharedWith ?? []);
  const loadingISharedWith = useSelector((state) => state.friends?.loadingISharedWith ?? false);
  const iSharedWithError = useSelector((state) => state.friends?.iSharedWithError ?? null);

  const sharedWithMe = useSelector((state) => state.friends?.sharedWithMe ?? []);
  const loadingSharedWithMe = useSelector((state) => state.friends?.loadingSharedWithMe ?? false);
  const sharedWithMeError = useSelector((state) => state.friends?.sharedWithMeError ?? null);

  const expenseSharingSummary = useSelector((state) => state.friends?.expenseSharingSummary ?? null);
  const loadingExpenseSharingSummary = useSelector(
    (state) => state.friends?.loadingExpenseSharingSummary ?? false
  );
  const expenseSharingSummaryError = useSelector(
    (state) => state.friends?.expenseSharingSummaryError ?? null
  );

  const recommendedToShare = useSelector((state) => state.friends?.recommendedToShare ?? []);
  const loadingRecommendedToShare = useSelector(
    (state) => state.friends?.loadingRecommendedToShare ?? false
  );
  const recommendedToShareError = useSelector(
    (state) => state.friends?.recommendedToShareError ?? null
  );

  useEffect(() => {
    dispatch(fetchISharedWith());
    dispatch(fetchSharedWithMe());
    dispatch(fetchExpenseSharingSummary());
    dispatch(fetchRecommendedToShare());
  }, [dispatch]);

  const handleQuickShare = useCallback(
    (userId, accessLevel) => dispatch(quickShareExpenses(userId, accessLevel)),
    [dispatch]
  );

  const handleBatchShare = useCallback(
    (items) => dispatch(batchShareExpenses(items)),
    [dispatch]
  );

  return {
    iSharedWith,
    loadingISharedWith,
    iSharedWithError,
    sharedWithMe,
    loadingSharedWithMe,
    sharedWithMeError,
    expenseSharingSummary,
    loadingExpenseSharingSummary,
    expenseSharingSummaryError,
    recommendedToShare,
    loadingRecommendedToShare,
    recommendedToShareError,
    handleQuickShare,
    handleBatchShare,
  };
}
