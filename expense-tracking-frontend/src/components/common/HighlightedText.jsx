import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/useTheme";
import {
  getFuzzyMatchIndices,
  normalizeFuzzyQuery,
} from "../../utils/fuzzyMatchUtils";

const buildHighlightedNodes = (text, indices, highlightStyle) => {
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
        style={{
          background: "none",
          padding: 0,
          ...highlightStyle,
        }}
      >
        {s.slice(start, i)}
      </mark>
    );
  }

  return out;
};

/**
 * HighlightedText
 *
 * - `mode="fuzzy"` highlights VS Code-like subsequence matches.
 * - `mode="exact"` highlights contiguous substring matches.
 */
const HighlightedText = ({
  text,
  query,
  mode = "fuzzy",
  highlightStyle,
  className,
  title,
}) => {
  const { colors } = useTheme();

  const effectiveHighlightStyle = useMemo(() => {
    return {
      color: colors?.secondary_accent || "var(--pm-accent-color, #00dac6)",
      fontWeight: 700,
      ...highlightStyle,
    };
  }, [colors?.secondary_accent, highlightStyle]);

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
          <mark
            key={`e-${idx}`}
            style={{
              background: "none",
              padding: 0,
              ...effectiveHighlightStyle,
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={`e-${idx}`}>{part}</span>
        )
      );
    }

    // fuzzy
    const needle = normalizeFuzzyQuery(q);
    const indices = getFuzzyMatchIndices(s, needle);
    if (!indices) return s;

    return buildHighlightedNodes(s, indices, effectiveHighlightStyle);
  }, [text, query, mode, effectiveHighlightStyle]);

  return (
    <span className={className} title={title}>
      {content}
    </span>
  );
};

HighlightedText.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  query: PropTypes.string,
  mode: PropTypes.oneOf(["fuzzy", "exact"]),
  highlightStyle: PropTypes.object,
  className: PropTypes.string,
  title: PropTypes.string,
};

export default HighlightedText;
