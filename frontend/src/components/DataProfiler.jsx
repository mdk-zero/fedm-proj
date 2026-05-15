import { useState } from 'react'
import { Database, Columns, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react'

export default function DataProfiler({ profiling, filename }) {
  if (!profiling) return null

  const [showStats, setShowStats] = useState(false)

  const missingCount = Object.values(profiling.missing_values || {}).reduce((a, b) => a + b, 0)

  const stats = [
    {
      label: 'Rows',
      value: profiling.rows?.toLocaleString(),
      icon: Database,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    },
    {
      label: 'Cols',
      value: profiling.columns,
      icon: Columns,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      label: 'Missing',
      value: missingCount.toLocaleString(),
      icon: AlertCircle,
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    },
    {
      label: 'Types',
      value: Object.keys(profiling.column_types || {}).length,
      icon: FileText,
      color: 'bg-violet-500/20 text-violet-400 border-violet-500/30'
    }
  ]

  const hasStats = Object.keys(profiling.basic_stats || {}).length > 0

  return (
    <div className="card-dark p-3 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-slate-100">Data Profiling</h2>
          {filename && (
            <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-800/50 rounded">
              {filename}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 shrink-0">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5 p-1.5 rounded-lg border bg-slate-800/40">
            <div className={`p-1 rounded border ${stat.color}`}>
              <stat.icon className="h-3 w-3" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-slate-500 font-medium leading-none">{stat.label}</p>
              <p className="text-sm font-bold text-slate-100 leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar mt-3 space-y-2">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-400 mb-1">Column Types</h3>
          <div className="flex flex-wrap gap-1">
            {Object.entries(profiling.column_types || {}).map(([col, type]) => (
              <span key={col} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-800/50 rounded text-[12px]">
                <span className="font-medium text-slate-300 truncate max-w-[60px]">{col}</span>
                <span className="text-[12px] text-slate-500 bg-slate-700/50 px-1 rounded font-mono">{type}</span>
              </span>
            ))}
          </div>
        </div>

        {Object.keys(profiling.missing_values || {}).length > 0 && (
          <div>
            <h3 className="text-[10px] font-semibold text-slate-400 mb-1">Missing Values</h3>
            <div className="flex flex-wrap gap-1">
              {Object.entries(profiling.missing_values || {}).slice(0, 6).map(([col, count]) => (
                <span key={col} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-800/50 rounded text-[9px]">
                  <span className="font-medium text-slate-300 truncate max-w-[50px]">{col}</span>
                  <span className="text-[8px] text-rose-400 bg-rose-500/10 px-1 rounded border border-rose-500/20">{count}</span>
                </span>
              ))}
              {Object.keys(profiling.missing_values || {}).length > 6 && (
                <span className="text-[8px] text-slate-500">+{Object.keys(profiling.missing_values || {}).length - 6} more</span>
              )}
            </div>
          </div>
        )}

        {hasStats && (
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-300 transition-colors"
          >
            {showStats ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showStats ? 'Hide' : 'Show'} Statistics
          </button>
        )}

        {showStats && hasStats && (
          <div className="overflow-x-auto rounded border border-slate-700/50">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-800/60">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-slate-400">Column</th>
                  <th className="px-2 py-1 text-right font-medium text-slate-400">Mean</th>
                  <th className="px-2 py-1 text-right font-medium text-slate-400">Min</th>
                  <th className="px-2 py-1 text-right font-medium text-slate-400">Max</th>
                  <th className="px-2 py-1 text-right font-medium text-slate-400">Std</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {Object.entries(profiling.basic_stats || {}).map(([col, stats]) => (
                  <tr key={col} className="hover:bg-slate-800/30">
                    <td className="px-2 py-1 font-medium text-slate-300">{col}</td>
                    <td className="px-2 py-1 text-right text-slate-400">{stats.mean?.toFixed(2) || '-'}</td>
                    <td className="px-2 py-1 text-right text-slate-400">{stats.min?.toFixed(2) || '-'}</td>
                    <td className="px-2 py-1 text-right text-slate-400">{stats.max?.toFixed(2) || '-'}</td>
                    <td className="px-2 py-1 text-right text-slate-400">{stats.std?.toFixed(2) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
