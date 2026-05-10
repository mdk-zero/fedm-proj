import { useMemo } from 'react'
import { Plus, Hash, BarChart2, Calendar } from 'lucide-react'

export default function FieldList({ columnTypes, onAddField, usedFields = [] }) {
  const { dimensions = [], metrics = [], dates = [] } = columnTypes || {}

  const isUsed = (fieldName) => usedFields.includes(fieldName)

  if (dimensions.length === 0 && metrics.length === 0 && dates.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500 text-center">
        No fields available
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {dimensions.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2 px-1">
            Dimensions ({dimensions.length})
          </div>
          <div className="space-y-1.5">
            {dimensions.map(fieldName => (
              <button
                key={fieldName}
                onClick={() => onAddField(fieldName, 'dimension')}
                disabled={isUsed(fieldName)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                  border transition-all text-sm
                  ${isUsed(fieldName)
                    ? 'bg-slate-800/30 border-slate-700 text-slate-600 cursor-not-allowed'
                    : 'field-item field-item-dimension text-slate-300 hover:text-slate-100'}
                `}
              >
                <span className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-cyan-500" />
                  <span className="font-medium">{fieldName}</span>
                </span>
                <Plus className={`h-4 w-4 ${isUsed(fieldName) ? 'text-slate-600' : 'text-cyan-500'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {metrics.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2 px-1">
            Metrics ({metrics.length})
          </div>
          <div className="space-y-1.5">
            {metrics.map(fieldName => (
              <button
                key={fieldName}
                onClick={() => onAddField(fieldName, 'metric')}
                className="field-item field-item-metric text-sm text-slate-300 hover:text-slate-100"
              >
                <span className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">{fieldName}</span>
                </span>
                <Plus className="h-4 w-4 text-emerald-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {dates.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-2 px-1">
            Dates ({dates.length})
          </div>
          <div className="space-y-1.5">
            {dates.map(fieldName => (
              <button
                key={fieldName}
                onClick={() => onAddField(fieldName, 'date')}
                className="field-item field-item-date text-sm text-slate-300 hover:text-slate-100"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-violet-500" />
                  <span className="font-medium">{fieldName}</span>
                </span>
                <Plus className="h-4 w-4 text-violet-500" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}