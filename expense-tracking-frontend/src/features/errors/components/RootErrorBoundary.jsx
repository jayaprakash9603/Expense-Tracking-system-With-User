import React from "react";
import { API_BASE_URL } from "../../../config/api";

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
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

  handleGoHome = () => {
    window.location.href = "/";
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      const isLocalhost =
        typeof API_BASE_URL === "string" && API_BASE_URL.includes("localhost");

      const accent = "var(--color-primary-accent, #14b8a6)";
      const accentRaw = "#14b8a6";

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
            fontFamily:
              "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
            background: "var(--color-tertiary-bg, #0b0b0b)",
            color: "var(--color-primary-text, #e5e5e5)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "var(--color-primary-bg, #141414)",
              border: "1px solid var(--color-border-color, #2a2a2a)",
              borderRadius: 16,
              padding: "48px 36px 36px",
              textAlign: "center",
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border-color, #2a2a2a)`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${accentRaw}22, ${accentRaw}08)`,
                border: `2px solid ${accentRaw}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke={accentRaw}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1
              style={{
                fontSize: "1.375rem",
                fontWeight: 600,
                margin: "0 0 8px",
                color: "var(--color-primary-text, #e5e5e5)",
                letterSpacing: "-0.01em",
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-secondary-text, #aaa)",
                margin: "0 0 20px",
                lineHeight: 1.6,
              }}
            >
              An unexpected error occurred. Try reloading the page or returning
              to the home screen.
            </p>

            {isLocalhost && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "#fbbf2410",
                  border: "1px solid #fbbf2433",
                  borderRadius: 10,
                  marginBottom: 20,
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "#fbbf24",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  <strong>API is pointing to localhost.</strong> On Netlify, set{" "}
                  <code
                    style={{
                      background: "#fbbf2418",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                    }}
                  >
                    REACT_APP_API_BASE_URL
                  </code>{" "}
                  to your backend URL in Site settings → Environment variables.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={this.toggleDetails}
              style={{
                background: "none",
                border: "none",
                color: accent,
                fontSize: "0.8125rem",
                cursor: "pointer",
                padding: "4px 0",
                marginBottom: this.state.showDetails ? 8 : 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {this.state.showDetails ? "Hide" : "Show"} error details
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: this.state.showDetails
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {this.state.showDetails && (
              <pre
                style={{
                  padding: "12px 14px",
                  background: "var(--color-secondary-bg, #1a1a1a)",
                  border: "1px solid var(--color-border-color, #2a2a2a)",
                  borderRadius: 10,
                  fontSize: "0.75rem",
                  overflow: "auto",
                  maxHeight: 140,
                  textAlign: "left",
                  marginBottom: 24,
                  color: "var(--color-error, #ef4444)",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error?.message || String(this.state.error)}
              </pre>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: "10px 24px",
                  background: accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  padding: "10px 24px",
                  background: "var(--color-secondary-bg, #1a1a1a)",
                  color: "var(--color-primary-text, #e5e5e5)",
                  border: "1px solid var(--color-border-color, #2a2a2a)",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                Go Home
              </button>
              <button
                type="button"
                onClick={this.handleLogout}
                style={{
                  padding: "10px 24px",
                  background: "transparent",
                  color: "var(--color-error, #ef4444)",
                  border: "1px solid var(--color-error, #ef4444)33",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default RootErrorBoundary;
