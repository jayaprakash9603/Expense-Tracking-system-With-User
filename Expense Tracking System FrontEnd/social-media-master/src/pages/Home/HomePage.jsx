import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useAuthentication from "./useAuthentication";
import useExpenses from "./useExpenses";

import ErrorMessage from "./ErrorMessage";
import "../Home/Home.css";
import FilteredTable from "./FilteredTable";
import Loader from "../../components/Loaders/Loader";
import FilterComponent from "../Filter/FilterComponent";
import { logoutAction } from "../../Redux/Auth/auth.action";
import { getExpensesAction } from "../../Redux/Expenses/expense.action";
import ReportsGeneration from "../ReportsGeneration";
// Ensure this import exists

const HomePage = () => {
  const jwt = localStorage.getItem("jwt");
  const { user, error: authError } = useSelector((state) => state.auth);
  const { expenses } = useSelector((state) => state.expenses);
  const { loadingAuth } = useAuthentication(jwt);
  const { dataForTable, loading, error } = useExpenses(jwt);
  const [convertedData, setConvertedData] = useState({});
  const [filteredData, setFilteredData] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sortOrder, setSortOrder] = useState("");

  // Redirect if there's an authentication error
  if (authError && !user) {
    navigate("/login");
  }

  if (loadingAuth) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    dispatch(getExpensesAction(localStorage.getItem("jwt"), e.target.value));
  };

  
  const handleLogout = () => {
    dispatch(logoutAction());

    navigate("/");
  };
  return (
    <div className="container">
      <div>
        <h2>Monthly Expenses</h2>
        <button className="btn btn-primary" onClick={handleLogout}>
          Logout
        </button>
        <div className="d-flex justify-content-between mb-3">
          <div className="createButton">
            <Link className="btn btn-primary" to="/reports">
              <i className="bi bi-plus"></i>
            </Link>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3 bg-info-subtle">
        <div
          className="d-flex align-items-center mt-3"
          style={{ width: "50%" }}
        >
          <FilterComponent
            inputData={expenses}
            setFilteredData={setFilteredData}
          />
        </div>
        <div>
          <select
            id="sortOrder"
            className="form-select w-auto"
            value={sortOrder}
            onChange={handleSortOrderChange}
          >
            <option value="">Sort By</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
      <div className="d-flex justify-content-between mb-3">
        <div className="createButton">
          <Link className="btn btn-primary" to="/create">
            <i className="bi bi-plus"></i>
          </Link>
        </div>
      </div>
      {expenses.length === 0 ? (
        <p>No expenses available.</p>
      ) : (
        <>
          {console.log(expenses)}
          <FilteredTable filteredData={filteredData} />
        </>
      )}
    </div>
  );
};

export default HomePage;
