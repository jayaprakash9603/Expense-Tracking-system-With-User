import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { GROUP_ORDER } from "../utils/ranking";
import { ResultItem } from "./ResultItem";

export function ResultList({
  groupedResults,
  flatResults,
  query,
  selectedIndex,
  onHover,
  onSelect,
  loadMore,
  hasMore,
}) {
  const parentRef = useRef(null);
  
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

  // Flatten items and headers for virtualization
  const virtualItems = useMemo(() => {
    const items = [];
    groupedWithMetadata.forEach((section) => {
      items.push({ type: 'header', category: section.category });
      section.items.forEach((action) => {
        items.push({ type: 'item', action });
      });
    });
    return items;
  }, [groupedWithMetadata]);

  const indexById = useMemo(
    () =>
      flatResults.reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [flatResults],
  );

  const rowVirtualizer = useVirtualizer({
    count: hasMore ? virtualItems.length + 1 : virtualItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index) => {
      if (index >= virtualItems.length) return 50; // Loading indicator size
      const item = virtualItems[index];
      return item.type === 'header' ? 32 : 68; // Header size vs Item size
    }, [virtualItems]),
    overscan: 5,
  });

  // Infinite scroll logic
  const virtualRows = rowVirtualizer.getVirtualItems();
  useEffect(() => {
    const lastItem = virtualRows[virtualRows.length - 1];
    if (!lastItem) return;

    if (lastItem.index >= virtualItems.length - 1 && hasMore && loadMore) {
      loadMore();
    }
  }, [virtualRows, virtualItems.length, hasMore, loadMore]);

  // Scroll to selected index
  useEffect(() => {
    if (selectedIndex < 0 || !flatResults[selectedIndex]) return;
    
    const selectedAction = flatResults[selectedIndex];
    const virtualIndex = virtualItems.findIndex(
      (item) => item.type === 'item' && item.action.id === selectedAction.id
    );
    
    if (virtualIndex !== -1) {
      rowVirtualizer.scrollToIndex(virtualIndex, { align: 'auto' });
    }
  }, [selectedIndex, flatResults, virtualItems, rowVirtualizer]);

  if (!virtualItems.length) {
    return (
      <div className="flex h-[20rem] items-center justify-center text-sm text-muted-foreground">
        No results found. Try another command.
      </div>
    );
  }

  return (
    <div 
      ref={parentRef}
      className="palette-scrollbar max-h-[55vh] overflow-y-auto pb-2"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const isLoaderRow = virtualRow.index > virtualItems.length - 1;
          
          if (isLoaderRow) {
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex items-center justify-center py-4"
              >
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            );
          }

          const item = virtualItems[virtualRow.index];

          if (item.type === 'header') {
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="bg-card px-4 py-2 border-b border-border/40"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {item.category}
                </p>
              </div>
            );
          }

          const action = item.action;
          const idx = indexById[action.id] ?? -1;

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="px-2 pt-1"
            >
              <ResultItem
                action={action}
                query={query}
                isActive={idx === selectedIndex}
                onMouseEnter={() => onHover(idx)}
                onClick={() => onSelect(action)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResultList;
