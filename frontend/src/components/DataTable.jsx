import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';

const DataTable = ({
  data = [],
  columns = [],
  isLoading = false,
  totalRows = 0,
  pageSize = 5,
  currentPage = 1,
  onPageChange,
  onRowSelect,
  onSearch,
  selectedRows = [],
  onSearchChange,
  compact = true,
  onStatusChange,
  onExecute, // New prop for Execute button
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  
  // Handle row selection
  const handleRowSelect = (row, isSelected) => {
    if (onRowSelect) {
      onRowSelect(row, isSelected);
    }
  };

  // Handle search form submit - only updates the searchTerm state
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    // No longer triggers API calls directly
  };

  // Debounced search input - only updates state, doesn't trigger API
  useEffect(() => {
    // Skip the first render to prevent initial search
    const skipFirstRender = searchTerm === '';
    
    if (skipFirstRender) {
      return;
    }
    
    const delayDebounceFn = setTimeout(() => {
      if (onSearchChange) {
        // Only update search term state, don't trigger API call
        onSearchChange(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearchChange]);
  
  // Handle pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      console.log(`DataTable - Going to page ${page}`);
      onPageChange(page);
    }
  };
  
  // Check if a row is selected
  const isRowSelected = (row) => {
    return selectedRows.some(selectedRow => selectedRow.id === row.id);
  };

  // Handle row click for selection only (no auto-compose)
  const handleRowClick = (row) => {
    // Only toggle selection status, no longer triggers email composition
    handleRowSelect(row, !isRowSelected(row));
  };
  
  // Format cell content based on column type
  const formatCellContent = (column, value) => {
    if (value === null || value === undefined) return '-';
    
    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    } else if (column.type === 'datetime' && value) {
      return new Date(value).toLocaleString();
    } else if (column.type === 'status') {
      // For status columns, just show the status badge, no dropdown
      return (
        <div className="relative inline-block text-left">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${value === 'Success' ? 'bg-green-100 text-green-800' : 
              value === 'Failed' ? 'bg-red-100 text-red-800' : 
              value === 'Draft' ? 'bg-gray-100 text-gray-800' : 
              value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-blue-100 text-blue-800'}`}
          >
            {value}
          </span>
        </div>
      );
    } else if (column.type === 'file') {
      return value ? (
        <span className="text-primary-600 hover:underline cursor-pointer truncate max-w-[150px] inline-block" title={value}>
          {value.split('/').pop()}
        </span>
      ) : '-';
    }
    
    return value;
  };
  
  // Handle status filter change - only updates UI, doesn't fetch data
  const handleStatusChange = (status) => {
    setActiveStatus(status);
    if (onStatusChange) {
      onStatusChange(status);
    }
    // No longer triggers API calls directly
  };
  
  // Handle updating status variable
  const [updatingStatus, setUpdatingStatus] = useState(null);
  
  return (
    <div className="w-full bg-white rounded-lg shadow overflow-hidden relative">
      {/* Table Controls */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center justify-between gap-2 overflow-x-auto">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-1.5"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="ml-2 px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              Search
            </button>
          </form>
          
          {/* Status Filter Buttons */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {['All', 'Pending', 'Success', 'Failed'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  activeStatus === status
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          {/* Execute Button - The ONLY trigger for API calls */}
          <button
            onClick={() => {
              // Explicitly call onExecute to trigger API fetch with current filters
              if (onExecute) {
                onExecute(searchTerm, activeStatus);
              }
            }}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <ArrowPathIcon className="h-3.5 w-3.5 mr-1" />
            Execute
          </button>

          {/* Submit button removed */}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Selected Row Count */}
          {selectedRows.length > 0 && (
            <span className="text-xs text-primary-700 font-semibold">
              {selectedRows.length} {selectedRows.length === 1 ? 'row' : 'rows'} selected
            </span>
          )}
        </div>
      </div>
      
      {/* Table Container with both horizontal and vertical scrolling */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {/* Checkbox Column */}
              <th scope="col" className="w-8 px-2 py-1.5 text-left text-xs font-medium text-gray-500 tracking-wider">
                <input
                  type="checkbox"
                  className="focus:ring-primary-500 h-3 w-3 text-primary-600 border-gray-300 rounded"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all rows
                      if (onRowSelect) onRowSelect(data, true, true);
                    } else {
                      // Deselect all rows
                      if (onRowSelect) onRowSelect([], false, true);
                    }
                  }}
                />
              </th>
              
              {/* Column Headers */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-2 py-1.5 text-left text-xs font-medium text-gray-500 tracking-wider ${column.width ? column.width : ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Loading State
              <tr>
                <td colSpan={columns.length + 1} className="px-2 py-3 whitespace-nowrap text-center text-xs text-gray-500">
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length + 1} className="px-2 py-3 whitespace-nowrap text-center text-xs text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row) => (
                <tr 
                  key={row.id}
                  className={`hover:bg-gray-50 ${isRowSelected(row) ? 'bg-primary-50' : ''} cursor-pointer`}
                  onClick={() => handleRowClick(row)}
                >
                  {/* Checkbox Cell */}
                  <td className="px-2 py-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="focus:ring-primary-500 h-3 w-3 text-primary-600 border-gray-300 rounded"
                      checked={isRowSelected(row)}
                      onChange={(e) => handleRowSelect(row, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  
                  {/* Data Cells */}
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className={`px-2 py-1 whitespace-nowrap ${column.align === 'right' ? 'text-right' : ''} text-xs text-gray-800 truncate`}
                      style={{ maxWidth: column.width ? undefined : '150px' }}
                      title={row[column.key]}
                    >
                      {formatCellContent({...column, row}, row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        {/* Pagination Controls */}
      <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between relative overflow-x-auto">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`ml-3 relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-700">
              Showing <span className="font-medium">{totalRows === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, totalRows)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalRows)}</span> of{' '}
              <span className="font-medium">{totalRows}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-3 w-3" aria-hidden="true" />
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${
                      currentPage === pageNumber
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
