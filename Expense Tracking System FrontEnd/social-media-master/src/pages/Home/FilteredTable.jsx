import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  deleteExpenseAction,
  getExpenseAction,
  getExpensesAction,
} from "../../Redux/Expenses/expense.action";
// import "../Styles/FilteredTable.css";
const FilteredTable = ({ filteredData }) => {
  const [sortConfig, setSortConfig] = useState({});
  const [data, setData] = useState(filteredData);
  {
    console.log(filteredData);
  }

  const dispatch = useDispatch();
  const location = useLocation();
  const methodMapping = {
    cash: "Cash",
    creditNeedToPaid: "Credit Card Due",
    creditPaid: "Credit Paid",
  };
  useEffect(() => {
    setData(filteredData);
  }, [filteredData]);

  const handleSort = (date, key) => {
    setSortConfig((prevConfig) => {
      let direction = "ascending";
      if (
        prevConfig[date] &&
        prevConfig[date].key === key &&
        prevConfig[date].direction === "ascending"
      ) {
        direction = "descending";
      }
      return {
        ...prevConfig,
        [date]: { key, direction },
      };
    });
  };

  const sortedData = (date) => {
    const { key, direction } = sortConfig[date] || {};
    const data = filteredData[date] || [];
    if (!key) return data;

    return [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });
  };

  // Calculate the total amount of expenses for a specific date
  const totalAmount = (date) => {
    const data = sortedData(date);
    if (!Array.isArray(data)) return 0;
    return data.reduce((total, expense) => {
      return total + (expense.netAmount || 0);
    }, 0);
  };
  const navigate = useNavigate();
  const handleDelete = (id) => {
    const confirm = window.confirm("Would you like to delete?");
    if (confirm) {
      dispatch(deleteExpenseAction(id))
        .then(() => {
          // Navigate only after successful deletion
          dispatch(getExpensesAction());
          navigate("/");
        })
        .catch((error) => {
          // Handle error in case the deletion failed
          console.error("Error deleting expense:", error);
          alert("Error deleting expense. Please try again.");
        });
    }
  };

  // Function to format date as dd MonthName yyyy
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="table-responsive">
      {Object.keys(filteredData).length > 0 ? (
        Object.keys(filteredData).map((date) => (
          <div key={date} className="mb-4">
            <h3 className="text-center">{formatDate(date)}</h3>{" "}
            {/* Date formatted */}
            <table className="table table-striped table-bordered">
              <thead className="thead-light">
                <tr>
                  {[
                    { key: "index", label: "ID" },
                    { key: "expenseName", label: "Expense Name" },
                    { key: "amount", label: "Amount" },
                    { key: "type", label: "Type" },
                    { key: "paymentMethod", label: "Payment Method" },
                    { key: "netAmount", label: "Net Amount" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(date, key)}
                      style={{ cursor: "pointer" }}
                      className="text-center"
                    >
                      {label}
                      {sortConfig[date] && sortConfig[date].key === key ? (
                        sortConfig[date].direction === "ascending" ? (
                          <i className="bi bi-arrow-up ms-2"></i>
                        ) : (
                          <i className="bi bi-arrow-down ms-2"></i>
                        )
                      ) : (
                        <i className="bi bi-arrow-down-up ms-2"></i>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData(date).map((expense) => (
                  <tr key={expense.id}>
                    <td style={{ width: "100px" }}>{expense.index}</td>
                    <td style={{ width: "300px" }}>{expense.expenseName}</td>
                    <td style={{ width: "150px", textAlign: "center" }}>
                      {expense.amount}
                    </td>
                    <td style={{ width: "120px", textAlign: "center" }}>
                      {expense.type}
                    </td>
                    <td style={{ width: "250px", textAlign: "center" }}>
                      {methodMapping[expense.paymentMethod] ||
                        expense.paymentMethod}
                    </td>
                    <td style={{ width: "200px" }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{expense.netAmount}</span>
                        <div className="editDiv">
                          <Link to={`/read/${expense.id}`} className="editLink">
                            <FontAwesomeIcon
                              icon={faEye}
                              style={{
                                marginRight: "10px",
                                color: "#007bff",
                                cursor: "pointer",
                                fontSize: "1em",
                                transition:
                                  "color 0.3s ease, transform 0.3s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.color = "#0056b3")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.color = "#007bff")
                              }
                            />
                          </Link>
                          <Link
                            to={`/edit/${expense.id}`}
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                            }}
                            className="editLink"
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              style={{
                                color: "#28a745",
                                fontSize: "1em",
                                cursor: "pointer",
                                transition:
                                  "color 0.3s ease, transform 0.3s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.color = "#218838")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.color = "#28a745")
                              }
                            />
                          </Link>
                          <FontAwesomeIcon
                            icon={faTrash}
                            onClick={() => handleDelete(expense.id)}
                            style={{
                              marginLeft: "8px",
                              color: "red",
                              cursor: "pointer",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Add total row */}
                <tr className="table-info">
                  <td colSpan="5" className="text-end fw-bold">
                    Total Expense:
                  </td>
                  <td className="fw-bold">{totalAmount(date)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <div className="alert alert-info text-center">No data found.</div>
      )}
    </div>
  );
};

export default FilteredTable;
