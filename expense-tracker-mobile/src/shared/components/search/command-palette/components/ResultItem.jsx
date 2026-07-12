import React from "react";
import { formatDate } from "@/shared/utils/format/dateUtils";

function getRenderableIcon(icon) {
  if (typeof icon === "string" && icon.trim()) return icon;
  if (typeof icon === "number") return String(icon);
  return "➡️";
}

function highlightText(text, query) {
  if (!query?.trim() || !text) return text;

  const queryLower = query.toLowerCase().trim();
  const textStr = String(text);
  const textLower = textStr.toLowerCase();

  // First try exact substring match
  if (textLower.includes(queryLower)) {
    const parts = [];
    let lastIndex = 0;
    let searchIndex = 0;

    while ((searchIndex = textLower.indexOf(queryLower, lastIndex)) !== -1) {
      if (searchIndex > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{textStr.slice(lastIndex, searchIndex)}</span>);
      }
      parts.push(
        <span key={`match-${searchIndex}`} className="font-bold text-primary">
          {textStr.slice(searchIndex, searchIndex + queryLower.length)}
        </span>
      );
      lastIndex = searchIndex + queryLower.length;
    }

    if (lastIndex < textStr.length) {
      parts.push(<span key={`text-end`}>{textStr.slice(lastIndex)}</span>);
    }

    return <span>{parts}</span>;
  }

  // Fallback to fuzzy matching - highlight each matching character in sequence
  const matchIndices = [];
  let queryIdx = 0;

  for (let i = 0; i < textLower.length && queryIdx < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIdx]) {
      matchIndices.push(i);
      queryIdx++;
    }
  }

  if (queryIdx < queryLower.length) {
    return <span>{textStr}</span>;
  }

  const matchSet = new Set(matchIndices);
  const parts = [];
  let i = 0;

  while (i < textStr.length) {
    if (!matchSet.has(i)) {
      const start = i;
      while (i < textStr.length && !matchSet.has(i)) i++;
      parts.push(<span key={`t-${start}`}>{textStr.slice(start, i)}</span>);
    } else {
      const start = i;
      while (i < textStr.length && matchSet.has(i)) i++;
      parts.push(
        <span key={`m-${start}`} className="font-bold text-primary">
          {textStr.slice(start, i)}
        </span>
      );
    }
  }

  return <span>{parts}</span>;
}

export function ResultItem({ action, isActive, onClick, onMouseEnter, query, itemRef }) {
  const hasChildren = Array.isArray(action.children) && action.children.length > 0;
  const icon = getRenderableIcon(action.icon);

  // Check if it's an expense-like item (has amount and date)
  const isExpenseLike = action.type === "EXPENSE" || action.type === "BILL";
  const amount = action.amount;
  const date = action.date ? formatDate(action.date) : null;
  const isGain = action.isGain;

  return (
    <button
      ref={itemRef}
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
        isActive ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl leading-none shadow-sm border border-border/50">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {highlightText(action.name, query)}
        </p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {action.subtitle ? highlightText(action.subtitle, query) : `${action.section} · ${action.category}`}
        </p>
      </div>
      
      {isExpenseLike && (amount || date) && (
        <div className="flex flex-col items-end shrink-0 min-w-[80px]">
          {amount && (
            <span className={`text-[13px] font-semibold leading-tight ${isGain ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {amount}
            </span>
          )}
          {date && (
            <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              {date}
            </span>
          )}
        </div>
      )}

      {action.type && action.type !== "ACTION" && (
        <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-primary shrink-0 ml-2">
          {action.type.replace("_", " ")}
        </span>
      )}
      
      {(!action.type || action.type === "ACTION") && (
        <span className="rounded-md border border-border/60 bg-background px-2 py-1 text-[0.625rem] text-muted-foreground shrink-0 ml-2">
          {action.category}
        </span>
      )}
      
      {hasChildren ? <span className="text-xs text-muted-foreground shrink-0 ml-2">&gt;</span> : null}
    </button>
  );
}

export default ResultItem;
