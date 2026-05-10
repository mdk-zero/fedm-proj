import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DataTable({ data }) {
  const [page, setPage] = useState(1)
  const limit = 50
  const totalPages = Math.ceil(data.data.length / limit) || 1

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="card-dark p-8 text-center">
        <p className="text-slate-500">No data available</p>
      </div>
    )
  }

  const columns = data.columns
  const startIdx = (page - 1) * limit
  const pageData = data.data.slice(startIdx, startIdx + limit)

  return (
    <div className="card-dark overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="table-dark">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap">
                    {row[col] === null || row[col] === undefined ? (
                      <span className="text-slate-600 italic">null</span>
                    ) : (
                      <span className="text-slate-300">{String(row[col])}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-slate-800/50 flex items-center justify-between border-t border-slate-700">
        <span className="text-sm text-slate-400">
          Showing {startIdx + 1} to {Math.min(startIdx + limit, data.data.length)} of {data.data.length} rows
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-slate-400 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}