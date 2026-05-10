import { useEffect, useState } from 'react'
import { compareData } from '../services/api'
import { LoadingSpinner } from './ui/Skeleton'

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

  const columns = comparison.cleaned_data.length > 0
    ? Object.keys(comparison.cleaned_data[0])
    : []

  return (
    <div className="card-dark p-6">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Original vs Cleaned Data</h2>

      {comparison.changes.length > 0 && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <h3 className="font-semibold text-amber-400 mb-2">Changes Applied:</h3>
          <ul className="space-y-1">
            {comparison.changes.map((change, idx) => (
              <li key={idx} className="text-sm text-amber-300">
                • {change.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('original')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'original'
              ? 'bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          }`}
        >
          Original ({comparison.original_data.length} rows)
        </button>
        <button
          onClick={() => setActiveTab('cleaned')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'cleaned'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          }`}
        >
          Cleaned ({comparison.cleaned_data.length} rows)
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
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
            {(activeTab === 'original' ? comparison.original_data : comparison.cleaned_data).map((row, idx) => (
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

      {comparison.original_data.length === comparison.cleaned_data.length &&
       comparison.changes.length === 0 && (
        <p className="mt-4 text-center text-slate-500">No changes were made to the data.</p>
      )}
    </div>
  )
}