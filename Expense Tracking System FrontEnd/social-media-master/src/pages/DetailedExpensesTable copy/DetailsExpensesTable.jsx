import React, { useState, useEffect } from "react";
import { useTable, usePagination, useSortBy, useFilters } from "react-table";
import "../DetailedExpensesTable/DetailedExpensesTable.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { saveExpenses } from "../../Redux/Expenses/expense.action";
import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

const DefaultColumnFilter = ({ column: { filterValue, setFilter } }) => (
  <input
    value={filterValue || ""}
    onChange={(e) => setFilter(e.target.value || undefined)}
    placeholder="Search"
    className="filter-input"
  />
);

const DetailedExpensesTable = ({ data: initialData, loading, error }) => {
  const [tableData, setTableData] = useState(initialData);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: saveLoading, error: saveError } = useSelector(
    (state) => state.savedExpenses
  );

  useEffect(() => {
    setTableData(initialData); // Update if parent data changes
  }, [initialData]);

  const toggleRowSelected = (rowIndex, rowData) => {
    setSelectedRows((prevSelected) => {
      const updated = { ...prevSelected };
      const key = rowData.id ?? rowIndex;

      if (updated[key]) {
        delete updated[key];
      } else {
        updated[key] = rowData;
      }

      return updated;
    });
  };

  const toggleSelectAll = () => {
    const newSelectedRows = {};
    if (!selectAll) {
      page.forEach((row) => {
        const key = row.original.id ?? row.index;
        newSelectedRows[key] = row.original;
      });
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = () => {
    const selectedKeys = new Set(Object.keys(selectedRows));
    const newData = tableData.filter((row, index) => {
      const key = row.id ?? index;
      return !selectedKeys.has(key.toString());
    });

    setTableData(newData);
    setSelectedRows({});
    setSelectAll(false);
  };

  const handleSaveData = async () => {
    try {
      await dispatch(saveExpenses(tableData));
      setShowSuccessPopup(true);
      setSelectedRows({});
      setTimeout(() => {
        navigate("/");
        // alert("Saved successfully!");
      }, 1000); // brief delay before redirecting
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: (
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
            title="Select All"
          />
        ),
        id: "selection",
        Cell: ({ row }) => {
          const key = row.original.id ?? row.index;
          return (
            <input
              type="checkbox"
              checked={!!selectedRows[key]}
              onChange={() => toggleRowSelected(row.index, row.original)}
            />
          );
        },
        disableSortBy: true,
      },
      {
        Header: "Date",
        accessor: "date",
        Filter: DefaultColumnFilter,
      },
      {
        Header: "Expense Name",
        accessor: "expense.expenseName",
        Filter: DefaultColumnFilter,
      },
      {
        Header: "Amount",
        accessor: "expense.amount",
        Cell: ({ value }) => value.toFixed(0),
        Filter: DefaultColumnFilter,
      },
      {
        Header: "Type",
        accessor: "expense.type",
        Filter: DefaultColumnFilter,
      },
      {
        Header: "Payment Method",
        accessor: "expense.paymentMethod",
        Filter: DefaultColumnFilter,
      },
      {
        Header: "Comments",
        accessor: "expense.comments",
        Cell: ({ value }) => value || "No Comments",
        Filter: DefaultColumnFilter,
      },
    ],
    [selectedRows, selectAll]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setAllFilters,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: tableData,
      initialState: { pageIndex: 0, pageSize: 14 },
      defaultColumn: { Filter: DefaultColumnFilter },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  useEffect(() => {
    if (page.length === 0) return;
    const allSelected = page.every(
      (row) => selectedRows[row.original.id ?? row.index]
    );
    setSelectAll(allSelected);
  }, [page, selectedRows]);

  const clearAllFilters = () => setAllFilters([]);

  if (loading || saveLoading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );

  if (error || saveError) return <p>{error || saveError}</p>;

  return (
    <div className="table-container">
      <div className="top-buttons d-flex justify-content-between align-items-center mb-3">
        <div
          className="d-flex align-items-center"
          style={{ marginTop: "30px" }}
        >
          <button className="clear-all-btn me-3" onClick={clearAllFilters}>
            Clear All Filters
          </button>
        </div>

        <div className="flex-grow-1 text-center" style={{ marginTop: "30px" }}>
          <h1 className="summary-header-text m-0">Expenses</h1>
        </div>

        <div
          className="d-flex gap-2 align-items-center"
          style={{ marginRight: "50px", marginTop: "30px" }}
        >
          {/* Apply "invisible" class if no rows are selected */}
          <button
            className={`clear-all-btn ${
              Object.keys(selectedRows).length === 0 ? "invisible" : ""
            }`}
            onClick={handleDeleteSelected}
          >
            Delete Selected
          </button>
          <button
            className="clear-all-btn"
            onClick={handleSaveData}
            disabled={showSuccessPopup}
          >
            Save
          </button>
        </div>
      </div>

      <table {...getTableProps()} className="budget-table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <React.Fragment key={headerGroup.id}>
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    key={column.id}
                    {...column.getHeaderProps(
                      column.id !== "selection"
                        ? column.getSortByToggleProps()
                        : {}
                    )}
                  >
                    <div>
                      {column.render("Header")}
                      {column.id !== "selection" && (
                        <span>
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <FontAwesomeIcon icon={faSortDown} />
                            ) : (
                              <FontAwesomeIcon icon={faSortUp} />
                            )
                          ) : (
                            <FontAwesomeIcon icon={faSort} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="filter-row">
                {headerGroup.headers.map((column) => (
                  <td key={column.id}>
                    {column.canFilter ? column.render("Filter") : null}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            const key = row.original.id ?? row.index;
            const isSelected = !!selectedRows[key];
            return (
              <tr
                key={row.id}
                {...row.getRowProps()}
                className={isSelected ? "selected-row" : ""}
              >
                {row.cells.map((cell) => (
                  <td key={cell.column.id} {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>
        <span className="page-of">
          Page {pageIndex + 1} of {pageOptions.length}
        </span>
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>
        <button
          onClick={() => gotoPage(pageOptions.length - 1)}
          disabled={!canNextPage}
        >
          {">>"}
        </button>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[10, 20, 30, 50, 100, 200].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DetailedExpensesTable;
