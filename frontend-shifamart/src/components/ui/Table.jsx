import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

/**
 * Responsive Table component with pagination
 * @param {Object} props
 * @param {Array} props.columns - Column definitions [{ key, header, render }]
 * @param {Array} props.data - Data array
 * @param {Function} props.onRowClick - Row click handler
 * @param {Object} props.pagination - Pagination props { page, totalPages, onPageChange }
 * @param {boolean} props.loading - Loading state
 */
const Table = ({ 
  columns, 
  data, 
  onRowClick, 
  pagination, 
  loading,
  className 
}) => {
  return (
    <div className={clsx('w-full', className)}>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className="px-6 py-3 font-medium whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-12 text-center text-neutral-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((row, i) => (
                <tr 
                  key={row.id || i}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    'hover:bg-neutral-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-neutral-500">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
