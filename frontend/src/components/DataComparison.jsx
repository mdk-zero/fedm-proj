import { useEffect, useState } from 'react'
import { compareData } from '../services/api'
import { LoadingSpinner } from './ui/Skeleton'
import DataTable from './DataTable'

export default function DataComparison({ sessionId }) {
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('cleaned')

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const result = await compareData(sessionId)
        setComparison(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchComparison()
  }, [sessionId])

  if (loading) {
    return (
      <div className="card-dark p-8 text-center">
        <LoadingSpinner />
        <p className="text-slate-500 mt-3">Loading comparison...</p>
      </div>
    )
  }

  if (!comparison) {
    return (
      <div className="card-dark p-8 text-center">
        <p className="text-slate-500">No data available</p>
      </div>
    )
  }

  const activeData = activeTab === 'original' ? comparison.original_data : comparison.cleaned_data
  const columns = activeData.length > 0 ? Object.keys(activeData[0]) : []

  return (
    <div className="card-dark p-4 space-y-4">
      <h2 className="text-lg font-bold text-slate-100">Original vs Cleaned Data</h2>

      {comparison.changes.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <h3 className="font-semibold text-amber-400 mb-2 text-sm">Changes Applied:</h3>
          <ul className="space-y-1">
            {comparison.changes.map((change, idx) => (
              <li key={idx} className="text-xs text-amber-300">
                • {change.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('original')}
          className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'original'
              ? 'bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          }`}
        >
          Original ({comparison.original_data.length} rows)
        </button>
        <button
          onClick={() => setActiveTab('cleaned')}
          className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'cleaned'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          }`}
        >
          Cleaned ({comparison.cleaned_data.length} rows)
        </button>
      </div>

      {columns.length > 0 && (
        <ComparisonTable data={activeData} columns={columns} />
      )}

      {comparison.original_data.length === comparison.cleaned_data.length &&
       comparison.changes.length === 0 && (
        <p className="text-center text-slate-500 text-sm">No changes were made to the data.</p>
      )}
    </div>
  )
}

function ComparisonTable({ data, columns }) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [pageInput, setPageInput] = useState('1')

  const totalRows = data.length
  const totalPages = Math.ceil(totalRows / limit) || 1
  const startIdx = (page - 1) * limit
  const pageData = data.slice(startIdx, startIdx + limit)

  useEffect(() => {
    setPageInput(String(page))
  }, [page])

  if (!data || data.length === 0) {
    return <p className="text-slate-500 text-center py-4">No data available</p>
  }

  const handlePageInput = (e) => {
    if (e.key === 'Enter') {
      const newPage = parseInt(pageInput, 10)
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage)
      } else {
        setPageInput(String(page))
      }
    }
  }

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10)
    setLimit(newLimit)
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  return (
    <div className="flex flex-col max-h-[calc(100vh-400px)]">
      <div className="flex-1 overflow-auto custom-scrollbar rounded-lg border border-slate-700">
        <table className="table-dark">
          <thead className="sticky top-0 z-10">
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

      <div className="px-4 py-3 bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Show</span>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-primary-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>rows</span>
          <span className="text-slate-500">|</span>
          <span>{startIdx + 1}-{Math.min(startIdx + limit, totalRows)} of {totalRows.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
            title="First page"
          >
            ««
          </button>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
            title="Previous page"
          >
            «
          </button>

          <div className="flex items-center gap-1 text-sm text-slate-400">
            <span>Page</span>
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={handlePageInput}
              className="w-12 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-center text-slate-200 focus:outline-none focus:border-primary-500"
            />
            <span>of {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
            title="Next page"
          >
            »
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
            title="Last page"
          >
            »»
          </button>
        </div>
      </div>
    </div>
  )
}