import React from "react";
import { AppSelect } from "../../components/ui";
import "./FilterComponent.css";

const FILTER_OPTIONS = [
  { value: "filters", label: "Filters" },
  { value: "allColumns", label: "All expenses" },
  { value: "expenseName", label: "Expense Name" },
  { value: "amount", label: "Amount" },
  { value: "type", label: "Type" },
  { value: "paymentMethod", label: "Payment Method" },
  { value: "date", label: "Date" },
];

const FilterDropdown = ({ filterBy, setFilterBy }) => {
  return (
    <AppSelect
      id="filterBy"
      className="filter-dropdown p-2 rounded"
      value={filterBy}
      onValueChange={setFilterBy}
      options={FILTER_OPTIONS}
      ariaLabel="Filter by column"
      size="small"
      displayEmpty={false}
    />
  );
};

export default FilterDropdown;
