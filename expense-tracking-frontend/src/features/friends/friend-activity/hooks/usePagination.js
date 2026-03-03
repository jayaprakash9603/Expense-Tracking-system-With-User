/**
 * usePagination Hook for Friend Activity
 * Handles pagination logic for activity lists.
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import { PAGINATION } from "../constants";

/**
 * Custom hook for pagination
 * @param {Array} data - Array of items to paginate
 * @param {number} initialPageSize - Initial items per page
 * @returns {Object} Pagination state and controls
 */
export const usePagination = (
  data = [],
  initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE,
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Total pages calculation
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / pageSize));
  }, [data.length, pageSize]);

  // Reset to page 1 when data changes significantly
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [data.length, currentPage, totalPages]);

  // Paginated data slice
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Navigation functions
  const goToPage = useCallback(
    (page) => {
      const safePage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(safePage);
    },
    [totalPages],
  );

  const goToNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Change page size
  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when size changes
  }, []);

  // Pagination info for display
  const paginationInfo = useMemo(() => {
    const startItem = data.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, data.length);

    return {
      currentPage,
      totalPages,
      pageSize,
      totalItems: data.length,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
    };
  }, [currentPage, totalPages, pageSize, data.length]);

  // Generate page numbers for pagination UI
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at edges
      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    // Data
    paginatedData,

    // State
    currentPage,
    pageSize,
    totalPages,

    // Info
    paginationInfo,
    pageNumbers,

    // Actions
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    setCurrentPage,
    setPageSize,
  };
};

export default usePagination;
