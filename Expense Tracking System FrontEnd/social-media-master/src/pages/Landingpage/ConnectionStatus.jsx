import React from "react";
import { useSocketConnection } from "../../utils/useSocketEvent";

const ConnectionStatus = () => {
  const { isConnected, connectionError } = useSocketConnection();

  if (!isConnected && !connectionError) {
    return null; // Don't show anything if not trying to connect
  }

  return (
    <div
      className={`connection-status ${
        isConnected ? "connected" : "disconnected"
      }`}
    >
      {isConnected ? (
        <span className="status-indicator">🟢 Real-time connected</span>
      ) : (
        <span className="status-indicator">
          🔴 Connection lost
          {connectionError && (
            <span className="error-text"> - {connectionError}</span>
          )}
        </span>
      )}
      <style jsx>{`
        .connection-status {
          position: fixed;
          top: 10px;
          right: 10px;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .connection-status.connected {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .connection-status.disconnected {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .error-text {
          font-weight: normal;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default ConnectionStatus;
