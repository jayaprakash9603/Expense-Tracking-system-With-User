import React from "react";
import { ASYNC_STATES } from "@/shared/standards/asyncStates";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { ErrorState } from "@/shared/components/feedback/ErrorState";

/**
 * @param {{status: string, hasData?: boolean, emptyProps?: object, errorProps?: object, loadingProps?: object, children: React.ReactNode}} props
 */
export function AsyncStateView({
  status,
  hasData = true,
  emptyProps,
  errorProps,
  loadingProps,
  children,
}) {
  if (status === ASYNC_STATES.LOADING) {
    return <LoadingSpinner {...loadingProps} />;
  }

  if (status === ASYNC_STATES.ERROR) {
    return <ErrorState {...errorProps} />;
  }

  if (!hasData) {
    return <EmptyState {...emptyProps} />;
  }

  return <>{children}</>;
}

export default AsyncStateView;
