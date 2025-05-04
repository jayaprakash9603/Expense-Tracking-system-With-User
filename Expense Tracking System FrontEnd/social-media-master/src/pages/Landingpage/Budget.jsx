import React, { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  getBudgetData,
  deleteBudgetData,
  getBudgetById,
  getBudgetReportById,
} from "../../Redux/Budget/budget.action";
import { useNavigate } from "react-router-dom";
import { CiFilter } from "react-icons/ci";
import { MdFilterList } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { FaEdit, FaTrash } from "react-icons/fa";
import Modal from "./Modal"; // Adjust path as needed
import ToastNotification from "./ToastNotification"; // Adjust path as needed
import { FiFileText } from "react-icons/fi";
import {
  getExpensesAction,
  getExpensesByBudgetId,
} from "../../Redux/Expenses/expense.action";

const Budget = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(13);
  const [sorting, setSorting] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuBudgetId, setMenuBudgetId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "" });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { budgets, loading, error } = useSelector((state) => state.budgets);
  const menuRef = useRef(null);

  // Fetch budget data on component mount
  useEffect(() => {
    dispatch(getBudgetData());
    dispatch(getExpensesAction());
  }, [dispatch]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAnchor(null);
        setMenuBudgetId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNewBudgetClick = () => {
    navigate("/budget/create");
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const newSelectedRows = {};
    if (newSelectAll) {
      table.getRowModel().rows.forEach((row) => {
        newSelectedRows[row.id] = true;
      });
    }
    setSelectedRows(newSelectedRows);
  };

  const handleMenuClick = (event, budgetId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 120; // Matches minWidth of the menu
    const leftPosition = Math.max(0, rect.left + window.scrollX - menuWidth);
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: leftPosition,
    });
    setMenuAnchor(event.currentTarget);
    setMenuBudgetId(budgetId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuBudgetId(null);
  };

  const handleEdit = () => {
    dispatch(getBudgetById(menuBudgetId));

    navigate(`/budget/edit/${menuBudgetId}`);
    handleMenuClose();
  };
  const handleReport = async () => {
    await dispatch(getExpensesByBudgetId(menuBudgetId));
    await dispatch(getBudgetReportById(menuBudgetId));
    handleMenuClose();
    navigate(`/budget/report/${menuBudgetId}`);
  };

  const handleDelete = () => {
    const budget = budgets.find((b) => b.id === menuBudgetId);
    if (budget) {
      setBudgetToDelete(budget);
      setIsDeleteModalOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      dispatch(deleteBudgetData(budgetToDelete.id))
        .then(() => {
          dispatch(getBudgetData());
          setToast({ open: true, message: "Budget deleted successfully." });
        })
        .catch((error) => {
          console.error("Error deleting budget:", error);
          setToast({
            open: true,
            message: "Error deleting budget. Please try again.",
          });
        })
        .finally(() => {
          setIsDeleteModalOpen(false);
          setBudgetToDelete(null);
        });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setBudgetToDelete(null);
  };

  const handleToastClose = () => {
    setToast({ open: false, message: "" });
  };

  const columns = useMemo(
    () => [
      {
        header: () => (
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="form-checkbox h-5 w-5 bg-[#666666] text-[#04d2c1] border-gray-600 rounded"
            style={{ borderRadius: "4px" }}
          />
        ),
        id: "checkbox",
        size: 50,
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRows[row.id] || false}
            onChange={() => {
              setSelectedRows((prev) => {
                const newSelected = { ...prev, [row.id]: !prev[row.id] };
                const allSelected =
                  table.getRowModel().rows.every((r) => newSelected[r.id]) &&
                  table.getRowModel().rows.length > 0;
                setSelectAll(allSelected);
                return newSelected;
              });
            }}
            className="form-checkbox h-5 w-5 bg-[#666666] text-[#04d2c1] border-gray-600 rounded"
            style={{ borderRadius: "4px" }}
          />
        ),
        enableSorting: false,
      },
      {
        header: "Name",
        accessorKey: "name",
        size: 150,
        cell: ({ getValue }) => getValue() || "N/A",
        enableSorting: true,
      },
      {
        header: "Description",
        accessorKey: "description",
        size: 200,
        cell: ({ getValue }) => getValue() || "N/A",
        enableSorting: true,
      },
      {
        header: "Amount",
        accessorKey: "amount",
        size: 100,
        cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
        enableSorting: true,
      },
      {
        header: "Start Date",
        accessorKey: "startDate",
        size: 120,
        cell: ({ getValue }) => getValue() || "N/A",
        enableSorting: true,
      },
      {
        header: "End Date",
        accessorKey: "endDate",
        size: 120,
        cell: ({ getValue }) => getValue() || "N/A",
        enableSorting: true,
      },
      {
        header: "Remaining",
        accessorKey: "remainingAmount",
        size: 100,
        cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
        enableSorting: true,
      },
      {
        header: "",
        id: "actions",
        size: 50,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={(e) => handleMenuClick(e, row.original.id)}
              className="text-white hover:text-[#00dac6] focus:outline-none "
            >
              ⋮
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [selectedRows, selectAll]
  );

  const table = useReactTable({
    data: budgets || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
    },
    pageCount: Math.ceil((budgets?.length || 0) / pageSize),
  });

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPageIndex(0);
    setSelectedRows({});
    setSelectAll(false);
  };

  // Calculate fixed table height for 13 rows: header (40px) + 13 rows (43.5px each)
  const tableHeight = 40 + 13 * 43.5; // ~605.5px

  // Modal data and header names
  const modalData = budgetToDelete
    ? {
        name: budgetToDelete.name || "N/A",
        amount: budgetToDelete.amount
          ? `$${budgetToDelete.amount.toFixed(2)}`
          : "N/A",
        description: budgetToDelete.description || "N/A",
        startDate: budgetToDelete.startDate || "N/A",
        endDate: budgetToDelete.endDate || "N/A",
        remainingAmount: budgetToDelete.remainingAmount
          ? `$${budgetToDelete.remainingAmount.toFixed(2)}`
          : "N/A",
      }
    : {};

  const headerNames = {
    name: "Name",
    amount: "Amount",
    description: "Description",
    startDate: "Start Date",
    endDate: "End Date",
    remainingAmount: "Remaining",
  };

  return (
    <div className="bg-[#1b1b1b]">
      <div className="w-[calc(100vw-370px)] h-[50px] bg-[#1b1b1b]"></div>
      <div
        className="flex flex-col justify-between items-center flex-shrink-1 flex-grow-1 align-self-stretch"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: "1px solid rgb(0, 0, 0)",
          opacity: 1,
          padding: "16px",
          marginRight: "20px",
        }}
      >
        <div className="w-full flex flex-col h-full ">
          <div className="w-full flex-col">
            <div className="w-full flex justify-between items-center">
              <div>
                <p className="text-white font-bold text-5xl">Budgets</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewBudgetClick}
                  className="bg-[#00dac6] text-black font-bold px-4 py-2 rounded cursor-pointer"
                >
                  + New Budget
                </button>
                <div className="w-10 h-10 bg-[#1b1b1b] flex items-center justify-center rounded cursor-pointer">
                  <CiFilter className="text-[#00dac6]" />
                </div>
                <div className="w-10 h-10 bg-[#1b1b1b] flex items-center justify-center rounded cursor-pointer">
                  <MdFilterList className="text-[#00dac6]" />
                </div>
                <div className="w-10 h-10 bg-[#1b1b1b] flex items-center justify-center rounded cursor-pointer">
                  <BsThreeDots className="text-[#00dac6]" />
                </div>
              </div>
            </div>
            <hr className="border-t border-gray-600 w-full mt-1 mb-4" />
          </div>

          <div className="flex-1 flex flex-col">
            {loading ? (
              <div
                className="text-center text-gray-400 py-8"
                style={{ height: `${tableHeight}px` }}
              >
                Loading...
              </div>
            ) : error ? (
              <div
                className="text-center text-red-500 py-8"
                style={{ height: `${tableHeight}px` }}
              >
                Error: {error.message || "Failed to load budgets."}
              </div>
            ) : (
              <>
                <div
                  className="overflow-x-auto overflow-y-auto border border-gray-600 rounded relative"
                  style={{ height: `${tableHeight}px` }}
                >
                  <table className="w-full text-white border-collapse">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-4 py-2 text-left bg-[#29282b] border-b border-gray-600 sticky top-0 z-10 cursor-pointer"
                              style={{
                                width: header.column.columnDef.size,
                                minWidth: header.column.columnDef.size,
                                maxWidth: header.column.columnDef.size,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                height: "40px",
                              }}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div className="flex items-center">
                                {typeof header.column.columnDef.header ===
                                "function"
                                  ? header.column.columnDef.header()
                                  : header.column.columnDef.header}
                                {{
                                  asc: " ↑",
                                  desc: " ↓",
                                }[header.column.getIsSorted()] ?? null}
                              </div>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="px-4 py-2 text-center text-gray-400 border-b border-gray-600"
                            style={{ height: `${tableHeight - 40}px` }}
                          >
                            No rows found
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="border-b border-gray-600">
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-4 py-2"
                                style={{
                                  width: cell.column.columnDef.size,
                                  minWidth: cell.column.columnDef.size,
                                  maxWidth: cell.column.columnDef.size,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  height: "42px",
                                }}
                              >
                                {cell.column.columnDef.cell
                                  ? cell.column.columnDef.cell(cell)
                                  : cell.getValue()}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div
                  className="flex justify-between items-center bg-[#0b0b0b] py-2 sticky bottom-0 z-20  border-gray-600 mt-10 px-4"
                  style={{ width: "100%" }}
                >
                  {/* Left spacer to center middle section */}
                  <div className="w-1/3" />

                  {/* Center: Pagination controls */}
                  <div className="flex items-center gap-2 justify-center w-1/3">
                    <button
                      onClick={() => setPageIndex(pageIndex - 1)}
                      disabled={!table.getCanPreviousPage()}
                      className={`px-3 py-1 rounded text-sm ${
                        table.getCanPreviousPage()
                          ? "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Previous
                    </button>
                    <span className="text-white text-sm">
                      Page{" "}
                      <strong>
                        {pageIndex + 1} of {table.getPageCount()}
                      </strong>
                    </span>
                    <button
                      onClick={() => setPageIndex(pageIndex + 1)}
                      disabled={!table.getCanNextPage()}
                      className={`px-3 py-1 rounded text-sm ${
                        table.getCanNextPage()
                          ? "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Next
                    </button>
                  </div>

                  {/* Right: Page size dropdown */}
                  <div className="w-1/3 flex justify-end">
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="px-3 py-1 bg-[#29282b] text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#00dac6] text-sm"
                    >
                      {[5, 10, 13, 15, 20].map((size) => (
                        <option key={size} value={size}>
                          Show {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ToastNotification
        open={toast.open}
        message={toast.message}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Deletion Confirmation"
        data={modalData}
        headerNames={headerNames}
        onApprove={handleConfirmDelete}
        onDecline={handleCancelDelete}
        approveText="Yes, Delete"
        declineText="No, Cancel"
        confirmationText={`Are you sure you want to delete the budget "${budgetToDelete?.name}"?`}
      />
      {menuAnchor && menuBudgetId && (
        <div
          ref={menuRef}
          className="fixed bg-[#1b1b1b] border border-gray-600 rounded shadow-lg z-50"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            minWidth: "120px",
          }}
        >
          <div
            className="flex items-center px-4 py-2 text-blue-500 hover:bg-[#2a2a2a] cursor-pointer"
            onClick={handleReport}
          >
            <FiFileText className="mr-2" />
            Report
          </div>
          <div
            className="flex items-center px-4 py-2 text-green-500 hover:bg-[#2a2a2a] cursor-pointer"
            onClick={handleEdit}
          >
            <FaEdit className="mr-2" />
            Edit
          </div>
          <div
            className="flex items-center px-4 py-2 text-red-500 hover:bg-[#2a2a2a] cursor-pointer"
            onClick={handleDelete}
          >
            <FaTrash className="mr-2" />
            Delete
          </div>
        </div>
      )}
      <div className="w-[calc(100vw-370px)] h-[50px] bg-[#1b1b1b]"></div>
      <style>
        {`
          .overflow-y-auto::-webkit-scrollbar {
            width: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #1b1b1b;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #00dac6;
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #00b8a0;
          }
          .overflow-x-auto::-webkit-scrollbar {
            height: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-track {
            background: #1b1b1b;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #00dac6;
            border-radius: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: #00b8a0;
          }
        `}
      </style>
    </div>
  );
};

export default Budget;
