import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

function normalizeFuzzyQuery(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function getFuzzyMatchIndices(text, query) {
  const haystack = String(text || "");
  const needle = normalizeFuzzyQuery(query);
  if (!needle) return [];

  const lower = haystack.toLowerCase();
  const indices = [];
  let j = 0;

  for (let i = 0; i < lower.length && j < needle.length; i += 1) {
    if (lower[i] === needle[j]) {
      indices.push(i);
      j += 1;
    }
  }

  return j === needle.length ? indices : null;
}

function buildHighlightedNodes(text, indices) {
  const s = String(text ?? "");
  if (!indices || indices.length === 0) return s;

  const indexSet = new Set(indices);
  const out = [];
  let i = 0;

  while (i < s.length) {
    if (!indexSet.has(i)) {
      const start = i;
      while (i < s.length && !indexSet.has(i)) i += 1;
      out.push(<span key={`t-${start}`}>{s.slice(start, i)}</span>);
      continue;
    }

    const start = i;
    i += 1;
    while (i < s.length && indexSet.has(i)) i += 1;

    out.push(
      <mark
        key={`m-${start}`}
        className="bg-transparent text-primary font-bold"
      >
        {s.slice(start, i)}
      </mark>
    );
  }

  return out;
}

export function HighlightedText({
  text,
  query,
  mode = "fuzzy",
  className,
  title,
}) {
  const content = useMemo(() => {
    const s = String(text ?? "");
    const q = String(query ?? "");

    if (!q.trim() || !s) return s;

    if (mode === "exact") {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${safe})`, "gi");
      const parts = s.split(regex);

      return parts.map((part, idx) =>
        regex.test(part) ? (
          <mark key={`e-${idx}`} className="bg-transparent text-primary font-bold">
            {part}
          </mark>
        ) : (
          <span key={`e-${idx}`}>{part}</span>
        )
      );
    }

    const needle = normalizeFuzzyQuery(q);
    const indices = getFuzzyMatchIndices(s, needle);
    if (!indices) return s;

    return buildHighlightedNodes(s, indices);
  }, [text, query, mode]);

  return (
    <span className={cn(className)} title={title}>
      {content}
    </span>
  );
}

export { normalizeFuzzyQuery, getFuzzyMatchIndices };
export default HighlightedText;
