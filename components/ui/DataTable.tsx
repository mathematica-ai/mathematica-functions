'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DataTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
  }[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function DataTable({ data, columns, onEdit, onDelete }: DataTableProps) {
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
                    onClick={() => onEdit(row.id)}
                    className="btn btn-sm btn-primary"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={() => onDelete(row.id)}
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