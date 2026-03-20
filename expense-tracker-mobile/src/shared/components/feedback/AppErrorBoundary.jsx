import React from "react";
import { ErrorState } from "@/shared/components/feedback/ErrorState";

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
      return (
        <ErrorState
          title="Unexpected UI Error"
          message="The app hit an unexpected problem. Reload to continue."
          onRetry={() => window.location.reload()}
          retryLabel="Reload"
        />
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
