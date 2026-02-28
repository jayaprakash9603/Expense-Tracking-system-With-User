// components/FilterInput.jsx
import React, { useRef } from "react";
import "./FilterComponent.css";
const FilterInput = ({
  filterBy,
  filterValue,
  filterDate,
  setFilterValue,
  setFilterDate,
  applyFilter,
}) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    if (filterBy === "date") {
      setFilterDate(e.target.value);
      applyFilter(filterValue, filterBy, e.target.value);
    } else {
      setFilterValue(e.target.value);
      applyFilter(e.target.value, filterBy, filterDate);
    }
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    filterBy !== "filters" && (
      <input
        ref={inputRef}
        type={filterBy === "date" ? "date" : "text"}
        className="filter-input p-2 rounded"
        placeholder="Enter value"
        value={filterBy === "date" ? filterDate : filterValue}
        onChange={handleChange}
      />
    )
  );
};

export default FilterInput;
