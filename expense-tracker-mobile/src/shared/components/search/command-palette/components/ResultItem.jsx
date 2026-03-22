import React from "react";

function getRenderableIcon(icon) {
  if (typeof icon === "string" && icon.trim()) return icon;
  if (typeof icon === "number") return String(icon);
  return "➡️";
}

function highlightText(text, query) {
  if (!query?.trim()) return text;

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeQuery})`, "ig");
  const parts = String(text || "").split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-primary/20 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

export function ResultItem({ action, isActive, onClick, onMouseEnter, query, itemRef }) {
  const hasChildren = Array.isArray(action.children) && action.children.length > 0;
  const icon = getRenderableIcon(action.icon);

  return (
    <button
      ref={itemRef}
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`group flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition ${
        isActive ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent"
      }`}
    >
      <span className="mt-0.5 text-base leading-none">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {highlightText(action.name, query)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {action.section} · {action.category}
        </p>
      </div>
      <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[0.625rem] text-muted-foreground">
        {action.category}
      </span>
      {hasChildren ? <span className="text-xs text-muted-foreground">&gt;</span> : null}
    </button>
  );
}

export default ResultItem;
