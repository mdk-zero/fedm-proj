import { useEffect, useState } from 'react'
import { getInsights } from '../services/api'
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'
import { LoadingSpinner } from './ui/Skeleton'

export default function InsightsPanel({ sessionId, refreshKey }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      try {
        const result = await getInsights(sessionId)
        setInsights(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [sessionId, refreshKey])

  if (loading) {
    return (
      <div className="card-dark p-8 text-center">
        <LoadingSpinner />
        <p className="text-slate-500 mt-3">Generating insights...</p>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="card-dark p-8 text-center">
        <p className="text-slate-500">No data available</p>
      </div>
    )
  }

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-emerald-400" />
    if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-rose-400" />
    return <Minus className="h-4 w-4 text-slate-500" />
  }

  return (
    <div className="card-dark p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary-400" />
        <h2 className="text-lg font-bold text-slate-100">Data Insights</h2>
      </div>

      {Object.keys(insights.summary_stats || {}).length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Summary Statistics</h3>
          <div className="max-h-32 overflow-auto rounded-lg border border-slate-700 custom-scrollbar">
            <table className="w-full text-xs">
              <thead className="bg-slate-800 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium text-slate-400">Column</th>
                  <th className="px-2 py-1.5 text-right font-medium text-slate-400">Count</th>
                  <th className="px-2 py-1.5 text-right font-medium text-slate-400">Mean</th>
                  <th className="px-2 py-1.5 text-right font-medium text-slate-400">Min</th>
                  <th className="px-2 py-1.5 text-right font-medium text-slate-400">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {Object.entries(insights.summary_stats || {}).map(([col, stats]) => (
                  <tr key={col} className="hover:bg-slate-800/30">
                    <td className="px-2 py-1.5 font-medium text-slate-300">{col}</td>
                    <td className="px-2 py-1.5 text-right text-slate-400">{stats.count}</td>
                    <td className="px-2 py-1.5 text-right text-slate-400">{stats.mean?.toFixed(1) || '-'}</td>
                    <td className="px-2 py-1.5 text-right text-slate-400">{stats.min || '-'}</td>
                    <td className="px-2 py-1.5 text-right text-slate-400">{stats.max || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {Object.keys(insights.trends || {}).length > 0 && (
        <div className="mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Trends</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(insights.trends || {}).map(([col, trend]) => (
              <div key={col} className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded border border-slate-700 text-xs">
                <span className="font-medium text-slate-300">{col}</span>
                <span className={`text-[10px] ${
                  trend === 'increasing' ? 'text-emerald-400' :
                  trend === 'decreasing' ? 'text-rose-400' : 'text-slate-500'
                }`}>
                  {trend}
                </span>
                {getTrendIcon(trend)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Frequent Values</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(insights.frequent_values || {}).slice(0, 4).map(([col, values]) => (
            <div key={col} className="p-2 bg-slate-800/30 rounded border border-slate-700">
              <h4 className="font-medium text-slate-300 text-xs mb-1">{col}</h4>
              <div className="space-y-0.5">
                {values.slice(0, 2).map(([val, count], idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 truncate">{String(val)}</span>
                    <span className="text-slate-600">({count})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}