import React from "react";
import { API_BASE_URL } from "../../../config/api";

/**
 * Catches uncaught errors in the app tree and shows a fallback UI instead of a blank page.
 * Helps debug "white screen" after login on production (e.g. Netlify) when something throws.
 */
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("RootErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleLogout = () => {
    localStorage.removeItem("jwt");
    window.location.href = "/login";
  };

  render() {
    if (this.state.hasError) {
      const isLocalhost = typeof API_BASE_URL === "string" && API_BASE_URL.includes("localhost");
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            background: "#0f172a",
            color: "#e2e8f0",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#94a3b8", marginBottom: 16, textAlign: "center", maxWidth: 480 }}>
            The app hit an error. This often happens after login if the API URL is not set correctly for production.
          </p>
          {isLocalhost && (
            <p style={{ color: "#fbbf24", marginBottom: 16, textAlign: "center", maxWidth: 480 }}>
              API is pointing to localhost. On Netlify, set <strong>REACT_APP_API_BASE_URL</strong> to your backend URL in Site settings → Environment variables.
            </p>
          )}
          <pre
            style={{
              padding: 12,
              background: "#1e293b",
              borderRadius: 8,
              fontSize: 12,
              overflow: "auto",
              maxWidth: "100%",
              marginBottom: 24,
            }}
          >
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                padding: "10px 20px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.handleLogout}
              style={{
                padding: "10px 20px",
                background: "#475569",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Logout and go to Login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default RootErrorBoundary;
