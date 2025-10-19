import { useState, useMemo } from "react";

export default function useSelectionManager({ chartData, activeRange }) {
  const [selectedBar, setSelectedBar] = useState(null);
  const [selectedBars, setSelectedBars] = useState([]);
  const [selectedCardIdx, setSelectedCardIdx] = useState([]);
  const [lastBarSelectedIdx, setLastBarSelectedIdx] = useState(null);
  const [lastSelectedIdx, setLastSelectedIdx] = useState(null);
  const [hoverBarIndex, setHoverBarIndex] = useState(null);

  const handleBarClick = (data, idx, multi = false, rangeSelect = false) => {
    setSelectedCardIdx([]);
    if (
      rangeSelect &&
      lastBarSelectedIdx !== null &&
      lastBarSelectedIdx !== undefined
    ) {
      const start = Math.min(lastBarSelectedIdx, idx);
      const end = Math.max(lastBarSelectedIdx, idx);
      const range = [];
      for (let i = start; i <= end; i++) {
        if (chartData[i]) range.push({ data: chartData[i], idx: i });
      }
      setSelectedBars(range);
      setSelectedBar(range[range.length - 1] || null);
      return;
    }
    if (!multi) {
      setSelectedBar((prev) =>
        prev && prev.idx === idx ? null : { data, idx }
      );
      setSelectedBars((prev) => {
        if (prev.length === 1 && prev[0].idx === idx) {
          setLastBarSelectedIdx(null);
          return [];
        }
        setLastBarSelectedIdx(idx);
        return [{ data, idx }];
      });
      return;
    }
    setSelectedBars((prev) => {
      const exists = prev.find((p) => p.idx === idx);
      let next;
      if (exists) {
        next = prev.filter((p) => p.idx !== idx);
      } else {
        next = [...prev, { data, idx }];
        setLastBarSelectedIdx(idx);
      }
      setSelectedBar(next.length ? next[next.length - 1] : null);
      return next;
    });
  };

  const handleCardClick = (idx, event) => {
    if (event) event.preventDefault();
    if (
      event &&
      event.shiftKey &&
      lastSelectedIdx !== null &&
      lastSelectedIdx !== undefined
    ) {
      const start = Math.min(lastSelectedIdx, idx);
      const end = Math.max(lastSelectedIdx, idx);
      const range = [];
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      setSelectedCardIdx(range);
    } else if (event && event.ctrlKey) {
      setSelectedCardIdx((prev) => {
        if (prev.includes(idx)) return prev.filter((i) => i !== idx);
        return [...prev, idx];
      });
      setLastSelectedIdx(idx);
    } else {
      setSelectedCardIdx((prev) => {
        if (prev.length === 1 && prev[0] === idx) return [];
        return [idx];
      });
      setLastSelectedIdx(idx);
    }
  };

  const selectionStats = useMemo(() => {
    const base = selectedBars.length ? selectedBars.map((b) => b.data) : [];
    if (!base.length) return null;
    const amounts = base.map((d) => d.amount || 0);
    const count = amounts.length;
    const total = amounts.reduce((a, b) => a + b, 0);
    const avg = count ? total / count : 0;
    let min = Infinity,
      max = -Infinity;
    amounts.forEach((v) => {
      if (v < min) min = v;
      if (v > max) max = v;
    });
    // Gather expenses list from each selected bar (chartData now includes expenses array per bar)
    const expenseList = base.flatMap((d) =>
      Array.isArray(d.expenses) ? d.expenses : []
    );
    const expenseCount = expenseList.length;
    return {
      count,
      total,
      avg,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
      expenseCount,
      expenseList,
    };
  }, [selectedBars]);

  const clearSelection = () => {
    setSelectedBars([]);
    setSelectedBar(null);
    setLastBarSelectedIdx(null);
  };

  return {
    selectedBar,
    selectedBars,
    selectedCardIdx,
    hoverBarIndex,
    setHoverBarIndex,
    handleBarClick,
    handleCardClick,
    selectionStats,
    clearSelection,
    setSelectedCardIdx,
    setSelectedBar,
    setSelectedBars,
  };
}
