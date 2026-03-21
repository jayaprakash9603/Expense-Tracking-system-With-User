import React from "react";
import { ErrorState } from "@/shared/components/feedback/ErrorState";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

function AppErrorBoundaryFallback({ onRetry }) {
  const { t } = useLanguage();
  return (
    <ErrorState
      title={t("system.errorBoundary.title")}
      message={t("system.errorBoundary.message")}
      onRetry={onRetry}
      retryLabel={t("common.reload")}
    />
  );
}

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error("AppErrorBoundary captured error", error);
  }

  render() {
    if (this.state.hasError) {
      return <AppErrorBoundaryFallback onRetry={() => window.location.reload()} />;
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
