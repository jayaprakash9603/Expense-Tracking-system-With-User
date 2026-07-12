import { useCallback, useRef } from "react";

const getRange = (items, getKey, startIndex, endIndex) => {
  const start = Math.min(startIndex, endIndex);
  const end = Math.max(startIndex, endIndex);
  return items.slice(start, end + 1).map(getKey);
};

export const useOrderedSelection = ({
  items = [],
  selectedKeys = [],
  getKey,
  onChange,
}) => {
  const anchorIndexRef = useRef(null);

  const selectAt = useCallback(
    (index, event) => {
      const key = getKey(items[index]);
      if (key === null || key === undefined) return;

      if (event?.shiftKey && anchorIndexRef.current !== null) {
        onChange(getRange(items, getKey, anchorIndexRef.current, index));
        return;
      }

      if (event?.ctrlKey || event?.metaKey) {
        onChange(
          selectedKeys.includes(key)
            ? selectedKeys.filter((selectedKey) => selectedKey !== key)
            : [...selectedKeys, key],
        );
        anchorIndexRef.current = index;
        return;
      }

      onChange(selectedKeys.includes(key) ? [] : [key]);
      anchorIndexRef.current = index;
    },
    [getKey, items, onChange, selectedKeys],
  );

  const resetAnchor = useCallback(() => {
    anchorIndexRef.current = null;
  }, []);

  return { selectAt, resetAnchor };
};
