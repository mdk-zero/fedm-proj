import { Database, Columns, AlertCircle, FileText } from 'lucide-react'

export default function DataProfiler({ profiling, filename }) {
  if (!profiling) return null

  const missingCount = Object.values(profiling.missing_values || {}).reduce((a, b) => a + b, 0)

  const stats = [
    {
      label: 'Total Rows',
      value: profiling.rows,
      icon: Database,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    },
    {
      label: 'Columns',
      value: profiling.columns,
      icon: Columns,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      label: 'Missing Values',
      value: missingCount,
      icon: AlertCircle,
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    },
    {
      label: 'Data Types',
      value: Object.keys(profiling.column_types || {}).length,
      icon: FileText,
      color: 'bg-violet-500/20 text-violet-400 border-violet-500/30'
    }
  ]

  return (
    <div className="card-dark p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100">Data Profiling</h2>
        {filename && (
          <span className="text-sm text-slate-500 px-3 py-1 bg-slate-800 rounded-full">
            {filename}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl border bg-slate-800/30">
            <div className={`p-2.5 rounded-lg border ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Column Types</h3>
          <div className="space-y-2">
            {Object.entries(profiling.column_types || {}).map(([col, type]) => (
              <div key={col} className="flex justify-between items-center py-2 px-3 bg-slate-800/30 rounded-lg">
                <span className="font-medium text-slate-300">{col}</span>
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded font-mono">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {Object.keys(profiling.missing_values || {}).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Missing Values</h3>
            <div className="space-y-2">
              {Object.entries(profiling.missing_values || {}).map(([col, count]) => (
                <div key={col} className="flex justify-between items-center py-2 px-3 bg-slate-800/30 rounded-lg">
                  <span className="font-medium text-slate-300">{col}</span>
                  <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                    {count} missing
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {Object.keys(profiling.basic_stats || {}).length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Basic Statistics (Numeric Columns)</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Column</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Mean</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Median</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Min</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Max</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-400">Std</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {Object.entries(profiling.basic_stats || {}).map(([col, stats]) => (
                  <tr key={col} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-300">{col}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{stats.mean?.toFixed(2) || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{stats.median?.toFixed(2) || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{stats.min?.toFixed(2) || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{stats.max?.toFixed(2) || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{stats.std?.toFixed(2) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}