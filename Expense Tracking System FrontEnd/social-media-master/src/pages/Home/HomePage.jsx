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
// Removed FileUploadModal import since it's now handled in /upload route

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
  const [sortLoading, setSortLoading] = useState(false);

  useEffect(() => {
    if (jwt) {
      console.log("entered into login");
      dispatch(getExpensesAction(jwt, sortOrder));
    }
  }, [dispatch, jwt, sortOrder]);

  // Redirect if there's an authentication error
  if (authError && !user) {
    navigate("/login");
  }

  const handleSortOrderChange = async (e) => {
    const selectedOrder = e.target.value;
    setSortOrder(selectedOrder);
    setSortLoading(true); // start loading

    try {
      await dispatch(
        getExpensesAction(localStorage.getItem("jwt"), selectedOrder)
      );
    } finally {
      setSortLoading(false); // stop loading
    }
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/");
  };

  return (
    <div className="container">
      <div style={{ padding: "20px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#333",
          }}
        >
          Monthly Expenses
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          {/* Left Side: Logout */}
          <button
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              backgroundColor: "#007bff",
              color: "white",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>

          {/* Right Side: Upload and Reports */}
          <div>
            <button
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                marginRight: "10px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: "#28a745",
                color: "white",
              }}
              onClick={() => navigate("/upload")}
            >
              Upload Files
            </button>

            <Link
              to="/reports"
              style={{
                backgroundColor: "#ffc107",
                color: "white",
                padding: "10px 15px",
                borderRadius: "5px",
                fontSize: "16px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div
          className="d-flex align-items-center mt-3"
          style={{ width: "50%" }}
        >
          <FilterComponent
            inputData={expenses}
            setFilteredData={setFilteredData}
          />
        </div>
        <div className="sort-order-container">
          <select
            id="sortOrder"
            className="sort-order-select"
            value={sortOrder}
            onChange={handleSortOrderChange}
            disabled={sortLoading}
          >
            <option value="">Sort By</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          {sortLoading && <Loader />}
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
        <FilteredTable filteredData={filteredData} />
      )}
    </div>
  );
};

export default HomePage;
