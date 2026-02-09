// components/ResetButton.jsx
import React from "react";
import "./FilterComponent.css";
const ResetButton = ({ resetFilters }) => (
  <button className="reset-button" onClick={resetFilters}>
    Reset
  </button>
);

export default ResetButton;
