import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

/**
 * A simple virtualization hook that renders only visible items plus a buffer.
 * Works without external dependencies by using IntersectionObserver.
 *
 * @param {Object} options
 * @param {number} options.totalCount - Total number of items
 * @param {number} options.estimatedItemHeight - Estimated height per item in pixels
 * @param {number} options.overscan - Number of items to render above/below visible area (default: 5)
 * @param {React.RefObject} options.containerRef - Ref to the scrollable container
 * @returns {{ visibleRange: { start: number, end: number }, containerStyle: object, totalHeight: number }}
 */
export function useVirtualization({
  totalCount,
  estimatedItemHeight = 160,
  overscan = 5,
  containerRef,
}) {
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: Math.min(20, totalCount),
  });
  const [containerHeight, setContainerHeight] = useState(400);

  const totalHeight = totalCount * estimatedItemHeight;

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const updateVisibleRange = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      const startIndex = Math.max(
        0,
        Math.floor(scrollTop / estimatedItemHeight) - overscan,
      );
      const endIndex = Math.min(
        totalCount,
        Math.ceil((scrollTop + viewportHeight) / estimatedItemHeight) +
          overscan,
      );

      setVisibleRange((prev) => {
        if (prev.start !== startIndex || prev.end !== endIndex) {
          return { start: startIndex, end: endIndex };
        }
        return prev;
      });
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
      updateVisibleRange();
    };

    // Initial calculation
    handleResize();
    updateVisibleRange();

    // Use passive listener for better scroll performance
    container.addEventListener("scroll", updateVisibleRange, { passive: true });

    // Handle resize
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", updateVisibleRange);
      resizeObserver.disconnect();
    };
  }, [containerRef, totalCount, estimatedItemHeight, overscan]);

  const containerStyle = useMemo(
    () => ({
      height: totalHeight,
      position: "relative",
    }),
    [totalHeight],
  );

  return {
    visibleRange,
    containerStyle,
    totalHeight,
    containerHeight,
  };
}

/**
 * A simple virtual list component that renders only visible items.
 * Suitable for homogeneous lists with fixed or estimated item heights.
 */
export function VirtualList({
  items,
  renderItem,
  estimatedItemHeight = 160,
  overscan = 5,
  className,
  style,
  containerRef: externalContainerRef,
}) {
  const internalContainerRef = useRef(null);
  const containerRef = externalContainerRef || internalContainerRef;

  const { visibleRange, totalHeight } = useVirtualization({
    totalCount: items.length,
    estimatedItemHeight,
    overscan,
    containerRef,
  });

  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.start, visibleRange.end)
      .map((item, index) => ({
        item,
        actualIndex: visibleRange.start + index,
        style: {
          position: "absolute",
          top: (visibleRange.start + index) * estimatedItemHeight,
          left: 0,
          right: 0,
          height: estimatedItemHeight,
        },
      }));
  }, [items, visibleRange, estimatedItemHeight]);

  return (
    <div
      ref={!externalContainerRef ? containerRef : undefined}
      className={className}
      style={{
        ...style,
        overflow: "auto",
        position: "relative",
      }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map(({ item, actualIndex, style: itemStyle }) => (
          <div key={item.id || item.expenseId || actualIndex} style={itemStyle}>
            {renderItem(item, actualIndex)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook for implementing windowed rendering with variable height items.
 * Uses a simpler approach that batches items and renders only visible batches.
 *
 * @param {Object} options
 * @param {any[]} options.items - Array of items to virtualize
 * @param {number} options.batchSize - Number of items per batch (default: 50)
 * @param {number} options.initialBatches - Number of batches to render initially (default: 2)
 * @returns {{ visibleItems: any[], loadMore: Function, hasMore: boolean, resetBatches: Function }}
 */
export function useBatchedRendering({
  items,
  batchSize = 50,
  initialBatches = 2,
}) {
  const [loadedBatches, setLoadedBatches] = useState(initialBatches);

  const visibleItems = useMemo(() => {
    const endIndex = Math.min(loadedBatches * batchSize, items.length);
    return items.slice(0, endIndex);
  }, [items, loadedBatches, batchSize]);

  const hasMore = visibleItems.length < items.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setLoadedBatches((prev) => prev + 1);
    }
  }, [hasMore]);

  const resetBatches = useCallback(() => {
    setLoadedBatches(initialBatches);
  }, [initialBatches]);

  // Reset when items change significantly
  useEffect(() => {
    setLoadedBatches(initialBatches);
  }, [items.length, initialBatches]);

  return {
    visibleItems,
    loadMore,
    hasMore,
    loadedBatches,
    totalBatches: Math.ceil(items.length / batchSize),
    resetBatches,
  };
}

/**
 * Intersection Observer hook for lazy loading more items when scrolling to bottom.
 *
 * @param {Function} onIntersect - Callback when the sentinel comes into view
 * @param {Object} options - IntersectionObserver options
 * @returns {React.RefObject} - Ref to attach to the sentinel element
 */
export function useInfiniteScroll(onIntersect, options = {}) {
  const sentinelRef = useRef(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersectRef.current();
        }
      },
      {
        root: options.root || null,
        rootMargin: options.rootMargin || "100px",
        threshold: options.threshold || 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [options.root, options.rootMargin, options.threshold]);

  return sentinelRef;
}

export default useVirtualization;
