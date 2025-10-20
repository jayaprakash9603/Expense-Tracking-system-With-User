import React from "react";

const DeleteSelectedButton = ({
  count,
  onDelete,
  isMobile,
  hasWriteAccess,
}) => {
  if (count <= 1 || !hasWriteAccess) return null;
  return (
    <button
      onClick={onDelete}
      style={{
        minWidth: isMobile ? 80 : 140,
        minHeight: isMobile ? 32 : 38,
        width: isMobile ? 100 : 160,
        height: isMobile ? 32 : 38,
        background: "#ff4d4f",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        boxShadow: "0 2px 8px #0002",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: isMobile ? 13 : 15,
        cursor: "pointer",
        transition: "background 0.2s",
        gap: 6,
      }}
      title={`Delete ${count} selected`}
    >
      <svg
        width={isMobile ? 16 : 20}
        height={isMobile ? 16 : 20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
      {!isMobile && <span style={{ marginLeft: 4 }}>Delete Selected</span>}
    </button>
  );
};

export default DeleteSelectedButton;
