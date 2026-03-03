import { useState, useMemo } from "react";

export default function useExpenseSorting(cardData) {
  const [sortType, setSortType] = useState("recent");

  const sortedCardData = useMemo(() => {
    let data = [...(cardData || [])];
    if (sortType === "high") data.sort((a, b) => b.amount - a.amount);
    else if (sortType === "low") data.sort((a, b) => a.amount - b.amount);
    else if (sortType === "recent")
      data.sort(
        (a, b) =>
          new Date(b.date || b.expense?.date) -
          new Date(a.date || a.expense?.date)
      );
    return data;
  }, [cardData, sortType]);

  return { sortType, setSortType, sortedCardData };
}
