import React, { useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Reusable navigation bar with shortcut buttons and an optional Add New popover.
 * Props allow reuse in other pages with different routes or icons.
 */
export default function QuickNavBar({
  items = [],
  isMobile,
  isFriendView,
  friendId,
  navigate,
  hasWriteAccess,
  addNewPopoverOpen,
  setAddNewPopoverOpen,
  setAddNewBtnRef,
}) {
  const localBtnRef = useRef(null);

  // If caller doesn't provide external ref setter, still handle internally
  const assignRef = (node) => {
    localBtnRef.current = node;
    if (typeof setAddNewBtnRef === "function") setAddNewBtnRef(node);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginLeft: isMobile ? 0 : "8px",
        flexShrink: 0,
        gap: isMobile ? "6px" : "8px",
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}
    >
      {items.map(({ path, icon, label }) => {
        const target = isFriendView ? `${path}/${friendId}` : path;
        return (
          <button
            key={path}
            onClick={() => navigate(target)}
            className="nav-button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "6px" : "6px",
              padding: isMobile ? "6px 8px" : "8px 10px",
              backgroundColor: "#1b1b1b",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#00DAC6",
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              minWidth: "fit-content",
            }}
          >
            <img
              src={require(`../../assests/${icon}`)}
              alt={label}
              style={{
                width: isMobile ? 16 : 18,
                height: isMobile ? 16 : 18,
                filter:
                  "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
                transition: "filter 0.2s ease",
              }}
            />
            {!isMobile && <span>{label}</span>}
          </button>
        );
      })}
      {hasWriteAccess && (
        <button
          ref={assignRef}
          onClick={() => setAddNewPopoverOpen(!addNewPopoverOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: isMobile ? "6px 8px" : "6px 8px",
            backgroundColor: "#1b1b1b",
            border: "1px solid #333",
            borderRadius: "6px",
            color: "#00DAC6",
            fontSize: isMobile ? "11px" : "12px",
            fontWeight: "500",
            cursor: "pointer",
            minWidth: "fit-content",
          }}
          disabled={!hasWriteAccess}
          title={
            hasWriteAccess
              ? "Add expense, budget, category or upload file"
              : "You have read-only access"
          }
        >
          <img
            src={require("../../assests/add.png")}
            alt="Add"
            style={{
              width: isMobile ? 14 : 16,
              height: isMobile ? 14 : 16,
              filter:
                "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(749%) hue-rotate(120deg) brightness(1.1)",
              transition: "filter 0.2s ease",
            }}
          />
          {!isMobile && <span>Add New</span>}
        </button>
      )}
      {addNewPopoverOpen &&
        hasWriteAccess &&
        localBtnRef.current &&
        createPortal(
          <div
            data-popover="add-new"
            style={{
              position: "fixed",
              top:
                localBtnRef.current.getBoundingClientRect().bottom +
                4 +
                window.scrollY,
              left:
                localBtnRef.current.getBoundingClientRect().left +
                window.scrollX,
              zIndex: 1000,
              background: "#0b0b0b",
              border: "1px solid #333",
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              minWidth: 140,
              padding: 4,
            }}
          >
            {[
              {
                label: "Add Expense",
                route: isFriendView
                  ? `/expenses/create/${friendId}`
                  : "/expenses/create",
                color: "#00DAC6",
              },
              {
                label: "Upload File",
                route: isFriendView
                  ? `/upload/expenses/${friendId}`
                  : "/upload/expenses",
                color: "#5b7fff",
              },
              {
                label: "Add Budget",
                route: isFriendView
                  ? `/budget/create/${friendId}`
                  : "/budget/create",
                color: "#FFC107",
              },
              {
                label: "Add Category",
                route: isFriendView
                  ? `/category-flow/create/${friendId}`
                  : "/category-flow/create",
                color: "#ff6b6b",
              },
            ].map((item, idx) => (
              <button
                key={idx}
                style={{
                  display: "block",
                  width: "100%",
                  background: "transparent",
                  color: item.color,
                  border: "none",
                  textAlign: "left",
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontSize: "12px",
                  borderRadius: 4,
                }}
                onClick={() => {
                  navigate(item.route);
                  setAddNewPopoverOpen(false);
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = item.color;
                  e.target.style.color =
                    item.color === "#FFC107" ? "#000" : "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = item.color;
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
