import { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

const DataTable = ({ columns, rows, initialSort }) => {
  const [sortKey, setSortKey] = useState(initialSort?.key ?? null);
  const [sortDir, setSortDir] = useState(initialSort?.dir ?? 'asc');

  const sortedRows = useMemo(() => {
    if (!sortKey) {
      return rows;
    }

    const sorted = [...rows].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return sortDir === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return sorted;
  }, [rows, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDir('asc');
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-teal-100 shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="text-left text-xs text-slate-600 uppercase tracking-[0.1em] bg-gradient-to-r from-white to-teal-50 border-b border-teal-100">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="py-3.5 px-4 font-bold text-slate-900">
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-teal-600 transition"
                  >
                    {column.label}
                    <ArrowUpDown size={14} />
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-teal-100">
          {sortedRows.map((row, index) => (
            <tr key={row.id ?? index} className="hover:bg-teal-50/30 transition">
              {columns.map((column) => (
                <td key={`${row.id ?? index}-${column.key}`} className="py-3.5 px-4 text-slate-900">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
