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

  const groupedWithMetadata = useMemo(
    () =>
      GROUP_ORDER.map((category) => ({
        category,
        items: groupedResults[category] || [],
      })).filter((section) => section.items.length > 0),
    [groupedResults],
  );

  if (!groupedWithMetadata.length) {
    return (
      <div className="flex h-[20rem] items-center justify-center text-sm text-muted-foreground">
        No results found. Try another command.
      </div>
    );
  }

  return (
    <div className="palette-scrollbar max-h-[55vh] overflow-y-auto px-2 pb-2">
      {groupedWithMetadata.map((section) => (
        <div key={section.category} className="mb-3 last:mb-0">
          <p className="px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {section.category}
          </p>
          <div className="space-y-1">
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
