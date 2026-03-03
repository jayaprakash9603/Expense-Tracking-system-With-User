import { useState, useMemo, useEffect } from 'react';

export const usePagination = (data, itemsPerPage = 4) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  return {
    currentPage,
    totalPages,
    paginatedData,
    setCurrentPage
  };
};