import { useState } from 'react'
import { X, BarChart2, PieChart, LineChart, Trash2, Plus, ChevronDown } from 'lucide-react'
import FieldList from './FieldList'
import FieldWell from './FieldWell'
import ChartRenderer from './ChartRenderer'

const CHART_TYPES = [
  { id: 'bar', icon: BarChart2, label: 'Bar', tooltip: 'Compare values across categories' },
  { id: 'pie', icon: PieChart, label: 'Pie', tooltip: 'Show proportion of each category' },
  { id: 'line', icon: LineChart, label: 'Line', tooltip: 'Show trends over time or sequence' }
]

export default function ChartCard({
  id,
  title,
  rows = [],
  values = [],
  chartType = 'bar',
  columnTypes = {},
  sessionId,
  onUpdate,
  onDelete,
  canDelete = true
}) {
  const [showFieldList, setShowFieldList] = useState(true)

  const usedFields = [...rows, ...values.map(v => v.field)]

  const handleAddField = (fieldName, fieldType) => {
    if (fieldType === 'metric' || fieldType === 'date') {
      onUpdate({ 
        values: [...values, { field: fieldName, aggregation: 'count' }] 
      })
    } else {
      if (rows.length === 0) {
        onUpdate({ rows: [fieldName] })
      }
    }
    setShowFieldList(true)
  }

  const handleRemoveRow = (idx) => {
    onUpdate({ rows: rows.filter((_, i) => i !== idx) })
  }

  const handleRemoveValue = (idx) => {
    onUpdate({ values: values.filter((_, i) => i !== idx) })
  }

  const handleAggregationChange = (idx, agg) => {
    const newValues = [...values]
    newValues[idx] = { ...newValues[idx], aggregation: agg }
    onUpdate({ values: newValues })
  }

  const generateTitle = () => {
    if (values.length === 0) return 'New Chart'
    if (rows.length === 0) return 'Add a dimension'
    
    const metricName = values[0].field
    const agg = values[0].aggregation
    const dimName = rows[0]
    
    if (agg === 'count') return `Count by ${dimName}`
    return `${agg.charAt(0).toUpperCase() + agg.slice(1)} of ${metricName} by ${dimName}`
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <input
          type="text"
          value={title || generateTitle()}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="bg-transparent border-none text-slate-100 font-semibold 
                     focus:outline-none focus:ring-2 focus:ring-primary-500/30 rounded px-2 py-1
                     placeholder-slate-500"
          placeholder="Chart Title"
        />
        
        <div className="flex items-center gap-1">
          {CHART_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => onUpdate({ chartType: type.id })}
              className={`
                tooltip p-2 rounded-lg transition-all
                ${chartType === type.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'}
              `}
              title={type.tooltip}
            >
              <type.icon className="h-4 w-4" />
            </button>
          ))}
          {canDelete && (
            <button
              onClick={onDelete}
              className="tooltip p-2 rounded-lg bg-rose-500/20 text-rose-400 
                         hover:bg-rose-500/30 transition-all ml-2"
              title="Delete Chart"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="chart-card-body">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Available Fields
              </span>
              <button
                onClick={() => setShowFieldList(!showFieldList)}
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                {showFieldList ? 'Hide' : 'Show'}
                <ChevronDown className={`w-3 h-3 transition-transform ${showFieldList ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {showFieldList && (
              <div className="border border-slate-700 rounded-lg p-2 max-h-56 overflow-y-auto custom-scrollbar">
                <FieldList
                  columnTypes={columnTypes}
                  onAddField={handleAddField}
                  usedFields={usedFields}
                />
              </div>
            )}
          </div>

          <div className="col-span-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Rows Well */}
              <div className={`
                p-3 rounded-lg border-2 border-dashed transition-colors
                ${rows.length > 0 
                  ? 'border-cyan-500/50 bg-cyan-500/10' 
                  : 'border-slate-600 bg-slate-800/30'}
              `}>
                <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Rows (Dimension)
                </div>
                
                {rows.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-2">
                    Click a dimension to add
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rows.map((r, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded-lg 
                                   bg-slate-800 border border-cyan-500/30"
                      >
                        <span className="text-sm text-slate-200 font-medium">{r}</span>
                        <button
                          onClick={() => handleRemoveRow(idx)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Values Well */}
              <div className={`
                p-3 rounded-lg border-2 border-dashed transition-colors
                ${values.length > 0 
                  ? 'border-emerald-500/50 bg-emerald-500/10' 
                  : 'border-slate-600 bg-slate-800/30'}
              `}>
                <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Values (Metrics)
                </div>
                
                {values.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-2">
                    Click a metric to add
                  </div>
                ) : (
                  <div className="space-y-2">
                    {values.map((v, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded-lg 
                                   bg-slate-800 border border-emerald-500/30"
                      >
                        <span className="text-sm text-slate-200 font-medium">{v.field}</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={v.aggregation || 'count'}
                            onChange={(e) => handleAggregationChange(idx, e.target.value)}
                            className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-300"
                          >
                            <option value="count">Count</option>
                            <option value="sum">Sum</option>
                            <option value="avg">Avg</option>
                            <option value="min">Min</option>
                            <option value="max">Max</option>
                          </select>
                          <button
                            onClick={() => handleRemoveValue(idx)}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chart Renderer */}
            <ChartRenderer
              sessionId={sessionId}
              rows={rows}
              values={values}
              chartType={chartType}
            />
          </div>
        </div>
      </div>
    </div>
  )
}