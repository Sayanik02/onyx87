import React, { ReactNode } from 'react';

interface Column {
  key: string;
  header: ReactNode;
  render?: (row: any) => ReactNode;
  width?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
}

export const Table: React.FC<TableProps> = ({ columns, data, emptyMessage = "No data available" }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            {columns.map((col, i) => (
              <th key={col.key || i} className="py-3 px-4 text-xs font-semibold" style={{ color: 'var(--text-faint)', width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b last:border-0 transition-colors" style={{ borderColor: 'var(--border)', backgroundColor: 'transparent' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-3 px-4 text-sm" style={{ color: 'var(--text)' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
