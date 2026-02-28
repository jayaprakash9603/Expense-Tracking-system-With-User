import { useMemo, useState } from "react";

/**
 * useFlowCards
 * Shared hook for CategoryFlow & PaymentMethodFlow to handle search filtering and sorting.
 * Expects cards array with fields: categoryName, totalAmount.
 * Sort types: 'high' | 'low' | 'recent'.
 */
export default function useFlowCards(
  cards = [],
  search = "",
  initialSort = "high"
) {
  const [sortType, setSortType] = useState(initialSort);

  const filtered = useMemo(() => {
    if (!search) return cards;
    const lower = search.toLowerCase();
    return cards.filter(
      (card) =>
        card.categoryName?.toLowerCase().includes(lower) ||
        (card.totalAmount + "").includes(lower)
    );
  }, [cards, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortType === "high") arr.sort((a, b) => b.totalAmount - a.totalAmount);
    else if (sortType === "low")
      arr.sort((a, b) => a.totalAmount - b.totalAmount);
    else if (sortType === "recent")
      arr.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    return arr;
  }, [filtered, sortType]);

  return {
    sortType,
    setSortType,
    filteredCards: filtered,
    sortedCards: sorted,
  };
}
