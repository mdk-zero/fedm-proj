import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { getData } from '../services/api'

const PAGE_SIZES = [15, 20, 30, 50]

export default function DataTable({ sessionId, maxHeight = 'h-[calc(100vh-320px)]' }) {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [tableData, setTableData] = useState(null)
  const [limit, setLimit] = useState(15)
  const [pageInput, setPageInput] = useState('1')

  useEffect(() => {
    if (sessionId) {
      loadPage(1)
    }
  }, [sessionId])

  useEffect(() => {
    setPageInput(String(page))
  }, [page])

  const loadPage = async (newPage, newLimit = limit) => {
    setLoading(true)
    try {
      const result = await getData(sessionId, newPage, newLimit)
      setTableData(result)
      setPage(newPage)
      setLimit(newLimit)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageInput = (e) => {
    if (e.key === 'Enter') {
      const newPage = parseInt(pageInput, 10)
      if (newPage >= 1 && newPage <= totalPages) {
        loadPage(newPage)
      } else {
        setPageInput(String(page))
      }
    }
  }

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10)
    loadPage(1, newLimit)
  }

  if (!sessionId) {
    return (
      <div className="card-dark p-8 text-center">
        <p className="text-slate-500">No session available</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card-dark p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400 mx-auto mb-2" />
        <p className="text-slate-500">Loading data...</p>
      </div>
    )
  }

  if (!tableData || !tableData.data || tableData.data.length === 0) {
    return (
      <div className="card-dark p-8 text-center">
        <p className="text-slate-500">No data available</p>
      </div>
    )
  }

  const totalRows = tableData.total_rows || tableData.data.length
  const totalPages = Math.ceil(totalRows / limit) || 1
  const columns = tableData.columns
  const pageData = tableData.data
  const startIdx = (page - 1) * limit

  const heightClass = maxHeight === 'h-full' ? 'flex-1 min-h-0' : maxHeight

  return (
    <div className={`card-dark overflow-hidden flex flex-col ${heightClass}`}>
      <div className="flex-1 overflow-auto custom-scrollbar">
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

      <div className="px-4 py-2 bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Show</span>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-primary-500"
          >
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>rows</span>
          <span className="text-slate-500">|</span>
          <span>
            {startIdx + 1}-{Math.min(startIdx + limit, totalRows)} of {totalRows.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPage(1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => loadPage(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
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
            onClick={() => loadPage(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => loadPage(totalPages)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}