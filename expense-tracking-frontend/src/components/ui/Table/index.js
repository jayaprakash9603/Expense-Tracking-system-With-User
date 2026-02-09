/**
 * Table Components
 *
 * Theme-aware table components with search, filter, and pagination.
 *
 * Components:
 * - AppTable: Simple table with sorting
 * - AppDataTable: Full-featured table with search, filter, pagination
 *
 * Usage:
 *   import { AppTable, AppDataTable } from '../ui/Table';
 *
 *   // Simple table
 *   <AppTable
 *     columns={[
 *       { field: 'name', label: 'Name' },
 *       { field: 'amount', label: 'Amount', align: 'right' },
 *     ]}
 *     data={items}
 *     sortable
 *     onRowClick={(row) => handleEdit(row)}
 *   />
 *
 *   // Data table with search and pagination
 *   <AppDataTable
 *     title="Expenses"
 *     columns={[
 *       { field: 'name', label: 'Name', searchable: true },
 *       { field: 'category', label: 'Category', filterable: true },
 *       { field: 'amount', label: 'Amount', align: 'right', sortType: 'number' },
 *     ]}
 *     data={expenses}
 *     rowsPerPage={10}
 *     actions={(row) => (
 *       <IconButton onClick={() => handleDelete(row.id)}>
 *         <DeleteIcon />
 *       </IconButton>
 *     )}
 *   />
 */

export { default as AppTable } from "./AppTable";
export { default as AppDataTable } from "./AppDataTable";
