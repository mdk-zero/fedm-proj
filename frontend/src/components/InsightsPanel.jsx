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
    <div className="card-dark p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary-400" />
        <h2 className="text-xl font-bold text-slate-100">Data Insights</h2>
      </div>

      {Object.keys(insights.summary_stats || {}).length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Summary Statistics</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Column</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Count</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Mean</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Std Dev</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Min</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {Object.entries(insights.summary_stats || {}).map(([col, stats]) => (
                  <tr key={col} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-300">{col}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{stats.count}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{stats.mean || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{stats.std || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{stats.min || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{stats.max || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {Object.keys(insights.trends || {}).length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Trends</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(insights.trends || {}).map(([col, trend]) => (
              <div key={col} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <span className="font-medium text-slate-300">{col}</span>
                <span className={`text-sm ${
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
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Most Frequent Values</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(insights.frequent_values || {}).slice(0, 6).map(([col, values]) => (
            <div key={col} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700">
              <h4 className="font-medium text-slate-300 mb-3">{col}</h4>
              <div className="space-y-2">
                {values.slice(0, 3).map(([val, count], idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 truncate max-w-[140px]">{String(val)}</span>
                    <span className="text-slate-600 text-xs">({count})</span>
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