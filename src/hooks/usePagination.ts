import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
  data: T[];
  initialPage?: number;
  initialRowsPerPage?: number;
  rowsPerPageOptions?: number[];
}

interface UsePaginationReturn<T> {
  // Data
  paginatedData: T[];
  totalItems: number;
  totalPages: number;

  // Pagination state
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions: number[];

  // Pagination info
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Actions
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  resetPagination: () => void;
}

export const usePagination = <T>({
  data,
  initialPage = 1,
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
}: UsePaginationProps<T>): UsePaginationReturn<T> => {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Memoized calculations
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  // Memoized paginated data
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  // Actions
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setPage(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setPage(page - 1);
    }
  };

  const goToFirstPage = () => {
    setPage(1);
  };

  const goToLastPage = () => {
    setPage(totalPages);
  };

  const resetPagination = () => {
    setPage(initialPage);
    setRowsPerPage(initialRowsPerPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing rows per page
  };

  return {
    // Data
    paginatedData,
    totalItems,
    totalPages,

    // Pagination state
    page,
    rowsPerPage,
    rowsPerPageOptions,

    // Pagination info
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,

    // Actions
    setPage,
    setRowsPerPage: handleRowsPerPageChange,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    resetPagination,
  };
};
