'use client';

type Row = {
  id: string | number;
  [key: string]: any;
};

interface Column {
  key: string;
  label: string;
}

interface DataTableProps<T extends Row> {
  data: T[];
  columns: Column[];
  // These callbacks are used in the implementation
  /* eslint-disable no-unused-vars */
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  /* eslint-enable no-unused-vars */
}

export default function DataTable<T extends Row>({ 
  data, 
  columns, 
  onEdit, 
  onDelete 
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={`${row.id}-${column.key}`}>{row[column.key]}</td>
              ))}
              <td className="flex gap-2">
                {onEdit && (
                  <button 
                    onClick={() => onEdit(row)}
                    className="btn btn-sm btn-primary"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={() => onDelete(row)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 