import React, { useEffect, useMemo, useRef } from "react";
import { GROUP_ORDER } from "../utils/ranking";
import { ResultItem } from "./ResultItem";

export function ResultList({
  groupedResults,
  flatResults,
  query,
  selectedIndex,
  onHover,
  onSelect,
}) {
  const itemRefs = useRef({});
  const indexById = useMemo(
    () =>
      flatResults.reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [flatResults],
  );

  useEffect(() => {
    const selected = flatResults[selectedIndex];
    if (!selected) return;
    const node = itemRefs.current[selected.id];
    if (node && typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [flatResults, selectedIndex]);

  const groupedWithMetadata = useMemo(() => {
    const sections = GROUP_ORDER.map((category) => ({
      category,
      items: groupedResults[category] || [],
    })).filter((section) => section.items.length > 0);

    // If there's an active query, sort sections so the ones with the highest scoring items appear at the top
    if (query?.trim()) {
      sections.sort((a, b) => {
        const maxScoreA = a.items[0]?._score || 0;
        const maxScoreB = b.items[0]?._score || 0;
        return maxScoreB - maxScoreA;
      });
    }

    return sections;
  }, [groupedResults, query]);

  if (!groupedWithMetadata.length) {
    return (
      <div className="flex h-[20rem] items-center justify-center text-sm text-muted-foreground">
        No results found. Try another command.
      </div>
    );
  }

  return (
    <div className="palette-scrollbar max-h-[55vh] overflow-y-auto pb-2">
      {groupedWithMetadata.map((section) => (
        <div key={section.category} className="mb-2">
          <div className="sticky top-0 z-10 bg-card px-4 py-2 border-b border-border/40 mb-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              {section.category}
            </p>
          </div>
          <div className="px-2 space-y-1">
            {section.items.map((action) => {
              const idx = indexById[action.id] ?? -1;
              return (
                <ResultItem
                  key={action.id}
                  action={action}
                  query={query}
                  isActive={idx === selectedIndex}
                  onMouseEnter={() => onHover(idx)}
                  onClick={() => onSelect(action)}
                  itemRef={(node) => {
                    itemRefs.current[action.id] = node;
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ResultList;
